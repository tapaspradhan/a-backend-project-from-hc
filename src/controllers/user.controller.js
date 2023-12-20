import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {uplodOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exist:username, email
    // check for images, check for avatar
    // upload them to cloudnary, avatar
    // create user object - cretate entry in db
    // remove password and refrish token field from response
    // check for user creation
    // return res

    const {username, email, fullName, password}=req.body
        // console.log("email: ", email);
    
    if (
        [username, email, fullName, password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser=await User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User with email or username already exist")
    }
// console.log(req.files.avatar[0]);
    const avatarLocalPath=req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.file?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath=req.files.coverImage[0].path;
    };

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar=await uplodOnCloudinary(avatarLocalPath)
    const coverImage=await uplodOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    // console.log("email: ", email);
    const user=await User({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email:email,
        password,
        username: username.toLowerCase()
    })
    await user.save()
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User resitered successfully")
    )
})

const loginUser=asyncHandler(async (req,res)=>{
    // req body --> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const{username, email, password}=req.body

    if (!username || !email) {
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if (!user) {
        throw new ApiError(404,"User does't exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"invalid user credentials")
    }

    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password, -refreshToken")

    const options={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User login successfully"
        )
    )

})

const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",options)
    .cookie("refreshToken",options)
    .json(new ApiError(200,"User logged out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}