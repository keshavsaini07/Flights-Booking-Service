const ampqlib = require("amqplib");
const ServerConfig = require("./server-config");

let channel, connection;

async function connectQueue() {
  try {
    connection = await ampqlib.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(ServerConfig.MESSAGE_QUEUE);

    } catch (error) {
        console.log(error);
    }
}

async function sendData(data){
    try {
        await channel.sendToQueue(
          ServerConfig.MESSAGE_QUEUE,
          Buffer.from(JSON.stringify(data))
        );
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    connectQueue,
    sendData
}
