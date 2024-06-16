const { sign, verify } = require("jsonwebtoken")

const createTokens = (user) => {
    const accessToken = sign({
        username: user.email,
        id: user._id
    }, process.env.JWT_SECRET)

    return accessToken
}

module.exports = { createTokens }