const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60
    }
})

//This function is middleware which will be called before saving the OTP in the database
async function sendVerificationMail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Mail sent by Shivam", emailTemplate(otp));
        console.log("Mail sent successfully" , mailResponse);
    } catch (error) {
        console.log("Error occured while sending mails", error);
        throw error;
    }
}

otpSchema.pre("save", async function(next) {
    await sendVerificationMail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("otp", otpSchema);