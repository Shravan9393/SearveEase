import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      required: true,
      lowercase: true,
      default: "customer",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: false, // Not required for Google OAuth accounts
      minlength: 8,
      select: false, // hide by default in queries
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      default: "",
      select: false, // hide from API responses
    },

    profileImage: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    // Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },

    isGoogleAccount: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


// using  Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


//  comparing passwords during login
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (){
    return jwt.sign({
        _id : this._id,
        email : this.email,
        userName : this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY,
    }
    );
}   

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
         _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
}

userSchema.virtual("isProvider").get(function () {
  return this.role === "provider";
});


 
// Hide sensitive fields when returning JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export const User = mongoose.model("User", userSchema);
