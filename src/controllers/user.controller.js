import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js"
import uplodOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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

    const {username, email, fullname, password}=req.body
        console.log("email: ", email);
    
    if (
        [username, email, fullname, password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser=User.fiendOne({
        $or: [{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User with email or username already exist")
    }

    const avatarLocalPath=req.file?.avatar[0]?.path
    const coverImageLocalPath=req.file?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar=await uplodOnCloudinary(avatarLocalPath)
    const coverImage=await uplodOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user=await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser= await User.fieldById(user._id).select(
        "-password -refreshToken"
    )

    if (createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(400, createdUser, "User resitered successfully")
    )
})

export {registerUser}