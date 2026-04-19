const mongoose = require("mongoose");
const timeLogSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  hoursWorked: Number,
  workDescription: String,
  logDate: Date
}, {
  timestamps: true
});
const emitRefresh = (doc) => {
  if (global.io && doc && doc.developerId) {
    global.io.to(`user_${doc.developerId}`).emit("dashboard_refresh");
  }
};

timeLogSchema.post("save", emitRefresh);
timeLogSchema.post("findOneAndDelete", emitRefresh);
timeLogSchema.post("findOneAndUpdate", emitRefresh);

module.exports = mongoose.model("timelog", timeLogSchema);