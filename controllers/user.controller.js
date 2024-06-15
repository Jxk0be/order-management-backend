const User = require("../models/user.model")
const bcrypt = require("bcrypt")

const registerUser = async (req, res) => {
    try {
        let { username, password, fullName, email } = req.body

        /* Must have all fields, otherwise we throw a 400 error */
        if (!("fullName" in req.body) ||  !("username" in req.body) || !("password" in req.body) || !("email" in req.body)) {
            return res.status(400).json("Must have all fields")
        }

        /* This will update everything to lowercase so it can be compared */
        username = username.toLowerCase()
        fullName = fullName.toLowerCase()
        email = email.toLowerCase()

        const existingUser = await User.findOne({ username: username })
        const existingEmail = await User.findOne({ email: email})

        /* If user exists already, they can't register as that username */
        if (existingUser || existingEmail) {
            return res.status(400).json(`${existingEmail ? email : username} already exists`)
        }

        /* Bcrypt Hashing Algo for passwords, 10 salts */
        bcrypt.hash(password, 10)
        .then(async (hash) => {
            await User.create({
                username: username,
                password: hash,
                fullName: fullName,
                email: email
            })
        })

        return res.status(200).json(`${username} successfully registered!`)
    }
    catch(error) {
        return res.status(400).json({ message: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password, email } = req.body
        let user = null

        /* Password is required or at least email or username */
        if (!("password" in req.body)) return res.status(400).json("You must enter a password")
        if (!("username" in req.body) && !("email" in req.body)) return res.status(400).json("You must enter your username or email")

        /* Find user either by email or by username */
        if (email) user = await User.findOne({ email: email })
        else user = await User.findOne({ username: username })

        const dbPassword = user.password
        bcrypt.compare(password, dbPassword).then((match) => {
            if (!match) return res.status(400).json("Password does not match. Try again")
            else return res.status(200).send({ user: user, message: "Successfully logged in!"})

        })
    }
    catch(error) {
        return res.status(400).json({ message: error.message })
    }
}

const getProfile = async (req, res) => {
    try {
        return res.status(200).send("You retrieved your profile")
    }
    catch(error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = {
    registerUser,
    loginUser,
    getProfile
}