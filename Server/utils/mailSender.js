const nodemailer = require("nodemailer");

const mailSender = async(email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        let sender = await transporter.sendMail({
            from: "Shivam Choudhary",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        
        console.log(sender);
        return sender;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;