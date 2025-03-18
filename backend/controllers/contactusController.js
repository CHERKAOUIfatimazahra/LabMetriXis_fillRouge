const { sendEmail } = require("../utils/mailer");
require("dotenv").config();

// function pour envoyer un email
exports.contactUs = async (req, res) => {
  try {
    const { name, email, organization, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const adminEmail = process.env.EMAIL;

    if (!adminEmail) {
      return res.status(500).json({ error: "Admin email is not configured" });
    }

    const emailSubject = `New contact form submission from ${name}`;
    const emailText = `
        Name: ${name}
        Email: ${email}
        Organization: ${organization || "Not provided"}

        Message:
        ${message}
    `;

    await sendEmail(adminEmail, emailSubject, emailText);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
