const {instance} = require("../config/razorpay");
const Course = require("../models/course");
const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail.js");
const {default: mongoose} = require("mongoose");

//capture the payment and initiate the razorpay order
exports.capturePayment = async(req, res) => {
    try {
        //get courseId and userId
        const {courseId} = req.body;
        const userId = req.user.id;
        //validation for id's
        if(!courseId) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid course details"
            })
        }

        let course;
        try {
            course = await Course.findById(courseId);
            if(!course) {
                return res.status(400).json({
                    success: false,
                    message: "Course could not be found"
                })
            }

            //check if user already paid or not
            const uid = new mongoose.Types.ObjectId(userId); //userId was in String and in course it is in Object
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({
                    success: false,
                    message: "Student is already enrolled in this course"
                })
            }
        } catch (error) {   
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }

        //create order 
        const amount = course.price;
        const currency = "INR";
        const options = {
            amount : amount * 100,
            currency,
            receipt : Math.random(Date.now()).toString(),
            notes: {
                courseId,
                userId
            }
        }
        try {
            //initate the payment 
            const paymentOrder = await instance.orders.create(options);
            console.log(paymentOrder);
            return res.status(200).json({
                success: true,
                courseName: course.courseName,
                courseDesc: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentOrder.id,
                currency: paymentOrder.currency,
                amount: paymentOrder.amount
            })

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }
        //return response
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Could not create order"
        })
    }
}

exports.verifySignature = async(req, res) => {
    const webhook = "123456";
    const signature = req.headers("x-razorpay-signature");

    const shaSum = crypto.createHmac("sha256" , webhook);
    shaSum.update(JSON.stringify(req.body));
    const digest = shaSum.digest("hex");

    if(digest === signature) {
        console.log("Signature verified");
        const {courseId, userId} = req.body.payload.payments.entity.notes;
        try {
            //find course and update with the student who paid the amount
            const enrolledCourse = await Course.findOneAndUpdate({courseId}, {$push: {studentsEnrolled: courseId}}, {new: true});
            if(!courseEnrolled) {
                return res.status(400).json({
                    success: false,
                    message: "Course not found"
                })
            }
            console.log(enrolledCourse);

            //find the student and add in the list on enrolledcourses
            const enrolledStudent = await User.findOneAndUpdate({userId}, {$push: {courses: courseId}}, {new: true});

            console.log(enrolledStudent);

            //send mail to student
            const emailResponse = await mailSender(enrolledStudent.email, "Congratulations from CodeHelp", "Congratulations, you have successfully registered into a new course");
            return res.status(200).json({
                success: true,
                message: "Successfully registered in a new course"
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    } else {
        return res.status(400).json({
            success: false,
            message: "Something went wrong"
        })
    }
}