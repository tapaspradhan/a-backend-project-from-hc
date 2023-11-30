import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcript from "bcrypt"

const userSchema= new Schema({
    username:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    eamil:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName:{
        type:String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //Cloudinary url
        required: true
    },
    coverImage: {
        type: String, //Cloudinary
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refrishToken: {
        type: String,
    }

},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.password.isModified("password")) return next()
    this.password=bcript.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcript.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            eamil: this.eamil,
            username:this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)