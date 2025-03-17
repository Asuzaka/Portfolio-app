const nodemailer = require("nodemailer");

async function sendEmail(options) {
  console.log(options);
  // Creating transporter
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  // Sending mail
  await transporter.sendMail({
    from: "Ligvado co. <ligvado@gamer.io>", // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  });
}

module.exports = sendEmail;
