import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary}from "../utils/cloudinary.js";
import {ApiResponse}from "../utils/ApiResponse.js"



const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await User.save({validateBeforeSave:false})
        return {accessToken,refreshToken}


        
    } catch (error) {
        throw new ApiError(500,"something went wrong")
        
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
    ) 
    {
        throw new ApiError(400, "All fields are required")
    }
     // check if user already exists 

    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })
    if (existedUser) {
        throw new ApiError(409,"username or email already exists")
        
    }
   const avatarLocalPath= req.files?.avatar[0]?.path;
   //const coverImageLocalPath=req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length > 0
)
   {
    coverImageLocalPath= req.files.coverImage[0].path
    
   }
  

   if (!avatarLocalPath)
     {
        throw new ApiError(400,"Avatar image required")
    
   }
   // upload them to cloudinary , avatar
   const avatar= await uploadOnCloudinary(avatarLocalPath);
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
    throw new ApiError(400,"Avatar image required")
    
   }

   const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url,
    email,
    password,
    username: username.toLowerCase()
   })
   const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if (!createdUser) {
    throw new ApiError(500,"something went wrong")
    
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered successfully")
   )

})



const loginUser = asyncHandler(async (req , res)=>{
    // request body data fetch 
    //username or email
    //find the user  in database 
    //check password 
    //access and refresh token
    //send cookie


    const {username, email, password}=req.body

    if (!username || !email) {
        throw new ApiError(400,"username or password required")
        
    }
     
    const user= await User.findOne({
        $or:[{username},{email}]
    })

    if (!user) {
        throw new ApiError(400,"credentials not found")
        
    }

   const isPasswordValid= await user.isPasswordCorrect(password)

   
   if (!isPasswordValid) {
    throw new ApiError(400,"invalid password"

    )


    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedUser =await User.findById(user._id).select("-password -refreshToken")


    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedUser,accessToken,refreshToken
            },
            "user logged in successfully"
        )
    )
    
}



})



export { registerUser }