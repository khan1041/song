

import mongoose from "mongoose";

// 1. Define the Schema structure
const userSchema = new mongoose.Schema(
  {
    // A user's name is required and will be converted to lowercase before saving
    username: {
      type: String,
      required: [true, "Username is required"],
   
    },
    // The email must be unique and is required
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
   
      // You can add a custom validator for basic email format checking
    },
    // The password hash (never store the plaintext password!)
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    // Optional field for a user's role (e.g., 'user', 'admin', 'moderator')
    role: {
      type: String,
      enum: ["user", "admin"], // Only allows these two specific string values
      default: "user",
    },
    // Optional field for a profile picture URL
    profilePicture: {
      type: String,
      default: "https://example.com/default-profile.png",
    },
    saveMark:[{type:mongoose.Schema.Types.ObjectId, ref:'Song'}],
    
    isVerified: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// 3. Create and export the Model
const User = mongoose.model("User", userSchema);

export default User;











