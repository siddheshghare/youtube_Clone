import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose";

//import twilio from "twilio/lib/rest/Twilio.js"


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

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.body
    console.log(commentId);
    

    if (!commentId) {
        throw new ApiError(400 , "commentid required")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400 , "comment not found")
    }
    await comment.deleteOne()
    res.status(200)
    .json(
        new ApiResponse(200,{},"comment deleted successfully")
    )
})

    const updateComment = asyncHandler(async (req, res) => {
        const {commentId ,content} = req.body

        if (!commentId || !content) {
            throw new ApiError(400 , "commentid And content required")
        }
    
        const comment = await Comment.findById(commentId)
        if (!comment) {
            throw new ApiError(404 , "comment not found")
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
        {
             $set:{
                content:content
             }
        },
        {
            new:true
        }
        )

        if (!updatedComment) {
            throw new ApiError(500,"internal server error")
        }
        res.status(200)
        .json(
            new ApiResponse(200,updatedComment,"comment updated successfully")
        )

})
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.body
    const { ObjectId } = mongoose.Types;
    const {page = 1, limit = 10} = req.query

     if (!videoId) {
        throw new ApiError(400,"videoId not found")
     }

     const video = await Video.findById(videoId)
     if (!video) {
        throw new ApiError(400,"video not found")
     }

     const pipeline =[
        {
            $match:{
               video: new ObjectId(videoId) 
            }
        },
        {
            $lookup: {
                from: "users", 
                localField: "owner",
                foreignField: "_id", 
                as: "ownerDetails", 
            },
        },
        {
            $unwind: "$ownerDetails",
        },
        {
            $project: {
                _id: 1,
                commentOwner: "$ownerDetails._id", 
                fullName: "$ownerDetails.fullName", 
              content:1
               
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        },
     ]

     const videoComments = await Comment.aggregate(pipeline)
               console.log(videoComments);
                                       

           if (!videoComments || videoComments.length === 0) {
            throw new ApiError(400, "video comment not found ")
           }  
           
           res.status(200)
           .json(
            new ApiResponse(200,videoComments,"all comments")
           )







})






export {addComment,deleteComment ,updateComment ,getVideoComments}

