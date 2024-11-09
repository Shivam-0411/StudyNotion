const user = require("../models/user");
const otpgenerator = require("otp-generator");
//send OTP
module.exports = async(req, res) => {
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

    const otp = otpgenerator
}

//signup 

//login

//changePassword