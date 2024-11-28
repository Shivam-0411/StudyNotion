//this is authorization file, here users are made sure as if they are authorzied to visit
const jwt = require("jsonwebtoken");
require("dotenv").config();
const user = require("../models/user");

//auth
exports.auth = async(req, res, next) => {
    try {
        //fetch the token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "");
        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            })
        }

        //veritfy the token
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            console.log(payload);
            req.user = payload;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            })
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating token"
        })
    }
}

//isStudent
exports.isStudent = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "You cannot access student protected route"
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:  "Something went wrong"
        })
    }
}

//isInstructor
exports.isInstructor = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "You cannot access Instructor protected route"
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:  "Something went wrong"
        })
    }
}

//isAdmin
exports.isAdmin = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "You cannot access Admin protected route"
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message:  "Something went wrong"
        })
    }
}