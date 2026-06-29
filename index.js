const schedule = require("node-schedule");
const https = require("https");
const express = require("express");
const routine = require("./schedule.json");

const app = express();
const PORT = process.env.PORT || 3000;

// Your MacroDroid Webhook URL
const MACRO_URL =
  "https://trigger.macrodroid.com/92969225-7ce2-4d3f-8fc5-35bb7ac85679/routineAlarm";

// Home Route
app.get("/", (req, res) => {
  res.send("✅ Routine Scheduler is LIVE!");
});



// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Schedule all tasks
routine.forEach((task) => {
  // Skip shutdown task
  if (task.action === "shutdown") return;

  const rule = new schedule.RecurrenceRule();
  rule.tz = "Asia/Karachi";
  rule.hour = task.hour;
  rule.minute = task.minute;

  schedule.scheduleJob(rule, () => {
    console.log(`⏰ ${task.title} (${task.hour}:${task.minute})`);

    https
      .get(MACRO_URL, (response) => {
        console.log(`✅ Macro Triggered (${response.statusCode})`);
      })
      .on("error", (err) => {
        console.error("❌ Webhook Error:", err.message);
      });
  });
});