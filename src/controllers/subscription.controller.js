import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {

    const { channelId } = req.params

    // TODO: toggle subscription
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    // TODO: return subscriber list of a channel

    const { channelId } = req.params
})

const getSubscribedChannels = asyncHandler(async (req, res) => {

    // TODO: return channel list to which user has subscribed

    const { subscriberId } = req.params
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }