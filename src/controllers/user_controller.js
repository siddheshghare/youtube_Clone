import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"




const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }



    } catch (error) {
        throw new ApiError(500, "something went wrong")

    }
}


const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validtion - not empty
    // check if user already exists 
    // check for imahes , check for avatar
    // upload them to cloudinary , avatar
    // create user object -create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response



    const { fullName, email, username, password } = req.body;
    console.log("email:", email, "password:", password);
    console.log(req.body)

    if (
        [fullName, email, username, password].some((field) =>

            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    // check if user already exists 

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "username or email already exists")

    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path

    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image required")

    }
    // upload them to cloudinary , avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar image required")

    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url,
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong")

    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )

})



const loginUser = asyncHandler(async (req, res) => {
    // request body data fetch 
    //username or email
    //find the user  in database 
    //check password 
    //access and refresh token
    //send cookie


    const { username, email, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "username or password required")

    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "credentials not found")

    }

    const isPasswordValid = await user.isPasswordCorrect(password)


    if (!isPasswordValid) {
        throw new ApiError(400, "invalid password")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser, accessToken, refreshToken
                },
                "user logged in successfully"
            )
        )





})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        {
            new: true//to get new updated model
        })

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "logged out successfully")
        )



})



const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "unauthorized request")
        }

        if (incomingRefreshToken !== user?.refreshToken)
            throw new ApiError(401, "refresh token expired or used")

        const options = {
            httpOnly: true,
            secure: true

        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, newrefreshToken },
                    "access Token refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401, error.msg)

    }


})

const changeCurrentPassword=asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword}=req.body

    const user = await User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if (!isPasswordCorrect) {
    throw new ApiError(400,"incorrect password")
    
   }
   user.password = newPassword
   await user.save({validateBeforeSave : false})

   return res
   .status(200)
   .json(
    new ApiResponse(200,{},"password changed successfully")
   )
})


const getCurrentUser = asyncHandler(async(req,res)=>{
    return res 
    .status(200
     .json( 200,req.user,"current user fetched successfully"
     )   
    )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{

    const {fullName,email}=req.body
    if (!(!email || !fullname)) {
        throw new ApiError(400,"all fields are required")
        
    }
   user = req.user
  const user = await User.findByIdAndUpdate(
    user._id,
    {
        $set:{
            fullname:fullName,
            email:email
        }
    },
    {
        new:true
    }
   ).select("-password")


   return res .status(200)
   .json(new ApiResponse(200,user,"data updated successfully"))


    
})

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400,"error while uploading on cloudinary")
    }

   const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar changed successfully")
    )
})


const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400,"coverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400,"error while uploading on cloudinary")
    }

   const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"coverImage changed successfully")
    )
})





export { registerUser, loginUser, logoutUser,refreshAccessToken ,
    changeCurrentPassword,getCurrentUser,updateAccountDetails,
    updateUserCoverImage,updateUserAvatar}