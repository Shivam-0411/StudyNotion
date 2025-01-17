const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
    },
    courseDescription: {
        type: String,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    whatYouWillLearn: {
        type: String,
    },
    courseContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "section",
    }],
    ratingAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ratingAndReview",
    }],
    price: {
        type: Number
    },
    thumbnail: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    tag: {
        type: String,
    },
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    status: {
        type: String,
        enum: ["Draft", "Published"]
    }
})

module.exports = mongoose.model("course", courseSchema);