import Product from "../models/product.js"
import { isAdmin } from "./userController.js"

export async function getProduct(req,res){
    // Product.find().then(
    //     (data)=>{
    //         res.json(data)
    //     }
    // )
    // .catch((err)=>{
    //     res.json({
    //     message:"Faied to get products"               error:err
    //     })
    // })
    try{
        if(isAdmin(req)){
            const products=await Product.find()
            res.json(products)
        }
        else{
           const products=await Product.find({isAvailable:true})
            res.json(products) 
        }
        
    }
    catch(err){
        res.json({
            message:"Failed to get products",
            error:err
        })
    }
}

export function saveProduct(req,res){

    if(!isAdmin(req)){
        res.status(403).json({
            message:"You are not authorized to add a product"
        })
        return
    }

    const product=new Product(
        req.body
    )

    product.save().then(()=>{
        res.json({
            message:"Product added successfully"
        })
    })
    .catch(()=>{
        res.json({
            message:"Failed to add product"
        })
    })
}

export async function deleteProduct(req,res) {
    if(!isAdmin(req)){
        res.status(403).json({
            message:"You are not authorized to add a product"
        })
        return
    }

    try{
        await Product.deleteOne({productId:req.params.productId});

        res.json(
            {
                message:"Product deleted successfully"
            }
        )
    }
    catch(err){
        res.json(
            {
                message:"Failed to delete product",
                error:err
            }
        )
    }
}

export async function updateProduct(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message:"You are not authorized to update a product"
        })
        return
    }

    const productId=req.params.productId;
    const updatingData=req.body;

    try{
        await Product.updateOne(
            {productId:productId},
            updatingData
        )
        res.json(
            {
                message:"Product updated successfully"
            }
        )
    }
    catch(err){
        res.status(500).json({
            message:"Failed to update product",
            error:err
        })
    }
}

export async function getProductById(req,res) {
    const productId=req.params.productId

    try{
        const product =await Product.findOne(
            {productId:productId}
        )

        if(product==null){
            res.status(404).json(
                {
                    message:"Product not found"
                }
            )
            return
        }
        if(product.isAvailable){
            res.json(product)
        }else{
            if(!isAdmin(req)){
                res.status(404).json(
                    {
                        message:"Product not found"
                    }
                )
                return
            }else{
                res.json(product)
            }
        }
    }
    catch(e){
        res.status(500).json({
            message:"Failed to update product",
            error:e
        })
    }
}

export const searchProducts = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.json({
        success: false,
        message: "Search query is required",
      });
    }

    // 👉 ADD YOUR CODE HERE
    const keywords = q.toLowerCase().trim().split(" ");

    const query = {
      $and: keywords.map(word => ({
        $or: [
          { name: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } },
          { brand: { $regex: word, $options: "i" } }
        ]
      }))
    };

    const products = await Product.find(query);

    res.json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};