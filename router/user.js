
import express from "express"
import { register,loginUser,myProfile, } from "../controller/user.js"
import { isAuth } from "../middlewares/isAuth.js"
const router=express.Router()
router.post("/register",register)
router.post("/login",loginUser)
router.get("/me",isAuth,myProfile)
export default router


