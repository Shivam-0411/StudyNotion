const section = require("../models/section");
const course = require("../models/course");

exports.createSection = async(req, res) => {
    try {
        //data fetch
        const {sectionName, courseId} = req.body;
        //data validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        //create section entry in db
        const newSection = await section.create({sectionName});
        //attach section id in course schema
        const updatedCourseDetails = await course.findByIdAndUpdate(courseId, {$push: {courseContent: newSection._id}}, {new: true}).populate({
            path: "courseContent",
            populate: ({
                path: "subSection",
            })
        });
        //return res
        return res.status(200).json({
            success: true,
            message: "Section created successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error while creating section. Try again",
            error: error.message
        })
    }
}

exports.updateSection = async(req, res) => {
    try {
        //data fetching
        const {sectionName, sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        //data update in section
        const updatedSection = await section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});
        //res
        return res.status(200).json({
            success: true,
            message: "Section updated successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error while updating section. Try again",
            error: error.message
        })
    }
}

exports.deleteSection = async(req, res) => {
    try {
        const {sectionId} = req.params;
        await section.findByIdAndDelete(sectionId);
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error while deleting section. Try again",
            error: error.message
        })
    }
}