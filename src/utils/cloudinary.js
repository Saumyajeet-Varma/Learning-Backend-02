import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilepath) => {

    try {
        if (!localFilepath) return null;

        // Uploading the file on Cloudinary
        const uploadResult = await cloudinary.uploader
            .upload(
                localFilepath,
                {
                    resource_type: 'auto',
                }
            )

        console.log("File has been successfully uploaded on cloudinary", uploadResult.url);

        return uploadResult;
    }
    catch (error) {

        // remove the locally saved temporary file from the server as the upload operation failed
        fs.unlinkSync(localFilepath);

        return null;
    }
}

export default uploadOnCloudinary







/*

// Upload an image
// This code is present in Cloudinary

const uploadResult = await cloudinary.uploader
    .upload(
        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
        public_id: 'shoes',
    }
    )
    .catch((error) => {
        console.log(error);
    });

console.log(uploadResult);

*/