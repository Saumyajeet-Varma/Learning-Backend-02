import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"

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

    // TODO: Will add it later
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
    if (!username && !email) {
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



    // 01 - We need to get the user _id for logout
    // Done by auth.middleware.js

    // 02 - Update the refreshToken to undefined
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1, // This removes the field from the document
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

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true,
        } // cookies can be modified in frontend, by adding these options we're making secured cookie, modify only by server

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, "Access token refreshed", {
                    accessToken,
                    refreshToken: newRefreshToken,
                })
            )
    }
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
});

const changePassword = asyncHandler(async (req, res) => {

    // 01 - Get the data
    // 02 - Validate no empty fields
    // 03 - Find the user
    // 04 - check if password given is correct or not
    // 05 - Change password
    // 06 - Return response



    // 01 - Get the data
    const { oldPassword, newPassword } = req.body

    // 02 - Validate no empty fields
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required")
    }

    // 03 - Find the user
    const user = await User.findById(req.user?._id)

    // 04 - check if password given is correct or not
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    // 05 - Change password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    // 06 - Return response
    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully", {}))
});

const getCurrentUser = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(new ApiResponse(200, "current User fetched", req.user))
});

const updateAccountDetails = asyncHandler(async (req, res) => {

    // 01 - Get the data
    // 02 - Validate no empty fields
    // 03 - Find user
    // 04 - Update details
    // 05 - Return response



    // 01 - Get the data
    const { fullName, email } = req.body

    // 02 - Validate no empty fields
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    // 03 - Find user
    // 04 - Update details
    const user = await User.findByIdAndUpdate(
        user.req?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        {
            new: true,
        }
    ).select("-password refreshToken")

    // 05 - Return response
    return res
        .status(200)
        .json(new ApiResponse(200, "Account details updated seccessfully", user))
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    // 01 - Get the avatar file
    // 02 - Check avatar file
    // 03 - Delete old Avatar
    // 04 - Upload on cloudinary
    // 05 - Find user and update avatar
    // 06 - Return response



    // 01 - Get the avatar file
    const avatarLocalPath = req.file?.path

    // 02 - Check avatar file
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // TODO: 03 - Delete old Avatar

    // 04 - Upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading avatar")
    }

    // 05 - Find user and update avatar
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    // 06 - Return response
    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar changed successfully", user))
});

const updateUserCoverImage = asyncHandler(async (req, res) => {

    // 01 - Get the coverImage file
    // 02 - Check coverImage file
    // 03 - Delete old coverImage
    // 04 - Upload on cloudinary
    // 05 - Find user and update coverImage
    // 06 - Return response



    // 01 - Get the coverImage file
    const avatarLocalPath = req.file?.path

    // 02 - Check coverImage file
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    // TODO: 03 - Delete old coverImage

    // 04 - Upload on cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploading coverImage")
    }

    // 05 - Find user and update coverImage
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    // 06 - Return response
    return res
        .status(200)
        .json(new ApiResponse(200, "Cover Image changed successfully", user))
});

const getUserChannelProfile = asyncHandler(async (req, res) => {

    // 01 - Get the data (In this case, username)
    // 02 - Check the username
    // 03 - Calculate the data of user (subscriber, subscribedTo, ...)
    // 04 - Return response



    // 01 - Get the data (In this case, username)
    const { username } = req.params;

    // 02 - Check the username
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    // * MongoDB aggregation pipeline
    // ? Refer to MongoDB docs
    // 03 - Calculate the data of user (subscriber, subscribedTo, ...)
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedTo: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
                coverIamge: 1,
                subscriberCount: 1,
                channelsSubscribedTo: 1,
                isSubscribed: 1,
            }
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exists")
    }

    // 04 - Return response
    return res
        .status(200)
        .json(new ApiResponse(200, "User channel fetched successfully", channel[0]));
});

const getWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Schema.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            }
                        }
                    },
                ]
            }
        },
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, "Watch history fetched successfully", user[0].watchHistory))
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory }







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