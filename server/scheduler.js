const cron = require('node-cron');
const watchlistController = require('./controllers/watchlistController');

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

// Task to be scheduled
const task = async () => {
  console.log('Scheduler task is executing...');
  try {
    await watchlistController.startAllServices();
  } catch (error) {
    console.error('Error during service startup:', error.message);
  }
};

// Schedule the task with the correct timezone
const campaignStartTask = cron.schedule(cronSchedule, task, {
  scheduled: true,
  timezone: "Europe/Madrid"
});

const campaignCloseTask = cron.schedule("0 22 * * *", task, {
  scheduled: true,
  timezone: "Europe/Madrid"
});

// Confirm scheduling
console.log('Campaign start task scheduled:', campaignStartTask);
console.log('Campaign end task scheduled:', campaignCloseTask);

module.exports = scheduledTask;