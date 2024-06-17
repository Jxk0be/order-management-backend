const mongoose = require("mongoose")

const UserSchema = mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Please enter full name"]
        },
        username: {
            type: String,
            required: [true, "Please enter username"]
        },
        password: {
            type: String,
            required: [true, "Please enter password"]
        },
        email: {
            type: String,
            required: [true, "Please enter email"]
        },
        emailToken: {
            type: String,
            required: true
        },
        verifiedEmail: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", UserSchema)
module.exports = User