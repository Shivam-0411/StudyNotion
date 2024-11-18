//this is authentication file, here authentication (process of verifying who the user is) is done that if the user is new or old, if new -> sign up, if old -> login

const user = require("../models/user");
const otpGenerator = require("otp-generator");
const otp = require("../models/otp");
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
            res.status(401).json({
                success: false,
                message: "User already exists"
            })
        }

        //generate OTP
        var OTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        //check if otp is unique
        const result = await otp.findOne({otp: OTP});
        while(result) {
            OTP = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })

            result = await otp.findOne({otp: otp});
        }
        console.log(OTP);

        //making entry in DB
        const otpPayload = {email, OTP};
        const otpBody = await otp.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success: true,
            message: "OTP Sent successfully",
            OTP
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
        const {firstName, lastName, email, password, confirmPassword, accountType, OTP} = req.body;
        //validate credentials - email, passwords, otp, name
        if(!firstName || !lastName || !email || !password || !confirmPassword || !OTP) {
            res.status(403).json({
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
            res.status(401).json({
                success: false,
                message: "User already exists"
            })
        }
        //find most recent otp from database
        const otpLatest = await otp.find({email}).sort({createdAt:-1}).limit(1);
        console.log(otpLatest);
        //match otps
        if(otpLatest.length == 0) {
            //otp is not found 
            res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        } else if(otpLatest.otp != OTP) {
            res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }
        //hash passwords using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        //create entry in DB
        const createProfile = await profile.create({gender: null, dateOfBirth: null, about: null, contactNumber: null});
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
        res.status(200).json({
            success: true,
            message: "User registered successfully"
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
        const existsingUser = await user.findOne({email});
        if(!existsingUser) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }
        //check if passwords match
        if(await bcrypt.compare(password, existsingUser.password)) {
            //create JWT token
            const payload = {
                email: existsingUser.email,
                id: existsingUser._id,
                role: existsingUser.role
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });
            existsingUser.token = token;
            existsingUser.password = undefined;
            //create cookies
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            }
            //res send
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                existsingUser,
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
        //get data from req body -> oldPassword, newPassword, confirmNewPassword
        const {newPassword, confirmPassword} = req.body;
        //validate the newPasswords
        if(newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            })
        }
        //update password in DB -> probably populate krenge for getting user email to which we can send mail
        
        //send mail for updated password
        await mailSender(email, "Password updated", "Your password has been changed");
        //res 
    } catch (error) {
        
    }
}