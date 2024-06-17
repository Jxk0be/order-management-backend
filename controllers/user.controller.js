const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const { createToken } = require("../JWT")
const { sendVerificationEmail } = require("../email")
const crypto = require("crypto")

const isValidEmail = (email) => {
    if (email.length > 256) return false;
    
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

const isValidUsername = (username) => {
    if (username.length > 20 || username.includes(" ")) return false;
    
    let usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
}

function isValidPassword(password) {
    if (typeof password !== 'string' || password.length < 8 || password.length > 100) return false;

    const lowercaseRegex = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

    if (!lowercaseRegex.test(password) ||
        !uppercaseRegex.test(password) ||
        !digitRegex.test(password) ||
        !specialCharRegex.test(password)) {
        return false;
    }

    return true;
}

const isValidName = (name) => {
    if (typeof name !== 'string' || name.trim().split(/\s+/).length !== 2) return false;
    
    const validAlphaRegex = /^[A-Za-z]+ [A-Za-z]+$/;
    return validAlphaRegex.test(name.trim());
}

const registerUser = async (req, res) => {
    try {
        let { username, password, fullName, email } = req.body
        let user = null

        /* Must have all fields, otherwise we throw a 400 error */
        if (!("fullName" in req.body) ||  !("username" in req.body) || !("password" in req.body) || !("email" in req.body)) {
            return res.status(400).json("Must have all fields")
        }

        /* Making sure all the data is valid */
        if (!isValidName(fullName)) return res.status(400).json("Name not valid (must be first and last, no special characters or numbers)")
        if (!isValidUsername(username)) return res.status(400).json("Username is not valid")
        if (!isValidEmail(email)) return res.status(400).json("Email is not valid")
        if (!isValidPassword(password)) return res.status(400).json("Password must contain 1 lowercase character, 1 uppercase character, 1 digit, and 1 special character")

        /* This will update everything to lowercase so it can be compared */
        username = username.toLowerCase()
        fullName = fullName.toLowerCase()
        email = email.toLowerCase()

        const existingUser = await User.findOne({ username: username })
        const existingEmail = await User.findOne({ email: email})

        /* If user exists already, they can't register as that username. Also, password must be at least 8 characters long */
        if (existingUser || existingEmail) return res.status(400).json(`${existingEmail ? email : username} already exists`)
        
        /* Bcrypt Hashing Algo for passwords, 10 salts */
        bcrypt.hash(password, 10)
        .then(async (hash) => {
            user = await User.create({
                username: username,
                password: hash,
                fullName: fullName,
                email: email,
                emailToken: crypto.randomBytes(64).toString("hex"),
                verifiedEmail: false
            })

            /* At this point, we can now return success if the user created, else we send a 400 */
            if (user) {
                sendVerificationEmail(user)
                return res.status(200).json({ 
                    message: "Successfully registered!", 
                    user: {
                        username: user.username,
                        email: user.email,
                        id: user._id
                    }
                })
            }
            else return res.status(400).json("Could not register account. Try again")
        })
    }
    catch(error) {
        return res.status(400).json({ message: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        let { username, password, email } = req.body
        let user = null

        /* Password is required or at least email or username */
        if (!("password" in req.body)) return res.status(400).json("You must enter a password")
        if (!("username" in req.body) && !("email" in req.body)) return res.status(400).json("You must enter your username or email")

        /* This will update everything to lowercase so it can be compared */
        if (username) username = username.toLowerCase()
        if (email) email = email.toLowerCase()
        
        /* Find user either by email or by username */
        if (email) user = await User.findOne({ email: email })
        else user = await User.findOne({ username: username })

        if (user) {
            const dbPassword = user.password
            bcrypt.compare(password, dbPassword).then((match) => {
                if (!match) return res.status(400).json("Password does not match. Try again")
                else {
                    const accessToken = createToken(user)

                    res.cookie("accessToken", accessToken, {
                        maxAge: 60*60*24*1000
                    })

                    return res.status(200).json({ 
                        message: "Successfully logged in!", 
                        user: {
                            username: user.username,
                            email: user.email,
                            id: user._id
                        }
                    })
                }
            })
        }
        else return res.status(400).json("Error: User does not exist")
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

const verifyEmail = async (req, res) => {
    try {
        const emailToken = req.body.emailToken
        if (!emailToken) return res.status(400).json("Email Token not found...")

        const user = await User.findOne({ emailToken: emailToken })
        
        if (user) {
            user.verifiedEmail = true
            console.log("HERE")
            await user.save()
            console.log("HERE")
            return res.status(200).json({ 
                message: "Successfully verified email!", 
                user: {
                    username: user.username,
                    email: user.email,
                    id: user._id
                }
            })
        }
        else return res.status(400).json("Email verification failed, invalid token")
    }
    catch(error) {
        return res.status(500).json({ message: error.message })
    }
}
module.exports = {
    registerUser,
    loginUser,
    getProfile,
    verifyEmail
}