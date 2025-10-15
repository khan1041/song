

// crate a registaion
import User from "../model/user.js"; // Adjust path if necessary
import bcrypt from "bcrypt"; // Library for password hashing
import jwt from "jsonwebtoken";

// Define the register function
export const register = async (req, res) => {
  try {
    // 1. Destructure and validate input
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields: username, email, and password.",
      });
    }

    // 2. Check if user already exists (by email or username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with that email or username already exists.",
      });
    }

    // 3. Hash the password
    // Generate a salt (recommended complexity is 10-12 rounds)
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create a new user instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // 5. Save the user to the database
    const savedUser = await newUser.save();

    // 6. Respond to the client (excluding the password hash)
    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      //role: savedUser.role,
      isVerified: savedUser.isVerified,
      createdAt: savedUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully! 🎉",
      user: userResponse,
    });

  } catch (error) {
    // 7. Handle errors (e.g., Mongoose validation errors)
    // Mongoose errors often have a code of 11000 for duplicate keys
    let message = "Registration failed.";
    if (error.code === 11000) {
      message = "A user with this email or username already exists (Duplicate Key Error).";
    } else if (error.name === "ValidationError") {
      // Handle schema validation errors (e.g., minlength, required)
      message = Object.values(error.errors).map(val => val.message).join('; ');
    } else {
      console.error("Registration Error:", error);
    }

    res.status(500).json({ success: false, message: message });
  }
};

//login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in user login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



//profile
export const myProfile=async(req,res)=>{
  try {
  const userId = req.user._id
  console.log(userId)
  let user=await User.findById(userId).populate("saveMark")
  return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in fetching user profile:", error);
    res.status(500).json({message:"Internal server error"});
  }
};

