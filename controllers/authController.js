import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import { text } from 'express';
import transporter from '../config/nodemailer.js';

//registering the user
export const register = async (req, res)=>{

    //extract data from the request body when the user sends a post request to register a user
    const {name, email, password} = req.body;

    //check if the data sent is sufficient to register a user
    //return a failed message
    if(!name||!email||!password){ 
        return res.json({
            success: false, 
            message:"insuficient data"
        }); 
    }
    //Begin registering the user
    try{
        //check if the user already exists
        //return success false message if user exists
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({
                success: false,
                message: "User already exists"
            });
        }
        //creating a new user and saving
        const hashedPassword = await bcrypt.hash(password, 10); //incript the password medium difficulty
        const user = new userModel({name, email, password:hashedPassword});
        await user.save();
        //await user.save().then(()=>{console.log("[status: sucess]: new user saved [name: "+name+"]")});

        //generate the authentication token, store it in the server side cookies, only acceessible through http request, set to development environment
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        console.log("the generated token = ", token);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV ==='production', //production = true
            sameSite: process.env.NODE_ENV ==='production' ? 'none' : 'strict', //development = strict
            maxAge: 7 * 24 * 60 * 60 * 1000 //set the expiration to 7 days in milliseconds
        });

        //sending welcome email
        const mailOptions = {
            from: "",
            to: email,
            subject: "Welcome to Freelance Federation",
            text:"Welcome"
        }
        //sending the email
        await transporter.sendMail(mailOptions);

        return res.json({success: true, message:"user is registered"});

    }catch(error){
        //when creating the user fails, send the error message
        return res.json({success: false, message: error.message});
    }
};

//loging in the user
export const login = async (req, res)=>{
    const {email, password} = req.body;
    if(!email||!password){ 
        return res.json({
            success: false, 
            message:"insuficient data"
        }); 
    }
    try{
        const user = await userModel.findOne({email});
        //exit conditions
        if(!user){
            return res.json({success: false, message: "invalid email"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success: false, message: "wrong password"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
                
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV ==='production', //production = true
            sameSite: process.env.NODE_ENV ==='production' ? 'none' : 'strict', //development = strict
            maxAge: 7 * 24 * 60 * 60 * 1000 //set the expiration to 7 days in milliseconds
        });

        return res.json({success: true, message:"user logged in"});

    }catch(error){
        return res.json({success: false, message: error.message});
    }

};

export const logout = async (req, res)=>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV ==='production', //production = true
            sameSite: process.env.NODE_ENV ==='production' ? 'none' : 'strict', //development = strict
            maxAge: 7 * 24 * 60 * 60 * 1000 //set the expiration to 7 days in milliseconds
        })
        return res.json({success: true, message: "user loged out"})
    }catch(error){
        return res.json({success: false, message: error.message})
    }
}

export const verifyOtp = async(req,res)=>{
    //console.log("sent otp");
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success: false, message:"Account already verified"});
        }
        let otp = String(Math.floor(100000+Math.random()*900000));
        //console.log("otp = "+otp);
        user.verifyOtp = otp;
        
        user.verifyOtpExpire = Date.now()+ 24*60*60*1000; //expires in 24hrs in milliseconds
        await user.save();

        const mailOptions = {
            from: "admin@freelancefederation.com",
            to: user.email,
            subject: "Account Verification OTP",
            text:"Please use this OTP ["+otp+"]code to verify your account"
        }
        await transporter.sendMail(mailOptions);
        //console.log("sent otp2");
        return res.json({success: true, message: "OTP sent"})
    }catch(error){
        return res.json({success: false, message: error.message+"**"});
    }
}

export const verifyEmail = async(req, res)=>{
    const {userId, otp} = req.body;
    if(!userId|| !otp){
            return res.json({success: false, message:"missing details"});
    }
    try{
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success: false, message:"User Not Found"});
        }
        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message:"Invalid Otp"});
        }
        if(user.verifyOtpExpiresAt < Date.now()){
            return res.json({success: false, message:"Otp Expired"});
        }
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiresAt = 0;
        await user.save();
        return res.json({success: true, message: "Account is verified"});
    }catch(error){
        return res.json({success: false, message: error.message+"****"});
    }
}

export const isAuthenticated = async(req, res)=>{
    try{
        return res.json({success: true});
    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

export const sendResetOtp = async(req, res)=>{
    const {email} = req.body;

    if(!email){
        return res.json({success: false, message:"email required"});
    }
    try{
        const {email} = req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message:"User Not Found"});
        }
        let otp = String(Math.floor(100000+Math.random()*900000));
        //console.log("otp = "+otp);
        user.resetOtp = otp;
        
        user.resetOtpExpire = Date.now()+ 15*60*1000; //expires in 15min in milliseconds
        await user.save();

        const mailOptions = {
            from: "admin@freelancefederation.com",
            to: user.email,
            subject: "Password Reset OTP",
            text:"Please use this OTP ["+otp+"]code to reset password"
        }
        await transporter.sendMail(mailOptions);
        //console.log("sent otp2");
        return res.json({success: true, message: "Password reset OTP sent"})

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

export const resetPassword = async(req, res)=>{
    const {email, otp, newPassword} = req.body;
    if(!email||!otp||!newPassword){
            return res.json({success: false, message:"email, otp, newPassword are required"});
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message:"User Not Found"});
        }
        
        if(user.resetOtp === ""|| user.resetOtp!==otp){
            return res.json({success: false, message:"invalid OTP"});
        }
        if(user.resetOtpExpire < Date.now()){
            return res.json({success: false, message:"OTP expired"});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpire = 0;
        await user.save();
        return res.json({success: true, message: "password reset succeefuly"})

    }catch(error){
        return res.json({success: false, message: error.message});

    }
}