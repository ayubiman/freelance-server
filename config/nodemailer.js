import nodemailer from 'nodemailer';

// 1. Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025, // Mailpit default SMTP port
  secure: false, // false for TLS/STARTTLS
  auth: {
    user: '', // No auth needed for local Mailpit
    pass: ''
  }
});

// 2. Setup email data
// const mailOptions = {
//   from: '"Development" <dev@example.com>',
//   to: 'user@example.com',
//   subject: 'Test Email',
//   text: 'Hello from Mailpit!',
//   html: '<b>Hello from Mailpit!</b>'
// };

// 3. Send mail
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) return console.log(error);
//   console.log('Message sent: %s', info.messageId);
// });

export default transporter;