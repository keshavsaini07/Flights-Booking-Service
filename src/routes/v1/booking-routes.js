const express = require("express");
const { BookingController } = require("../../controllers");

const router = express.Router();

// /api/v1/cities - POST
router.post("/", BookingController.createBooking);


module.exports = router;
