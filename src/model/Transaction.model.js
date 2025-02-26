import mongoose from "mongoose"; //Define the Transaction Schema
const transactionSchema=new mongoose.Schema({
    product_id:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true,
        min:0,//Amount should not be negative
    },
    status:{
        type:String,
        required:true,
        enum:["PENDING","COMPLETE","FAILED","REFUNDED"],// Example statuses
        default:"PENDING"
    }
},{timestampstrue} //Adds createdAt and updatedAt fields automatically

)
export const Transaction=mongoose.model("Transaction",transactionSchema)