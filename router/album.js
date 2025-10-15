




import express from "express"
import { createAlbum,getAllAlbums } from "../controller/album.js"
import { isAuth } from "../middlewares/isAuth.js"
const router=express.Router()
router.post("/create",isAuth,createAlbum)
router.get("/all",isAuth,getAllAlbums)

export default router




















