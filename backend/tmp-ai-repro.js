const mongoose = require('mongoose');
require('dotenv').config();
const { askAIAssistant } = require('./controllers/dashboardController');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/weeklyreport');
    const req = { body: { query: 'What did Nipun work on this week?' }, user: { role: 'Manager' } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { console.log(JSON.stringify(payload, null, 2)); }
    };
    const next = (err) => { console.error(err); process.exit(1); };
    await askAIAssistant(req, res, next);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
