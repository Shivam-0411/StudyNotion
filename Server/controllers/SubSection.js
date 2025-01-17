const section = require("../models/section");
const subSection = require("../models/subSection");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
// require("dotenv").config();

exports.createSubsection = async(req, res) => {
    try {
        //fetch data from req 
        const {sectionId, title, timeDuration, description} = req.body;
        //extract video/file
        const video = req.files.thumbnail;
        //validation
        if(!sectionId || !title || !timeDuration || !description  || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //create a subsection
        const subSectionDetails = await subSection.create({
            title: title,
            description: description,
            timeDuration: timeDuration,
            videoUrl: uploadDetails.secure_url
        })
        //update section
        const updatedSection = await section.findByIdAndUpdate({_id: sectionId}, {$push: {subSection: subSectionDetails._id}}, {new: true}).populate("subSection").exec();
        console.log(updatedSection);

        //return res
        return res.status(200).json({
            success: true,
            message: "SubSection created successfully",
            updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating subsection",
            error: error.message
        })
    }
}

exports.updateSubsection = async(req, res) => {
    try {
        //updated data fetch
        const {subSectionId, title, timeDuration, description} = req.body;
        const video = req.files.thumbnail;

        const SubSection = await subSection.findById(subSectionId);

        if(!SubSection) {
            return res.status(400).json({
                success: false,
                message: "No such subsection exists"
            })
        }
        
        if(title) {
            SubSection.title = title;
        }
        if(description) {
            SubSection.description = description;
        }
        if(timeDuration) {
            SubSection.timeDuration = timeDuration;
        }

        if(video) {
            //upload the new thumbnail on cloudinary
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            SubSection.videoUrl = uploadDetails.secure_url;
        }

        //update the data in db
        await SubSection.save();
        //return response
        return res.status(200).json({
            success: true,
            message: "Subsection updated successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating subsection",
            error: error.message
        })
    }
}

exports.deleteSubsection = async(req, res) => {
    try {
        const {sectionId, subSectionId} = req.body;
        if(!sectionId || !subSectionId) {
            return res.status(400).json({
                success: false,
                message: "Either of section or subsection does not exists"
            })
        }

        //update section and remove subsection
        await section.updateOne({_id: sectionId}, {$pull: {subSection: subSectionId}});;
        await subSection.findByIdAndDelete(subSectionId);

        return res.status(200).json({
            success: true,
            message: "Subsection successfully removed"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting subsection",
            error: error.message
        })
    }
}