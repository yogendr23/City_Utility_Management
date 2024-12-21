// src/emailController.js
const mailjet = require('node-mailjet').connect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
  );
  
  const sendEmail = async (req, res) => {
    const { to, subject, data } = req.body; // Expecting "to", "subject", and "data" fields
    if (!to || !subject || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_SENDER_EMAIL, // Replace with sender's email
              Name: 'City Manager'
            },
            To: [
              {
                Email: to
              }
            ],
            Subject: subject,
            TextPart: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
          }
        ]
      });
  
      await request;
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  };
  
  module.exports = { sendEmail };
  