import mongoose from "mongoose";

//define the user model
const userSchema = new mongoose.Schema({

    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},

    verifyOtp: {type: String, default: ''},
    verifyOtpExpire: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    
    resetOtp: {type: String, default: ''},
    resetOtpExpireAt: {type: Number, default: 0}    
});

//create the user model
const userModel = mongoose.model.user || mongoose.model('user',userSchema);

export default userModel;