import{ Router} from "express"

import { verifyJWT } from "../middlewares/auth.middleware.js"
import {toggleSubscription,getChanelSubscribers} from "../controllers/subscription.controller.js"

const router=Router()

router.route("/toggleSubscribe").post(verifyJWT,toggleSubscription)
router.route("/getSubscriber").get(verifyJWT,getChanelSubscribers)

export default router