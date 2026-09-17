const nodemailer = require('nodemailer');

class MailSender {
  constructor() {
    console.log('📧 Initializing MailSender...');
    console.log('- Host:', process.env.SMTP_HOST);
    console.log('- Port:', process.env.SMTP_PORT);
    console.log('- User:', process.env.SMTP_USER);

    const port = parseInt(process.env.SMTP_PORT);

    // Konfigurasi untuk Mailtrap (port 2525)
    const config = {
      host: process.env.SMTP_HOST,
      port: port,
      secure: false, // Mailtrap menggunakan STARTTLS, bukan SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // Untuk Mailtrap, tidak perlu secure connection
    if (port === 2525 || port === 587) {
      config.tls = {
        rejectUnauthorized: false,
      };
    }

    this._transporter = nodemailer.createTransport(config);

    console.log('✅ SMTP Transporter created for Mailtrap');
  }

  async sendEmail(targetEmail, content) {
    console.log('\n📤 Preparing to send email...');
    console.log(`   To: ${targetEmail}`);
    console.log('   From: OpenMusic <noreply@openmusic.com>');

    const message = {
      from: '"OpenMusic Apps" <noreply@openmusic.com>',
      to: targetEmail,
      subject: 'Ekspor Playlist',
      text: 'Terlampir hasil dari ekspor playlist',
      html: `
        <h2>Ekspor Playlist OpenMusic</h2>
        <p>Halo,</p>
        <p>Terlampir adalah hasil ekspor playlist yang Anda minta.</p>
        <p>Terima kasih telah menggunakan OpenMusic!</p>
        <br>
        <p><em>- OpenMusic Team</em></p>
      `,
      attachments: [
        {
          filename: 'playlist.json',
          content,
          contentType: 'application/json',
        },
      ],
    };

    try {
      console.log('📧 Sending email via SMTP...');
      const result = await this._transporter.sendMail(message);
      console.log('✅ Email sent successfully!');
      console.log('   Message ID:', result.messageId);
      console.log('   Response:', result.response);
      return result;
    } catch (error) {
      console.error('❌ Failed to send email!');
      console.error('   Error:', error.message);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      console.log('🔍 Verifying SMTP connection...');
      await this._transporter.verify();
      console.log('✅ SMTP connection verified!');
      return true;
    } catch (error) {
      console.error('❌ SMTP verification failed:', error.message);
      return false;
    }
  }
}

module.exports = MailSender;
