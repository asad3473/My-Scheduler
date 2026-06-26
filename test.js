const https = require('https');
const NTFY_TOPIC = "asad_private_routine_987";

console.log("Sending INSTANT Max Priority Alarm...");

const req = https.request({
  hostname: 'ntfy.sh',
  port: 443,
  path: `/${NTFY_TOPIC}`,
  method: 'POST',
  headers: {
    'Title': 'LOUD ALARM TEST',
    'Tags': 'rotating_light,alarm_clock',
    'Priority': '5' // 🔴 This forces Android to trigger the loud channel
  }
}, (res) => {
  console.log(`Server Status: ${res.statusCode} - Check your phone NOW!`);
});

req.on('error', (error) => console.error(error));
req.write("If this rings loudly, the Priority 5 alarm works perfectly!");
req.end();