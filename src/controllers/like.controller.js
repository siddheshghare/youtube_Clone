import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;




const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId}=req.body
    const likedBy= req.user._id

    if (!videoId) {
        throw new ApiError(400,"videoId required")
    }

    const video= await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400,"video not found")
    }

    
    const alreadyLiked= await Like.findOne({video:videoId,likedBy})
    if (alreadyLiked) {
        await alreadyLiked.deleteOne()

        res.status(200)
        .json(
            new ApiResponse(200,alreadyLiked,"unliked successfully")
        )
    }
    else{
        const newLike=await Like.create({
            video:videoId,
            likedBy
        })
        res.status(200)
            .json(
                new ApiResponse(200,newLike,"liked successfully")
            )
    }

   

})


const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    
    const pipeline = [
      {
        $match: {
          likedBy: new ObjectId(userId), 
        },
      },
      {
        $lookup: {
          from: "videos", 
          localField: "video",
          foreignField: "_id", 
          as: "likedVideos", 
        },
      },
      {
        $unwind: "$likedVideos", 
      },
      {
        $project: {
          videoId: "$likedVideos._id", 
          title: "$likedVideos.title", 
          description: "$likedVideos.description", // 
        },
      },
    ];
  
    
    const likedVideos = await Like.aggregate(pipeline);
  
    
    if (likedVideos.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No liked videos found",
        likedVideos: [],
      });
    }
  
   
    return res.status(200).json({
      success: true,
      likedVideos,
    });
  });

  const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId}=req.body
    const likedBy= req.user._id

    if (!commentId) {
        throw new ApiError(400,"commentId required")
    }

    const comment= await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400,"comment not found")
    }

    
    const alreadyLiked= await Like.findOne({comment:commentId,likedBy})
    if (alreadyLiked) {
        await alreadyLiked.deleteOne()

        res.status(200)
        .json(
            new ApiResponse(200,alreadyLiked,"unliked successfully")
        )
    }
    else{
        const newLike=await Like.create({
            comment:commentId,
            likedBy
        })
        res.status(200)
            .json(
                new ApiResponse(200,newLike,"liked successfully")
            )
    }

   

})

  

export {toggleVideoLike ,getLikedVideos,toggleCommentLike}