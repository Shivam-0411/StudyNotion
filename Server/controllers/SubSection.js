const subSection = require("../models/subSection");
const section = require("../models/section");
const {uploadImageToClodinary} = require("../utils/imageUploader");
// require("dotenv").config();


exports.createSubSection = async(req, res) => {
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
        //upload video to cloudinart
        const uploadDetails = await uploadImageToClodinary(video, process.env.FOLDER_NAME);
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
            message: "Something went wrong while creating subsection"
        })
    }
}

// -> HW - delete subsection
exports.updateSubsection = async(req, res) => {
    try {
        //updated data fetch
        const {sectionId, subSectionId, title, timeDuration, description} = req.body;
        const video = req.files.thumbnail;

        const subSection = await subSection.findById(subSectionId);
        if(!subSection) {
            return res.status(400).json({
                success: false,
                message: "No such subsection exists"
            })
        }
        
        if(title) {
            subSection.title = title;
        }
        if(description) {
            subSection.description = description;
        }
        if(timeDuration) {
            subSection.timeDuration = timeDuration;
        }

        if(video) {
            //upload the new thumbnail on cloudinary
            const uploadDetails = await uploadImageToClodinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
        }

        //update the data in db
        await subSection.save();
        //return response
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating subsection"
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
        
        const updatedSection = await section.findByIdAndDelete({subSectionId});
        return res.status(200).json({
            success: true,
            message: "Subsection successfully removed"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting subsection"
        })
    }
}