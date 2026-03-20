import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import cors from "cors";
import http from 'http';
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js"

const app = express();
const port = process.env.PORT;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));


//api endpoints
app.use('/api/auth', authRouter);
app.get('/', (req, res)=>{
    res.send("API working")
});

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin: "http://localhost:5000",
        methods: ["GET","POST"]
    }
});

io.on("connection",(socket)=>{
    socket.on("send_message", (data)=>{
        socket.to(data.room).emit("recieve_message", data);
    });
});
io.on("join_room", ()=>{
    socket.join(data.room);
});

server.listen(port, ()=>{
    console.log(`server running on port#: ${port}`);
});
