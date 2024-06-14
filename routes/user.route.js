const express = require("express")
const router = express.Router()
const { registerUser, loginUser, getProfile } = require("../controllers/user.controller")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile", getProfile)

module.exports = router