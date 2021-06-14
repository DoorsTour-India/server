const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1. Create a Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //ACTIVATE in gmail 'Less secure app' option
  });

  //2. Define email options
  const mailOptions = {
    from: 'Kanishk Sharma <hello@kanishk.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  //3. Send Email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
