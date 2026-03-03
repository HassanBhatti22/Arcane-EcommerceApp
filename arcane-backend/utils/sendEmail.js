const nodemailer = require('nodemailer');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const sendEmail = async ({ to, subject, text, html }) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Arcane Shop" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('SMTP Error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;