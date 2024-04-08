const nodemailer = require("nodemailer");
const config = require("../config/config");


// Create a transporter object using SMTP transport

const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
        user:config.emailUser,
        pass:config.emailPasssword
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
    },
});

//sent otp to mail for forget password

const sendInsertOtp = async (email, otp) => {
    const mailOptions = {
        from: '"NailStyle" <babsauto958@gmail.com>',
        to: email,
        subject: 'Your one time password , NailStyle',
        text: `Hi, Your OTP is ${otp}`
    };

    try {
        console.log('Anusreeeeeeeeeee');
        const info = await transporter.sendMail(mailOptions);
        console.log("Email send Successfull: ", info.response);
      console.log(otp);
        return otp;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send otp');
    }
};


module.exports = { sendInsertOtp };