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

    if (!title) {
        throw new ApiError(400, "title required")

    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path

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

    const owner= req.user._id
    console.log(videoFile.url);
    


    const uploadedVideo= await Video.create(
        {
            title:title,
            description:description,
            videoFile:videoFile.url,
            thumbnail:thumbnail?.url,
            duration:"20",
            owner:owner

        }
    )

    if (!uploadedVideo) {
        throw new ApiError(501,"something went wrong while uploading video")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,uploadedVideo,"video uploaded successfully")
    )

})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    if (!videoId) {
        throw new ApiError(400,"video id  required")
    }
    const video=await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400 ,"video not found")
    }
    return res.status(200)
          .json(
            new ApiResponse(200,video,"video fetched successfully")
          )
})

export {publishVideo,
    getVideoById}