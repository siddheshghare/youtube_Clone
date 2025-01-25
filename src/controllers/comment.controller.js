import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const addComment = asyncHandler(async(req,res)=>{
    const {videoId , content}= req.body
    const owner=req.user._id
    console.log(owner);
    
    if (!videoId && !content) {
        throw new ApiError(400,"videoid or content required")
    }

    const video= await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400,"video not found")
    }

    const comment = await Comment.create({
        video:videoId,
        content,
        owner
    }) 
    if (!comment) {
        throw new ApiError(500,"internal server error")
    }
    res.status(200)
    .json(
        new ApiResponse(200,comment,"comment added successfully")
    )

})

export {addComment}

