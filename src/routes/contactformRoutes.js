const express = require('express');
const { submitInquiry, getAllInquiries } = require('../controllers/contactformController');

const router = express.Router();

router.post('/contact-submit', submitInquiry);
router.get('/contact-getall', getAllInquiries);

module.exports = router;