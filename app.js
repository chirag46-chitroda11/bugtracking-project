const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

require("dotenv").config()

const app = express()
const server = http.createServer(app)

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
})

// Store io instance on app for use in controllers
app.set("io", io)

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id)

  // User joins role-based room
  socket.on("join_role", (role) => {
    if (role) {
      socket.join(`role_${role}`)
      console.log(`👤 Socket ${socket.id} joined room: role_${role}`)
    }
  })

  // User joins personal room
  socket.on("join_user", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`)
      console.log(`👤 Socket ${socket.id} joined room: user_${userId}`)
    }
  })

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id)
  })
})

app.use(express.json())
app.use(cors())

// Try backend/src first, fallback to src for DB connection
let DBConnection;
try {
  DBConnection = require("./backend/src/utils/DBConnection")
} catch (e) {
  DBConnection = require("./src/utils/DBConnection")
}
DBConnection()

const userRoutes = require("./backend/src/routes/userRoutes")
app.use("/user", userRoutes)

const bugRoutes = require("./backend/src/routes/bugRoutes")
app.use("/bug", bugRoutes)

const moduleRoutes = require("./backend/src/routes/moduleRoutes")
app.use("/module", moduleRoutes)

const projectRoutes = require("./backend/src/routes/projectRoutes")
app.use("/project", projectRoutes)

const taskRoutes = require("./backend/src/routes/taskRoutes")
app.use("/task", taskRoutes)

const sprintRoutes = require("./backend/src/routes/sprintRoutes")
app.use("/sprint", sprintRoutes)

const notificationRoutes = require("./backend/src/routes/notificationRoutes")
app.use("/notification", notificationRoutes)

const timelogRoutes = require("./backend/src/routes/timeLogRoutes")
app.use("/timelog", timelogRoutes)

const activityRoutes = require("./backend/src/routes/activityRoutes")
app.use("/activity", activityRoutes)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`)
  console.log(`🔌 Socket.io ready`)
})