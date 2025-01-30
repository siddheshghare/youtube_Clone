import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import{toggleVideoLike ,getLikedVideos,toggleCommentLike} from "../controllers/like.controller.js"

const router=Router()

router.route("/toggleVideoLike").post(verifyJWT,toggleVideoLike)
router.route("/likedVideos").get(verifyJWT,getLikedVideos)
router.route("/likedcomment").get(verifyJWT,toggleCommentLike)



export default router