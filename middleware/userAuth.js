import jwt from 'jsonwebtoken';

const userAuth = async(req, res, next)=>{
    const {token} = req.cookies;
    console.log(token);
    if(!token){
        return res.json({success: false, message:"Not Authorized. Login again"});
    }
    try{
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if(tokenDecode){
            console.log("tokenDecode =",tokenDecode);
            req.body.userId = tokenDecode.id;
        }else{
            return res.json({success: false, message:"Not Authorized. Login again"});
        }
        console.log("req.body.userId = ", req.body.userId);
        next();

    }catch(error){
        return res.json({success: false, message: error.message+"****"});
    }
}
export default userAuth;