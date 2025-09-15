const twilio = require('twilio');
const client = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ? 
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

async function sendConfirmationSms(att, code) {
  const body = `Hi ${att.firstName}, your registration code: ${code}. Prayer slot: ${att.prayerTime ? new Date(att.prayerTime).toLocaleString() : 'TBD'}. Coord: ${att.coordinator?.name} ${att.coordinator?.phone}`;
  if (!client) {
    console.warn('Twilio not configured. SMS not sent.');
    return;
  }
  await client.messages.create({
    body,
    from: process.env.TWILIO_FROM,
    to: att.phone
  });
}

module.exports = { sendConfirmationSms };
