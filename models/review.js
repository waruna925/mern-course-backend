import mongoose from "mongoose";

const reviewSchema =mongoose.Schema(
    {
        rating:{
            type:Number,
            required:true
        },
        comment:{
            type:String,
            required:true
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"users",
            required:false
        },
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"products",
            required:true
        }
    }
)

const Review=mongoose.model("reviews",reviewSchema);

export default Review