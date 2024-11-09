const nodemailer = require("nodemailer");

const mailSender = async(email, title, body) => {
    try {
        let transporter = await nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_HOST,
                pass: process.env.MAIL_PASS
            }
        })

        let info = await transporter.sendMail({
            from: "Shivam Choudhary",
            to: "shivamchoudhary041103@gmail.com",
            subject: `${title}`,
            html: `${body}`
        })
        
        console.log(info)
        return info;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;