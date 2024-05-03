const express = require("express");
const { BookingController } = require("../../controllers");

const router = express.Router();

// /api/v1/bookings - POST
router.post("/", BookingController.createBooking);

// /api/v1/bookings/payments - POST
router.post("/payments", BookingController.makePayment);

module.exports = router;
