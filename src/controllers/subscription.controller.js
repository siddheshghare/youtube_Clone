import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";





const toggleSubscription = asyncHandler(async(req,res)=>{

    const {chanelId} = req.body
    const subscriberId = req.user._id

    if (subscriberId === chanelId) {
        throw new ApiError(400,"you cannot subscribe yourself")
        
    }

    const checkSubscription = await Subscription.findOne({
        subscriber:subscriberId,
        channel:chanelId
    })

    if (checkSubscription) {

        await checkSubscription.deleteOne()
        return res.status(200)
        .json(
            new ApiResponse(
                200,{},"unsubscribed successfully"
            )
        )
    }
    else{
        const newSubscribed = await Subscription.create({
            subscriber:subscriberId,
            channel:chanelId
        })

        return res.json(
            new ApiResponse(200,newSubscribed,"subscribed successfully")
        )
    }



})

const getChanelSubscribers = asyncHandler(async(req, res)=>{
    const chanelId = req.body

    if (!chanelId) {
        throw new ApiError(200,"chanelid required")
    }

    const pipeline = [
        {
            $match: {
                channel: chanelId, // Match the specific channel
            },
        },
        {
            $lookup: {
                from: "users", // Collection name for the User model
                localField: "subscriber", // Field in Subscription referring to the subscriber
                foreignField: "_id", // Field in User referencing the subscriber's ID
                as: "subscriberDetails", // Output array containing subscriber details
            },
        },
        {
            $unwind: "$subscriberDetails", // Deconstruct the subscriberDetails array
        },
        {
            $project: {
                _id: 1,
                subscriber: "$subscriberDetails._id", // Subscriber's ID
                fullName: "$subscriberDetails.fullName", // Subscriber's name
                email: "$subscriberDetails.email", // Subscriber's email
                subscribedAt: "$createdAt", // Subscription creation timestamp
            },
        },
    ];
    const subscriberList = await Subscription.aggregate(pipeline);

    if (subscriberList === 0) {
        return res .status(200)
        .json(200,{},"no subscriber to this channel")
    }

    // Return the list of subscribers
    return res.status(200).json({
        success: true,
        subscriberList,
    });
})

export {toggleSubscription,getChanelSubscribers};