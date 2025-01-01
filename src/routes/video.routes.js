import{ Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { getAllVideos, 
    publishVideo,
    updateVideoDetails,
    deleteVideo } from "../controllers/video.controller.js"



const router=Router()

router.route("/publish_Video").post(verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishVideo
)

router.route("/allVideos").get(getAllVideos)

router.route("/updateDetails").put(verifyJWT,upload.single("thumbnail"),updateVideoDetails)
router.route("/deleteVideo").delete(verifyJWT, deleteVideo);

export default router