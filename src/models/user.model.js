// Importing dependencies
import mongoose, { Schema } from "mongoose";   // Mongoose for MongoDB and Schema for defining models
import jwt from "jsonwebtoken";               // JWT for authentication tokens
import bcrypt from "bcrypt";                  // Bcrypt for password hashing

// Defining user schema with fields and validations
const userSchema = new Schema({
    username: {
        type: String,
        required: true,     // must be provided
        unique: true,       // no duplicates allowed
        lowercase: true,    // auto-convert to lowercase
        trim: true,         // remove extra spaces
        index: true         // indexing for faster queries
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,       // URL for profile picture (stored on Cloudinary or similar)
        required: true
    },
    coverImage: {
        type: String        // optional cover image URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId, // references another collection (Video)
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'] // custom error if missing
    },
    refreshToken: {
        type: String        // refresh token stored in DB
    }
},
{
    timestamps: true // auto adds createdAt and updatedAt fields
});

// 🔐 Pre-save hook → hash password before saving to DB
userSchema.pre("save", async function (next) {
    // If password is not modified, skip hashing
    if (!this.isModified("password")) return next();

    // Hash password with salt rounds = 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ✅ Method to check if entered password matches hashed password
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// 🎟️ Method to generate Access Token (short-lived)
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,          // embed user info in token payload
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,       // secret key
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // token expiry
        }
    );
};

// 🔄 Method to generate Refresh Token (long-lived)
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id           // only user ID in refresh token
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

// Export User model to use in other files
export const User = mongoose.model("User", userSchema);
