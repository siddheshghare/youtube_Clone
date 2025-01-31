import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ffmpeg from "fluent-ffmpeg";


const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body
    const owner=req.user._id
    console.log(owner);
    
    if (!name) {
        throw new ApiError(400,"playlist name required")
    }

    const playlist = await Playlist.create({
       name, description,owner
    }) 

    if (!Playlist) {
        throw new ApiError(500,"unable to create playlist")
    }

    res.status(200).json(
        new ApiResponse(200,playlist,"playlist created Successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!playlistId || !videoId) {
        return res.status(400).json({ message: "playlistId and videoId are required" });
    }

    

})


export {createPlaylist}