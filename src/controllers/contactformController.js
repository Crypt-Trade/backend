const ContactForm = require('../models/ContactForm');

// POST /contact - Submit Inquiry
const submitInquiry = async (req, res) => {
  try {
    const { name, phoneNo, email, message } = req.body;

    if (!name || !phoneNo || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newInquiry = await ContactForm.create({ name, phoneNo, email, message });

    res.status(201).json({ message: "Inquiry submitted successfully.", inquiry: newInquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /contact - Fetch All Inquiries
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await ContactForm.find().sort({ submittedAt: -1 });
    res.status(200).json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitInquiry,
  getAllInquiries
};