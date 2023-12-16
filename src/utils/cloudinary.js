import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uplodOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        // upload the file on cloudnary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        });
        // file upload successfully
        // console.log("file is upload on cloudinary successfully",response.url);

        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the local saved temporary file as the upload operatrion got failed
        return null
    }
}

export {uplodOnCloudinary}