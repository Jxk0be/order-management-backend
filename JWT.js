const { sign, verify } = require("jsonwebtoken")
require('dotenv').config();

const createToken = (user) => {
    try {
        const accessToken = sign({
            username: user.email,
            id: user._id
        }, process.env.JWT_SECRET)
    
        return accessToken
    }
    catch(error) {
        return error
    }
}

/* This is a middleware. Basically, this intercepts the request before it is actually ran */
const verifyToken = (req, res, next) => {
    try {
        /* If the user doesn't have an access token, they need to login */
        const accessToken = req.cookies["accessToken"]
        if (!accessToken) return res.status(400).json("You need to be logged in")
        
        /* If the access token is valid, then we set the field authenticated to true and continue
           to let the request proceed.
        */
        const validToken = verify(accessToken, process.env.JWT_SECRET)
        if (validToken) {
            req.authenticated = true
            return next()
        }
    }
    catch(error) {
        return res.status(400).json({ message: error.message })
    }
}

module.exports = { createToken, verifyToken }