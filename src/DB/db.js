import mongoose from "mongoose";
const connectDB=async()=>{
    try {
        const connect= await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`)
        console.log(connect.connection.host)
        console.log("mongodb connected")
    } catch (error) {
        console.log("mongoDB connection error")
    }
}
export {connectDB}