const user = require("../models/user");
const Category = require("../models/category");
const course = require("../models/course");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create courses function
exports.createCourse = async(req, res) => {
    try {
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;
        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //check for instructor details
        const userId = req.user.id; 
        const instructorDetails = await user.findById(userId);
        console.log("Instructor Details", instructorDetails);

        if(!instructorDetails) {
            return res.status(400).json({
                success: false,
                message: "Instructor not found"
            })
        }

        //tag validation
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            })
        }

        //upload to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create entry for new course in DB
        const newCourse = await course.create(
            {
                courseName, 
                courseDescription, 
                instructor: instructorDetails._id,
                whatYouWillLearn: whatYouWillLearn, 
                category: categoryDetails._id,
                thumbnail: thumbnailImage.secure_url
            }
        )

        //add the course id to user collection in DB
        await user.findByIdAndUpdate({instructorDetails: instructorDetails._id}, {$push: {courses: newCourse}}, {new: true});

        //update category collection in DB
        await Category.findByIdAndUpdate({categoryDetails: categoryDetails._id}, {$push: {course: newCourse}}, {new: true});

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            newCourse
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating course",
            error: error.message
        })
    }
} 

//get all courses function
exports.showAllCourses = async(req, res) => {
    try {

        const allCourses = await course.find({}, {
            courseName: true, price: true, instructor: true, studentsEnrolled: true, ratingAndReviews: true, thumbnail: true
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            allCourses
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch all courses",
            error: error.message
        })
    }
}