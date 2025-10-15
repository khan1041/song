


import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/user.js";
dotenv.config();

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const token = authHeader.split(" ")[1];
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id).select("-password");
    if (!req.user) {
      return res.status(403).json({
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      message: "Login First",
    });
  }
};









