import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js"

// Function generating tokens using functions that we defined earlier
const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // 01 - Get user details from frontend
    // 02 - Validation, no empty input section which is required
    // 03 - Check if user already exist
    // 04 - Check for image and avatar*
    // 05 - Upload image and avatar to Cloudinary
    // 06 - Create user object - create entry in DB
    // 07 - Check for user creation
    // 08 - Remove password and refresh token field from response
    // 09 - return response



    // 01 - Get user details from frontend
    const { username, email, fullName, password } = req.body;

    // 02 - Validation, no empty input section which is required
    if ([username, email, fullName, password].some(field => field === undefined || field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Will add it later
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
    return res
        .status(201)
        .json(
            new ApiResponse(200, "User registered successfully", userCreated)
        )
});

const loginUser = asyncHandler(async (req, res) => {

    // 01 - Get user details from frontend
    // 02 - Check username or email ---- Validation of non empty fields
    // 03 - Find the user
    // 04 - Check password
    // 05 - Generate access token and refresh token
    // 06 - Create response data
    // 07 - Send tokens via cookie (secured cookie)
    // 08 - return response (with cookie)



    // 01 - Get user details from frontend
    const { username, email, password } = req.body;

    // 02 - Check username or email ---- Validation of non empty fields
    if (!username || !email) {
        throw new ApiError(400, "username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "password is required");
    }

    // 03 - Find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User doen't exist");
    }

    // 04 - Check password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // 05 - Generate access token and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // 06 - Create response data
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // 07 - Send tokens via cookie (secured cookie)
    const options = {
        httpOnly: true,
        secure: true,
    } // cookies can be modified in frontend, by adding these options we're making secured cookie, modify only by server

    // 08 - return response (with cookie)
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "User logged in successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken,
            })
        );
});

const logoutUser = asyncHandler(async (req, res) => {

    // 01 - We need to get the user _id for logout
    // 02 - Update the refreshToken to undefined
    // 03 - Clear cookies
    // 04 - return response

    // 02 - Update the refreshToken to undefined
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    } // cookies can be modified in frontend, by adding these options we're making secured cookie, modify only by server

    // 03 - Clear cookies
    // 04 - return response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out", {}));
});

export { registerUser, loginUser, logoutUser }







// RegisterUser

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