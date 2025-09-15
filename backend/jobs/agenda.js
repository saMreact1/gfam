const Agenda = require('agenda');
const mongoose = require('mongoose');
const Registration = require('../models/registration');
const { sendConfirmationEmail } = require('../services/emailService');
const { sendConfirmationSms } = require('../services/smsService');

const agenda = new Agenda({
  mongo: mongoose.connection, // re-use Mongoose connection
  db: { collection: process.env.AGENDA_COLLECTION || 'agendaJobs' }
});

// job: send reminder
agenda.define('send-reminder', async job => {
  const { registrationId, type } = job.attrs.data;
  const reg = await Registration.findById(registrationId);
  if (!reg) return;

  // guard: avoid duplicate sends
  if (type === 'event24h' && reg.remindersSent.event24h) return;
  if (type === 'event1h' && reg.remindersSent.event1h) return;
  if (type === 'prayer1h' && reg.remindersSent.prayer1h) return;

  // compose message (simple)
  const text = (type === 'prayer1h') ?
    `Reminder: Your prayer slot is at ${new Date(reg.prayerTime).toLocaleString()}. Code: ${reg.code}` :
    `Reminder: Event starts soon. Your code: ${reg.code}. Prayer slot: ${reg.prayerTime ? new Date(reg.prayerTime).toLocaleString() : 'TBD'}. Coord: ${reg.coordinator?.name} ${reg.coordinator?.phone}`;

  // send email & sms (reusing confirmation functions or make new)
  await sendConfirmationEmail(reg, reg.code); // consider a specialized template for reminders
  await sendConfirmationSms(reg, reg.code);

  // mark reminded
  if (type === 'event24h') reg.remindersSent.event24h = true;
  if (type === 'event1h') reg.remindersSent.event1h = true;
  if (type === 'prayer1h') reg.remindersSent.prayer1h = true;
  await reg.save();
});

module.exports = { agenda };
