import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import path from "path";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";








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

export {publishVideo}