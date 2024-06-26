const express = require('express');
const CRON = require("./utils/common/cron-jobs");
const {ServerConfig, Queue} = require('./config');

const apiRoutes = require('./routes'); 

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);
// app.use('/bookingService/api', apiRoutes);

app.listen(ServerConfig.PORT, async () => {
  console.log(`Server successfully started on port : ${ServerConfig.PORT}`);
  CRON();
  // console.log(ServerConfig.MESSAGE_QUEUE);
  await Queue.connectQueue();
  console.log("Queue Connected")
});

 