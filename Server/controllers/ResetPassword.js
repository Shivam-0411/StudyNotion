const mailSender = require("../utils/mailSender");
const user = require("../models/user");
const bcrypt = require("bcrypt");

//reset password token
exports.resetPasswordToken = async(req, res) => {
    try {
        //fetch user mail
        const { email } = req.body;
        //check if mail exists and validate it
        const existingUser = await user.findOne({email: email});
        if(!existingUser) {
            return res.status(401).json({
                success: false,
                message: "Your email is not registered with us"
            })
        }
        //generate token
        const token = crypto.randomUUID(); //helps to make the reset link secure so that no one else can reset the password
        //update user by adding token and expiration time
        const updatedUser = await user.findOneAndUpdate({email: email}, {token: token, resetPasswordExpires: Date.now() + 5*60*1000}, {new: true});
        //create url
        const url = `http://localhost:3000/update-password/${token}`;
        //send mail
        await mailSender(email, "Reset your password here", `Password reset link: ${url}`);
        //res
        return res.status(200).json({
            success: true,
            message: "Mail sent successfull, check your mail to reset password"
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Something went wrong while sending password reset link"
        })
    }
}

//reset password
exports.resetPassword = async(res, req) => {
    try {
        //fetch data
        const {password, confirmPassword, token} = req.body; //token will be taken from url in frontend
        //validate data
        if(password !== confirmPassword) {
            return res.status(500).json({
                success: false,
                message: "Passwords do not match"
            })
        }
        //Check if the token is associated with the user present in the database
        const userDetails = await user.findOne({token: token});
        //if no entry - then invalid token
        if(!userDetails) {
            return res.json({
                success: false,
                message: "Token is invalid"
            })
        }
        //check token expiration time
        if(userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token expired, try again later"
            })
        }
        //hash password
        const updatedPassword = await bcrypt.hash(password, 10);
        //update password in db
        await user.findOneAndUpdate({token: token}, {password: updatedPassword}, {new: true});
        //response
        return res.status(200).json({
            success: true,
            message: "Password has been resetted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting password"
        })
    }
}