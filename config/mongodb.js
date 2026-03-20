import mongoose from "mongoose";

const connectDB = async()=>{
    const dbName = process.env.MONGODB_URI + process.env.DATABASE_NAME;
    console.log("attempting a DB connection to: ", dbName);
    
    
    mongoose.connection.on('connected', ()=>{
        console.log("Database Successfully Connected on: ", dbName);
    });
    //await mongoose.connect(`${process.env.MONGODB_URI}/FreelanceFederation`).then(()=>{console.log("connection succesful");});
    await mongoose.connect(dbName);
}

export default connectDB;