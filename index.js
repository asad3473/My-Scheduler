const schedule = require('node-schedule');
const notifier = require('node-notifier');
const { exec } = require('child_process');
const https = require('https'); 
const routine = require('./schedule.json');

const NTFY_TOPIC = "asad_private_routine_987"; 

const quotes = [
  "Discipline equals freedom. Keep pushing.",
  "The expert in anything was once a beginner.",
  "Focus is the highest-paid skill in the modern world."
];

console.log("Bulletproof Mobile-linked scheduler (SAFE HEADERS) is running...");

function formatTime(hour, minute) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  let h = hour % 12;
  h = h ? h : 12;
  const m = minute < 10 ? '0' + minute : minute;
  return `${h}:${m} ${ampm}`;
}

routine.forEach((task, index) => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = task.hour;
  rule.minute = task.minute;

  schedule.scheduleJob(rule, () => {
    let nextTask = routine[index + 1];
    let nextText = nextTask ? `\n\n➡️ NEXT UP: ${nextTask.title} at ${formatTime(nextTask.hour, nextTask.minute)}` : `\n\n➡️ NEXT UP: System Shutdown`;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const finalMessage = `${task.message}${nextText}\n\n💡 "${randomQuote}"`;

    // 1. TRIGGER WINDOWS DESKTOP NOTIFICATION (Emojis are fine here)
    notifier.notify({
      title: `⏳ ${task.title}`,
      message: finalMessage,
      sound: true, 
      wait: true 
    });

    // 2. BULLETPROOF MOBILE ALARM (No emojis in the Title header!)
    const req = https.request({
      hostname: 'ntfy.sh',
      port: 443,
      path: `/${NTFY_TOPIC}`,
      method: 'POST',
      headers: {
        'Title': task.title,             // 🔴 Safe text only
        'Tags': 'hourglass,alarm_clock', // 🔴 ntfy will attach emojis safely
        'Priority': '5'
      }
    }, (res) => {
      console.log(`Mobile sync successful. Status: ${res.statusCode}`);
    });

    req.on('error', (error) => {
      console.error('Mobile network error:', error);
    });

    req.write(finalMessage);
    req.end();

    // 3. HANDLE PC SHUTDOWN
    if (task.action === 'shutdown') {
      exec('shutdown /s /t 60', (err) => {
        if (err) console.error(`Shutdown failed: ${err.message}`);
      });
    }
  });
});