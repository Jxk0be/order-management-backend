const express = require("express")
const app = express()
const mongoose = require("mongoose")
const userRoute = require("./routes/user.route")
const cookieParser = require("cookie-parser")
require('dotenv').config();

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use("/api/user", userRoute)
app.use(cookieParser())

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