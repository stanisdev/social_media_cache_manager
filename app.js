'use strict';

const amqp = require('amqplib/callback_api');
const entities = require('./entities');

async function start() {
  return new Promise((resolve, reject) => {

    amqp.connect('amqp://localhost', function(err, connection) {
      if (err) {
        throw err;
      }
      connection.createChannel(function(err, channel) {
        if (err) {
          throw err;
        }
        const queueName = 'socialmedia.cache.forward'; // @todo: get from config

        channel.assertQueue(queueName, { durable: true });
        channel.prefetch(1);
        channel.consume(queueName, function(msg) {
          const content = msg.content.toString();
          const { action, data } = JSON.parse(content);    
          const { correlationId, replyTo } = msg.properties;

          const [entity, method] = action.split('.');

          entities[entity][method](data).then(() => {
            channel.sendToQueue(
              replyTo,
              Buffer.from(JSON.stringify({ correlationId, success: true })),
              { correlationId }
            );
            channel.ack(msg);
          });
        }, { noAck: false });
      });
    });
  });
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});