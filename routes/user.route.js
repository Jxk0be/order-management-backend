const express = require("express")
const router = express.Router()
const { verifyToken } = require("../JWT")
const { registerUser, loginUser, getProfile, verifyEmail, resendEmail } = require("../controllers/user.controller")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/verify-email", verifyEmail)
router.post("/resend-email", resendEmail)

/* We are passing the middleware we made "verifyToken" so it can see if the accessToken exists
   before we allow the user to hit the "getProfile" endpoint.
 */
router.get("/profile", verifyToken, getProfile)

module.exports = router