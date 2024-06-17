const nodeMailer = require("nodemailer")
require("dotenv").config()

const sendVerificationEmail = async (user) => {
    const emailHTML = `
    <div>
        <div>
            <h3>Ved.jx Email Verification</h3>
        </div>
        <div>
            <p>Hello ${user.fullName.split(" ")[0].charAt(0).toUpperCase() + user.fullName.split(" ")[0].slice(1).toLowerCase()},</p>
            <p>We have received a request to verify your email address for your account with username <strong>${user.username}</strong>.</p>
            <p>If this was you, please click on the following link to verify your email:</p>
            <p><a href='http://${process.env.CLIENT_HOST}/api/user/verify-email?emailToken=${user.emailToken}'>Verify Your Email</a></p>
            <p>If you did not request this verification, please disregard this email.</p>
            <p>Thank you,<br>Ved.jx Team</p>
        </div>
    </div>
    `
    
    const config = {
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    }

    const transporter = nodeMailer.createTransport(config)

    if (user) {
        const message = {
            from: process.env.EMAIL,
            to: user.email,
            subject: `[Ved.jx]: ${user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase()}'s Email Verification`,
            html: emailHTML
        }

        await transporter.sendMail(message)
        console.log("email officially sent")
    }
}

module.exports = { sendVerificationEmail }