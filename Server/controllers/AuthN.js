//this is authentication file, here authentication (process of verifying who the user is) is done that if the user is new or old, if new -> sign up, if old -> login
const user = require("../models/user");
const otpGenerator = require("otp-generator");
const OTP = require("../models/otp");
const bcrypt = require("bcrypt");
const profile = require("../models/profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

//send OTP
exports.sendOTP = async(req, res) => {
    try {
        const {email} = req.body;

        //check if mail already exists or not
        const isMailPresent = await user.findOne({email});

        //if mail present, return with false...if not present, continue
        if(isMailPresent) {
            return res.status(401).json({
                success: false,
                message: "User already exists"
            })
        }

        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        //check if otp is unique
        const result = await OTP.findOne({otp: otp});
        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })

            result = await OTP.findOne({otp: otp});
        }
        console.log(otp);

        //making entry in DB
        const otpPayload = {email, otp};
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        return res.status(200).json({
            success: true,
            message: "OTP Sent successfully",
            otp
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "OTP Could not be sent due to some error"
        })
    }
}

//signup 
exports.signUp = async(req, res) => {
    try {
        //data fetch from user form
        const {firstName, lastName, email, password, confirmPassword, accountType, otp} = req.body;
        //validate credentials - email, passwords, otp, name
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All feilds are mandatory"
            })
        }
        //match passwords - password and confirm password
        if(password !== confirmPassword) {
            res.status(400).json({
                success: false,
                message: "Passwords do not match"
            })
        }
        //check if user already exists
        const existingUser = await user.findOne({email});
        if(existingUser) {
            return res.status(401).json({
                success: false,
                message: "User already exists"
            })
        }
        //find most recent otp from database
        const otpLatest = await OTP.find({email}).sort({createdAt:-1}).limit(1); //otpLatest is an array that contains the latest otp
        console.log(otpLatest);
        //match otps
        if(otpLatest.length == 0) {
            //otp is not found 
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        } else if(otp != otpLatest[0].otp) { //otpLatest[0] is most recent object in the array
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }
        //hash passwords using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        //create entry for profile in DB
        const createProfile = await profile.create({gender: null, dateOfBirth: null, about: null, contactNumber: null});
        //create entry for user in DB
        const newUser = await user.create(
            {
                firstName, 
                lastName, 
                email, 
                password:hashedPassword, 
                accountType, 
                additionalDetails: createProfile._id,
                image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
            }
        )
        //res send
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            newUser
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be created. Try again!"
        })
    }
}

//login
exports.login = async(req, res) => {
    try {
        //get data
        const {email , password} = req.body;
        //validate data
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All feilds are mandatory"
            })
        }
        //check if user exists in DB
        const existingUser = await user.findOne({email});
        if(!existingUser) {
            return res.status(401).json({
                success: false,
                message: "User is not registered with us"
            })
        }
        //check if passwords match
        if(await bcrypt.compare(password, existingUser.password)) {
            //create JWT token
            const payload = {
                email: existingUser.email,
                id: existingUser._id,
                accountType: existingUser.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });
            existingUser.token = token;
            existingUser.password = undefined;
            //create cookies
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            }
            //res send
            return res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                existingUser,
                message: "Logged in successfully",
            })
        }
        return res.status(401).json({
            success: false,
            message: "Password is incorrect"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login failed, try again"
        })
    }
}

//changePassword
exports.changePassword = async(req, res) => {
    try {
        //get data from req body -> email, newPassword, confirmNewPassword
        const {email, newPassword, confirmPassword} = req.body;
        //validate the newPasswords
        if(!newPassword || !confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            })
        }
        if(newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            })
        }
        //fetch user data from user's model by id sent from req
        const userDetails = await user.findOne({email});
        if(!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Error in fetching email"
            })
        }
        //hash the new password
        const newPass = await bcrypt.hash(newPassword, 10);
        //update password in DB
        const updateUser = await user.findOneAndUpdate({email: email}, {password: newPass});
        
        //send mail for updated password
        await mailSender(email, "Password updated", "Your password has been changed");
        //res 
        return res.status(200).json({
            success: true,
            message: "Password has been updated successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while updating password"
        })
    }
}