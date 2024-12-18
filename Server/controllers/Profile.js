const Profile = require("../models/profile");
const User = require("../models/user");

exports.updateProfile = async(req, res) => {
    try {
        //get data
        const {dateOfBirth="", gender, contactNumber, about=""} = req.body;
        //get userId
        const id = req.user.id;
        //validate data
        if(!gender || !contactNumber || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        profileDetails.about = about;

        await profileDetails.save();
        //return response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

exports.deleteAccount = async(req, res) => {
    try {
        //HW: schedule a task like deleting account (cron job), unenroll users from all the courses he was enrolled in
        const id = req.user.id;
        const userDetails = await User.findById({_id: id});
        if(!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});
        await User.findByIdAndDelete({_id:id});

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
       
        console.log(userDetails);
        return res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//updateDisplayPicture
