const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { recipients, subject, html, adminToken } = req.body;

    // Basic security check (Admin should pass a token or we check env)
    // In a full production app, we would verify the Firebase ID Token here.
    // For now, we'll ensure required fields are present.
    if (!recipients || !Array.isArray(recipients) || !subject || !html) {
      throw new Error("Missing required fields: recipients (array), subject, or html");
    }

    if (recipients.length === 0) {
      throw new Error("Recipients list is empty");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    // Send emails one by one to monitor progress (or as a batch if preferred)
    // For large lists, you might want to use BCC for efficiency, 
    // but the user wants to select specifically, so individual sends or a small batch is safer for deliverability.
    
    // We will send via BCC if there are multiple recipients to keep it efficient
    const mailOptions = {
      from: `"Pookie Wishes ✨" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to self
      bcc: recipients.join(', '), // BCC everyone else
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: `Email sent successfully to ${recipients.length} recipients`,
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
