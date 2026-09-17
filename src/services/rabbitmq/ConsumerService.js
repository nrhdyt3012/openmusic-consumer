const amqp = require('amqplib');

class ConsumerService {
  constructor(exportsService, mailSender) {
    this._exportsService = exportsService;
    this._mailSender = mailSender;

    this._consume();
  }

  async _consume() {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
      const channel = await connection.createChannel();

      await channel.assertQueue('export:playlist', {
        durable: true,
      });

      channel.prefetch(1);

      console.log('✅ Connected to RabbitMQ');
      console.log('📬 Listening to queue: export:playlist');

      channel.consume('export:playlist', async (message) => {
        try {
          const { playlistId, targetEmail } = JSON.parse(
            message.content.toString(),
          );

          console.log('\n📨 Processing export request:');
          console.log(`   Playlist ID: ${playlistId}`);
          console.log(`   Target Email: ${targetEmail}`);

          const playlist = await this._exportsService.getPlaylistById(
            playlistId,
          );

          await this._mailSender.sendEmail(
            targetEmail,
            JSON.stringify(playlist),
          );

          console.log(`✅ Export sent successfully to: ${targetEmail}\n`);

          channel.ack(message);
        } catch (error) {
          console.error('❌ Error processing message:', error.message);
          channel.ack(message);
        }
      });
    } catch (error) {
      console.error('❌ Failed to consume messages:', error.message);
      setTimeout(() => this._consume(), 5000);
    }
  }
}

module.exports = ConsumerService;
