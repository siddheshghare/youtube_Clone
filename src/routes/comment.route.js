import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment,updateComment,deleteComment,getVideoComments } from "../controllers/comment.controller.js";


const router =Router()

router.route("/addComment").post(verifyJWT,addComment)
router.route("/deleteComment").delete(verifyJWT,deleteComment)
router.route("/updateComment").post(verifyJWT,updateComment)
router.route("/getVideoComment").get(verifyJWT,getVideoComments)


export default router