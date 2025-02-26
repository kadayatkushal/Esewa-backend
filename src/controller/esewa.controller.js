import { EsewaPaymentGateway, EsewaCheckStatus } from "esewajs"; // Import eSewa payment gateway functions
import { Transaction } from "../model/Transaction.model.js"; // Import Transaction model

// Function to initiate a payment request to eSewa
const EsewaInitiatePayment = async (req, res) => {
  const { amount, productId } = req.body; // Extract amount and product ID from request body

  try {
    // Call the eSewa payment gateway function with required parameters
    const reqPayment = await EsewaPaymentGateway(
      amount, // Payment amount
      0, 
      0, 
      0, 
      productId, 
      process.env.MERCHANT_ID, 
      process.env.SECRET, 
      process.env.SUCCESS_URL, 
      process.env.FAILURE_URL,
      process.env.ESEWAPAYMENT_URL, 
      undefined, 
      undefined 
    );

    // If payment request fails, return an error response
    if (!reqPayment) {
      return res.status(400).json("Error sending data");
    }

    // If payment request is successful, store transaction in the database
    if (reqPayment.status === 200) {
      const transaction = new Transaction({
        product_id: productId, // Store product ID
        amount: amount, // Store payment amount
      });

      await transaction.save(); // Save transaction to database

      console.log("Transaction passed");

      // Send payment URL to the client for redirection
      return res.send({
        url: reqPayment.request.res.responseUrl,
      });
    }
  } catch (error) {
    return res.status(400).json("Error sending data"); // Handle errors
  }
};

// Function to check the status of a payment
const paymentStatus = async (req, res) => {
  const { product_id } = req.body; // Extract product ID from request body

  try {
    // Find the transaction in the database using product ID
    const transaction = await Transaction.findOne({ product_id });

    // If transaction is not found, return an error response
    if (!transaction) {
      return res.status(400).json({ message: "Transaction not found" });
    }

    // Call eSewa to check the payment status
    const paymentStatusCheck = await EsewaCheckStatus(
      transaction.amount, // Amount of the transaction
      transaction.product_id, // Product ID associated with the transaction
      process.env.MERCHANT_ID, // Merchant ID
      process.env.ESEWAPAYMENT_STATUS_CHECK_URL // eSewa payment status check URL
    );

    // If status check is successful, update the transaction status in the database
    if (paymentStatusCheck.status === 200) {
      transaction.status = paymentStatusCheck.data.status; // Update transaction status
      await transaction.save(); // Save updated transaction to database

      return res
        .status(200)
        .json({ message: "Transaction status updated successfully" });
    }
  } catch (error) {
    console.error("Error updating transaction status:", error); // Log error for debugging
    res.status(500).json({ message: "Server error", error: error.message }); // Return server error response
  }
};

// Export the functions for use in other parts of the application
export { EsewaInitiatePayment, paymentStatus };
