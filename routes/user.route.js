const express = require("express")
const router = express.Router()
const { verifyToken } = require("../JWT")
const { registerUser, loginUser, getProfile } = require("../controllers/user.controller")

router.post("/register", registerUser)
router.post("/login", loginUser)

/* We are passing the middleware we made "verifyToken" so it can see if the accessToken exists
   before we allow the user to hit the "getProfile" endpoint.
 */
router.get("/profile", verifyToken, getProfile)

module.exports = router