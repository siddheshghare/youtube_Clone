import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ffmpeg from "fluent-ffmpeg";
import { application } from "express";




const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            const durationInSeconds = metadata.format.duration; // Duration in seconds
            resolve(durationInSeconds);
        });
    });
};



const publishVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body
    console.log("hi");
    

    if (!title) {
        throw new ApiError(400, "title required")

    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    console.log("hi");

    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFile required")

    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail required")

    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)




    if (!videoFile) {
        throw new ApiError(400, "failed to upload on cloudinary")

    }

    //const duration = await getVideoDuration(videoFile.url)

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail) {
        throw new ApiError(400, "failed to upload on cloudinary")
    }

    const owner = req.user._id
    console.log(videoFile.url);



    const uploadedVideo = await Video.create(
        {
            title: title,
            description: description,
            videoFile: videoFile.url,
            thumbnail: thumbnail?.url,
            duration: "20",
            owner: owner

        }
    )

    if (!uploadedVideo) {
        throw new ApiError(501, "something went wrong while uploading video")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, uploadedVideo, "video uploaded successfully")
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "video id  required")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "video not found")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, video, "video fetched successfully")
        )
})


const getAllVideos = asyncHandler(async (req, res) => {
    const { page, limit, query, sortBy, sortType, userId } = req.query

    const filter = {
        
    }

    if (query) {
        filter.title = { $regex: query, $options: "i" }

    }
    if (userId) {
        filter.userId = userId
    }

    const sortorder = sortType === "asc" ? 1 : -1


    const allVideos = await Video.find(filter)
        .sort({ [sortBy]: sortorder })
       
        .limit(limit)
        .skip((page - 1) * limit)

    if (!allVideos) {
        throw new ApiError(400, "video not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, allVideos, "fetched all videos successfully")
        )

})


const updateVideoDetails = asyncHandler(async (req, res) => {

    const { videoId, title, description } = req.body
    if (!videoId) {
        throw new ApiError(400, "videoId required")
    }

    if (!title && !description) {
        throw new ApiError(400, "title or description is required")
    }

    const thumbnaillocalPath = req.file.path

    if (!thumbnaillocalPath) {
        throw new ApiError(400, "thumbnail not fetched")
    }

    const thumbnail = await uploadOnCloudinary(thumbnaillocalPath)
    if (!thumbnail) {
        throw new ApiError(400, "problem to upload on cloudinary")
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnail.url

            }
        },
        {
            new: true
        }
    )
    if (!updatedVideo) {
        throw new ApiError(400, "video not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, updatedVideo, "video details updated successfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.body
    if (!videoId) {
        throw new ApiError(400, "videoId required"
        )
    }

    const Deleted = await Video.deleteOne({ _id: videoId })

    if (Deleted.deletedCount === 0) {
        throw new ApiError(400, "Video not found or not deleted");
    }

   
    return res.
        status(200)
        .json(
            new ApiResponse(200, {}, "Video deleted successfully")
        );

})

const togglePublishStatus= asyncHandler(async(req,res)=>{
    const {videoId}=req.body

    if (!videoId) {
        throw new ApiError(400,"videoid required")
    }

    const video=await Video.findById(videoId)

    
    if (!video) {
        throw new ApiError(400,"video not found")
    }

    video.isPublished = !video.isPublished;


    const toggled = await video.save()

    return res .status(200)
    .json(
        new ApiResponse(200,toggled,"toggled publish status")
    )



})

export {
    publishVideo,
    getVideoById,
    getAllVideos,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}