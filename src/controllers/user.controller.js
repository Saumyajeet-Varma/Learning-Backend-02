import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js"

// 01 - Get user details from frontend
// 02 - Validation, no empty input section which is required
// 03 - Check if user already exist
// 04 - Check for image and avatar*
// 05 - Upload image and avatar to Cloudinary
// 06 - Create user object - create entry in DB
// 07 - Check for user creation
// 08 - Remove password and refresh token field from response
// 09 - return response

const registerUser = asyncHandler(async (req, res) => {

    // 01 - Get user details from frontend
    const { username, email, fullName, password } = req.body;

    // 02 - Validation, no empty input section which is required
    if ([username, email, fullName, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // if (!email.includes("@")) {
    //     throw new ApiError(400, "Enter valid email");
    // }

    // 03 - Check if user already exist
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // 04 - Check for image and avatar*
    const avatarLocalPath = req.files?.avatar[0]?.path // files are provided by multer

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 05 - Upload image and avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 06 - Create user object - create entry in DB
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    })

    // 07 - Check for user creation
    // 08 - Remove password and refresh token field from response
    const userCreated = await User.findById(user._id).select("-password -refreshToken");

    if (!userCreated) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    // 09 - return response
    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", userCreated)
    )


});

export default registerUser







/*

// 02 - Validation, no empty input section which is required

if (!username || !email || !fullName || !password) {
    throw new ApiError(400, "All fields are required")
}
    
*/

/*

// There is some error in this code (select is not a function for userCreated)  

// 07 - Check for user creation
const userCreated = await User.findById(user._id);

if (!userCreated) {
    throw new ApiError(500, "Something went wrong while registering user");
}

// 08 - Remove password and refresh token field from response
const resData = userCreated.select("-password -refreshToken")

*/

/*

// if coverImageLocalPath is undefined then it is showing error, because we are not checking for req.files.coverImage, and directly accessing req.files.coverImage[0]

const coverImageLocalPath = req.files?.coverImage[0]?.path 

*/