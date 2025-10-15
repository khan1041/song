

import express from "express"
import { createSong,getAllsong,getSingaleId,songdeleteId,updateData,addSaveMark, removeSaveMark } from "../controller/song.js"
import { isAuth } from "../middlewares/isAuth.js"
const router=express.Router()
router.post("/post",createSong)
router.get("/all",getAllsong)
router.get("/get/:id",getSingaleId)
router.delete("/song/:id",isAuth,songdeleteId)
router.put("/song/:id",isAuth,updateData)
router.post("/save/:id",isAuth,addSaveMark)
router.delete("/remove/:id",isAuth,removeSaveMark)

export default router
