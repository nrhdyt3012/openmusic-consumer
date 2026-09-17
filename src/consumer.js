require('dotenv').config();

const ExportsService = require('./services/postgres/ExportsService');
const MailSender = require('./services/mail/MailSender');
const ConsumerService = require('./services/rabbitmq/ConsumerService');

const init = async () => {
  const exportsService = new ExportsService();
  const mailSender = new MailSender();
  const _consumerService = new ConsumerService(exportsService, mailSender);

  console.log('✅ Consumer service is running...');
  console.log('📬 Waiting for messages from RabbitMQ...');
};

init();
