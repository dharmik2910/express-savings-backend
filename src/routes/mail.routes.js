const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for immediate emailing
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      return cb(null, true);
    }
    const err = new Error("Insurance card must be an image or PDF");
    err.status = 400;
    cb(err);
  },
});

const {
  sendRxMail,
  sendContactMail,
  sendTransferMail,
  sendMedicationAvailabilityMail,
  sendSavingsRequestMail,
} = require("../controllers/mail.controller");

router.post("/rx", sendRxMail);
router.post("/contact", sendContactMail);
router.post("/transfer", sendTransferMail);
router.post("/medication-availability", sendMedicationAvailabilityMail);

// Added upload.single('insuranceCard') to catch the file from the frontend
router.post("/savings-request", upload.single('insuranceCard'), sendSavingsRequestMail);

module.exports = router;