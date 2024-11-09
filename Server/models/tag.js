const mongoose = require("mongoose");

const tagsSection = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    description: {
        type: String,
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course"
    }
})

module.exports = mongoose.model("tag", tagsSection);