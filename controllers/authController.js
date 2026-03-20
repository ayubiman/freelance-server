import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';

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