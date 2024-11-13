const user = require("../models/user");
const otpGenerator = require("otp-generator");

//send OTP
exports.sendOTP = async(req, res) => {
    try {
        const {email} = req.body;

        //check if mail already exists or not
        const isMailPresent = await user.findOne({email});

        //if mail present, return with false...if not present, continue
        if(isMailPresent) {
            res.status(401).json({
                success: false,
                message: "User already exists"
            })
        }

        var otp = otpGenerator.generate(6, {
            
        })
    } catch (error) {
        
    }
}

//signup 
exports.signUp = async(req, res) => {

}

//login

//changePassword