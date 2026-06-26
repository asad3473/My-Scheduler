const schedule = require('node-schedule');
const https = require('https');
const express = require('express'); // 🔴 Added Express
const routine = require('./schedule.json');

const app = express();
const NTFY_TOPIC = "asad_private_routine_987"; 

const quotes = [
  "Discipline equals freedom. Keep pushing.",
  "The expert in anything was once a beginner.",
  "Focus is the highest-paid skill in the modern world."
];

// 1. CREATE THE WEB SERVER SO RENDER DOESN'T CRASH
app.get('/', (req, res) => {
  res.send('Background Scheduler is LIVE and monitoring the clock.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cloud Server is awake and listening on port ${PORT}`);
});

function formatTime(hour, minute) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  let h = hour % 12;
  h = h ? h : 12;
  const m = minute < 10 ? '0' + minute : minute;
  return `${h}:${m} ${ampm}`;
}

// 2. THE CLOUD SCHEDULER (Mobile Only)
routine.forEach((task, index) => {
  // Skip the local PC shutdown command if it's still in your JSON
  if (task.action === 'shutdown') return; 

  const rule = new schedule.RecurrenceRule();
  rule.tz = 'Asia/Karachi'; // 🔴 CRITICAL: Syncs cloud server to your local time
  rule.hour = task.hour;
  rule.minute = task.minute;

  schedule.scheduleJob(rule, () => {
    let nextTask = routine[index + 1];
    let nextText = nextTask ? `\n\n➡️ NEXT UP: ${nextTask.title} at ${formatTime(nextTask.hour, nextTask.minute)}` : `\n\n➡️ NEXT UP: Routine Complete`;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const finalMessage = `${task.message}${nextText}\n\n💡 "${randomQuote}"`;

    const req = https.request({
      hostname: 'ntfy.sh',
      port: 443,
      path: `/${NTFY_TOPIC}`,
      method: 'POST',
      headers: {
        'Title': task.title,             
        'Tags': 'hourglass,alarm_clock', 
        'Priority': '5'
      }
    }, (res) => {
      console.log(`Mobile sync successful. Status: ${res.statusCode}`);
    });

    req.on('error', (error) => console.error('Network error:', error));
    req.write(finalMessage);
    req.end();
  });
});