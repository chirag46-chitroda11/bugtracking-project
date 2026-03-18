const express = require("express")
const app = express()

const cors = require("cors")

require("dotenv").config()

app.use(express.json())

app.use(cors())


const DBConnection = require("./src/utils/DBConnection")
DBConnection()

const userRoutes = require("./src/routes/userRoutes")
app.use("/user", userRoutes)

const bugRoutes = require("./src/routes/bugRoutes")
app.use("/bug", bugRoutes)

const moduleRoutes = require("./src/routes/moduleRoutes")
app.use("/module",moduleRoutes)

const projectRoutes = require("./src/routes/projectRoutes")
app.use("/project",projectRoutes)

const taskRoutes = require("./src/routes/taskRoutes")
app.use("/task",taskRoutes)

const timelogRoutes = require("./src/routes/timeLogRoutes")
app.use("/timelog",timelogRoutes)

const PORT =process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started on port ${PORT}`)
})