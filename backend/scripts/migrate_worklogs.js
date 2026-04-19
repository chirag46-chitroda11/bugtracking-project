const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });
const TimeLog = require("../src/models/timelogModel");

mongoose.connect(process.env.MONGO_URL).then(async () => {
    console.log("Connected to DB...");
    const logs = await TimeLog.find({ logDate: { $exists: false } });
    let count = 0;
    for (let log of logs) {
        log.logDate = log.createdAt || new Date();
        // Since strict prevents writing description generically, workDescription remains unrecovered.
        await log.save();
        count++;
    }
    console.log(`Successfully normalized ${count} legacy worklogs with valid logDates.`);
    process.exit();
}).catch(err => {
    console.error("Migration failed", err);
    process.exit(1);
});
