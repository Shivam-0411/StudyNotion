const Course = require("../models/course");
const ratingAndReview = require("../models/ratingAndReview");

//create rating
exports.createRating = async(req, res) => {
    try {
        //get user id
        const {userId} = req.user.id;
        //fetch data from req
        const {rating, review, courseId} = req.body;

        //check if user enrolled or not
        const courseDetails = await Course.findOne({_id: courseId}, {studentsEnrolled: userId});
        //or courseDetails = await Course.findOne({_id: courseId}, studentsEnrolled: {$elemMatch: {$eq: userId}})
        if(!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in this course"
            })
        }

        //check if user already rated nd reviewed or not
        const checkRated = await ratingAndReview.findOne({user: userId, course: courseId});
        if(checkRated) {
            return res.status(403).json({
                success: false,
                message: "You cannot review the course again"
            })
        }
        //create new rating
        const newRating = await ratingAndReview.create({rating, review, course: courseId, user: userId});
        //update course rating
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, {$push: {ratingAndReviews: newRating._id}}, {new: true});
        console.log(updatedCourseDetails);
        //return res
        return res.status(200).json({
            success: true,
            message: "Rating and Review successfully created",
            newRating
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Rating and Review could not be created",
        })
    }
}

//get average rating
exports.getAverageRating = async(req, res) => {
    try {
        //get course id
        const courseId = req.body.courseId;
        //calculate average rating
        const result = await ratingAndReview.aggregate([
            {
                $match: {
                    Course: new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ])

        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            })
        } 

        //res
        return res.status(200).json({
            success: true,
            message: "No rating and review found",
            averageRating: 0
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//get all ratingAndReview
exports.getAllRating = async(req, res) => {
    try {
        const allRating = await ratingAndReview.find({}).sort({rating: "desc"}).populate({
            path: "user",
            select: "firstName lastName email image"
        }).populate({
            path: "course",
            select: "courseName"
        }).exec();

        return res.status(200).json({
            success: true,
            message: "All rating and reviews fetched successfully",
            allRating
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//get ratingAndReview by course
exports.getRatingByCourse = async(req, res) => {
    try {
        //get course id
        const courseId = req.body.courseId;
        //fetch rating of that course
        const ratingByCourse = await ratingAndReview.find({course: courseId}).sort({rating: "desc"}).populate({path: "ratingAndReviews", select: "rating"}).exec();
        //validate for rating
        if(ratingByCourse.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No rating found for this course"
            })
        }
        //return res
        return res.status(200).json({
            success: true,
            message: "Rating and review fetched successfully",
            ratingByCourse
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}