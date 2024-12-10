const cron = require('node-cron');
const dockerController = require('./controllers/dockerController');

// Read scheduler hour and minute from environment variables
const schedulerHour = process.env.SCHEDULER_HOUR || '7';
const schedulerMinute = process.env.SCHEDULER_MINUTE || '0'; 

// Log environment variables for debugging
console.log(`Scheduler Hour: ${schedulerHour}`);
console.log(`Scheduler Minute: ${schedulerMinute}`);

// Format the cron expression
const cronSchedule = `${schedulerMinute} ${schedulerHour} * * *`;

// Log the cron schedule string for debugging
console.log(`Scheduler is set to run at ${schedulerHour}:${schedulerMinute} every day with cron schedule: ${cronSchedule}`);

const getCookiesTask = async () => {
  console.log('Get cookies task is executing...');
  try {
    await dockerController.runCookieMonster();
  } catch (error) {
    console.error('Error during service startup:', error.message);
  }
};

const getCookiesCronjob = cron.schedule("20 1 */3 * *", getCookiesTask, { //cron.schedule("0 0 */2 * *", getCookiesTask, {
  scheduled: true,
  timezone: "Europe/Madrid"
});

const hellasteezeTask = async () => {
  console.log('Scheduler task is executing...');
  try {
    await dockerController.startAllHellasteeze();
  } catch (error) {
    console.error('Error during service startup:', error.message);
  }
};

const campaignStartCronjob = cron.schedule(cronSchedule, hellasteezeTask, {
  scheduled: true,
  timezone: "Europe/Madrid"
});

const campaignEndCronjob = cron.schedule("0 0 * * *", hellasteezeTask, {
  scheduled: true,
  timezone: "Europe/Madrid"
});

console.log('Campaign start cron scheduled:', campaignStartCronjob);
console.log('Campaign end cron scheduled:', campaignEndCronjob);
console.log('Get cookies cron scheduled:', getCookiesCronjob);