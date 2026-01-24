import Review from "../models/review.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { isAdmin } from "./userController.js";

export async function createReview(req,res){
    if (!req.user) {
    return res.status(403).json({
      message: "Please log in and try again"
    });
  }

    const userId = req.user._id;
    const productId=req.params.productId;
    const rating=req.body.rating;
    const comment=req.body.comment;

    const user=await User.findById(userId);
    if(user==null){
        res.status(404).json({
            message:"User not found"
        })
        return
    }

    const product=await Product.findOne({productId:productId});
    if(product==null){
        res.status(404).json({
            message:"Product not found"
        })
        return
    }

    const newReview=new Review(
        {
            rating:rating,
            comment:comment,
            user:userId,
            product:product._id
        }
    )

    try{
        await newReview.save();
        res.json(
            {
                message:"Review added successfully",
                review:newReview
            }
        ) 
    }
    catch(err){
        res.status(500).json({
            message:"Failed to add review",
            error:err
        })
    }
}

export async function getReviews(req,res){

    if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to get reviews"
    });
  }
    
    try{
        const reviews=await Review.find()
        res.json(reviews)
    }
    catch(err){
        res.status(500).json({
            message:"Failed to get reviews",
            error:err
        })
    }
}