import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ffmpeg from "fluent-ffmpeg";


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const owner = req.user._id
    console.log(owner);

    if (!name) {
        throw new ApiError(400, "playlist name required")
    }

    const playlist = await Playlist.create({
        name, description, owner
    })

    if (!Playlist) {
        throw new ApiError(500, "unable to create playlist")
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "playlist created Successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.body

    if (!playlistId || !videoId) {
        return res.status(400).json({ message: "playlistId and videoId are required" });
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(200, "playlist not found")
    }

    await playlist.videos.push(videoId)

    const addedToPlaylist = await playlist.save()

    res.status(200).json(
        new ApiResponse(200, addedToPlaylist, "video added to playlist successfully")
    )


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        throw new ApiError(400, "userId required")
    }

    const userPlaylist = await Playlist.find({ owner: userId })

    if (!userPlaylist) {
        throw new ApiError(400, "no playlist found")
    }

    res.status(200).json(
        new ApiResponse(200, userPlaylist, "user playlist fetched successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    

    const { ObjectId } = mongoose.Types;
    console.log("playlistId:-", playlistId);

    if (!playlistId) {
        throw new ApiError(400, "playlistId required")
    }

    const playlist = await Playlist.findById(new ObjectId(playlistId))


    if (!playlist) {
        throw new ApiError(400, "no playlist Found")
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "playlist fetched successfully")
    )
})
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

})



export { createPlaylist, addVideoToPlaylist, getUserPlaylists, getPlaylistById }