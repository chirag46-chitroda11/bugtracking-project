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

const PORT =process.env.PORT
app.listen(PORT,()=>{
    console.log(`server started on port ${PORT}`)
})