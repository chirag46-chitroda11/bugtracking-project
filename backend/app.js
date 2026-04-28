const express = require("express")
const app = express()
const http = require("http")
const { Server } = require("socket.io")

const cors = require("cors")

require("dotenv").config()

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://fixify46.vercel.app",
  "https://fixify-six.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.options(/.*/, cors());

app.use(express.json({ limit: "50mb" }))

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
})

// Make io accessible in controllers via req.app.get("io")
app.set("io", io)
global.io = io;

io.on("connection", (socket) => {
  // console.log("Socket connected:", socket.id); // Disabled noisy logs

  socket.on("join_role", (role) => {
    socket.join(`role_${role}`);
  });

  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on("disconnect", () => {
    // console.log("Socket disconnected:", socket.id); // Disabled noisy logs
  })
})

const DBConnection = require("./src/utils/DBConnection")
DBConnection()

const userRoutes = require("./src/routes/userRoutes")
app.use("/user", userRoutes)

const bugRoutes = require("./src/routes/bugRoutes")
app.use("/bug", bugRoutes)

const moduleRoutes = require("./src/routes/moduleRoutes")
app.use("/module", moduleRoutes)

const projectRoutes = require("./src/routes/projectRoutes")
app.use("/project", projectRoutes)

const taskRoutes = require("./src/routes/taskRoutes")
app.use("/task", taskRoutes)

const timelogRoutes = require("./src/routes/timeLogRoutes")
app.use("/timelog", timelogRoutes)

const sprintRoutes = require("./src/routes/sprintRoutes")
app.use("/sprint", sprintRoutes)

const developerRoutes = require("./src/routes/developerRoutes")
app.use("/developer", developerRoutes)

const notificationRoutes = require("./src/routes/notificationRoutes")
app.use("/notification", notificationRoutes)

const activityRoutes = require("./src/routes/activityRoutes")
app.use("/activity", activityRoutes)

const announcementRoutes = require("./src/routes/announcementRoutes")
app.use("/announcement", announcementRoutes)

const reviewRoutes = require("./src/routes/reviewRoutes")
app.use("/review", reviewRoutes)

const PORT = process.env.PORT
server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`)
})
