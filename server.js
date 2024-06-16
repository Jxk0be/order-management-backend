const express = require("express")
const app = express()
const mongoose = require("mongoose")
const userRoute = require("./routes/user.route")
const cookieParser = require("cookie-parser")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
require('dotenv').config();

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())
app.use("/api/user", userRoute)

/* Prevent against NoSQL query injection & site script XSS */
app.use(mongoSanitize())
app.use(xss())

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to the DB...")
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`)
    })
})
.catch(() => {
    console.log("Error connecting to MongoDB")
})

app.get("/", (req, res) => {
    res.send("Testing server")
})