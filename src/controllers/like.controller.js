
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
  
    // Step 1: Build the aggregation pipeline
    const pipeline = [
      {
        $match: {
          likedBy: new ObjectId(userId), // Match likes by the user
        },
      },
      {
        $lookup: {
          from: "videos", // Collection name (pluralized and lowercase)
          localField: "video", // Field in `like` collection
          foreignField: "_id", // Field in `videos` collection
          as: "likedVideos", // Output array containing video details
        },
      },
      {
        $unwind: "$likedVideos", // Deconstruct the `likedVideos` array
      },
      {
        $project: {
          videoId: "$likedVideos._id", // Video ID
          title: "$likedVideos.title", // Video title
          description: "$likedVideos.description", // Video description
        },
      },
    ];
  
    // Step 2: Execute the aggregation query
    const likedVideos = await Like.aggregate(pipeline);
  
    // Step 3: Handle cases where no liked videos are found
    if (likedVideos.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No liked videos found",
        likedVideos: [],
      });
    }
  
    // Step 4: Return the liked videos
    return res.status(200).json({
      success: true,
      likedVideos,
    });
  });
  

export {toggleVideoLike ,getLikedVideos}