const axios = require('axios');
const { BookingRepository } = require('../repository')
const db = require("../models");
const { ServerConfig } = require("../config");
const { StatusCodes } = require('http-status-codes')
const AppError = require("../utils/errors/app-error");
const { Enums } = require('../utils/common')
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();

async function createBooking(data){
    const transaction = await db.sequelize.transaction();
    try{
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);

        const flightData = flight.data.data;
        if (data.noOfSeats > flightData.totalSeats) {
            throw(new AppError("Not enough seats available in the selected flight", StatusCodes.BAD_REQUEST))
        }

        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount};
        const booking = await bookingRepository.create(bookingPayload, transaction);

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {seats: data.noOfSeats});

        await transaction.commit();
        return booking;
    } 
    catch(error){
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.getBooking(data.bookingId, transaction);

    if(bookingDetails.status == CANCELLED){
        cancelBooking(data.bookingId);
        throw new AppError(
        "The corresponding booking has been cancelled",
        StatusCodes.BAD_REQUEST
        );
    }
    // console.log(bookingDetails);

    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();

    if(currentTime - bookingTime > 300000){
        await bookingRepository.updateBooking(data.bookingId, {status: CANCELLED}, transaction);
        throw new AppError(
        "The payment session has been expired",
        StatusCodes.BAD_REQUEST
        );
    }

    if(bookingDetails.totalCost != data.totalCost){
        throw new AppError(
        "The payment amount does not match",
        StatusCodes.BAD_REQUEST
        );
    }
    
    if(bookingDetails.userId != data.userId){
        throw new AppError(
        "The user corresponding to the booking doesnt match",
        StatusCodes.BAD_REQUEST
        );
    }

    // we will now assume that all checks are clear, and the payment is successful
    await bookingRepository.updateBooking(data.bookingId, {status: BOOKED}, transaction)
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.getBooking(
      data,
      transaction
    );
    console.log(bookingDetails.flightId);

    if(bookingDetails.status == CANCELLED){
        await transaction.commit();
        return true;
    }

    console.log("patch")
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`, {
        seats: bookingDetails.noOfSeats,
        dec: false 
    });

    await bookingRepository.updateBooking(data, { status: CANCELLED }, transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
    createBooking,
    makePayment,
    cancelBooking
}