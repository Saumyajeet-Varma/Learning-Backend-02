import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, // Cloudinary URL
        required: true,
    },
    coverImage: {
        type: String, // Cloudinary URL
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    watchHistory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

// Encrypting password just before saving it in DB (using pre hook, a middleware of mongoose) 
userSchema.pre("save", async function (next) {

    // if password is not modified then no encryption
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// We're defining a method to check the password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// generating Access token
userSchema.methods.generateAccessToken = function () {

    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
}

// generating Refresh token
userSchema.methods.generateRefreshToken = function () {

    jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
}

export const User = mongoose.model("User", userSchema);