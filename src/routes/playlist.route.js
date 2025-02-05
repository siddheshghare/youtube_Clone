import { Router } from "express";
import {createPlaylist,addVideoToPlaylist,getUserPlaylists,getPlaylistById} from "../controllers/playlist.controller.js"
import {verifyJWT}from "../middlewares/auth.middleware.js"

const router=Router()
router.route("/createPlaylist").get(verifyJWT,createPlaylist)
router.route("/addVideoToPlaylist").post(verifyJWT,addVideoToPlaylist)
router.route("/getUserPlaylist").get(verifyJWT,getUserPlaylists)
router.route("/getPlaylistById/:playlistId").get(verifyJWT,getPlaylistById)


export default router