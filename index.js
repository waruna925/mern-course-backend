import express from 'express'
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/userRouter.js';
import orderRouter from './routes/orderRouter.js';
import jwt from 'jsonwebtoken'
import reviewRouter from './routes/reviewRouter.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const app=express();

app.use(cors());
app.use(bodyParser.json())


app.use((req,res,next)=>{
    const tokenString=req.header("Authorization")
    if(tokenString!=null){
        const token=tokenString.replace("Bearer ","")

        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(decoded != null){
                console.log(decoded)
                req.user=decoded
                next()
            }
            else{
                console.log("Invalid token")
                res.status(403).json({
                    message:"Invalid Token"
                })
            }
        })
    }
    else{
        next() 
    }
    
})
//mongodb+srv://admin:123@cluster0.ciup1j1.mongodb.net/?appName=Cluster0
mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log("Connected to the database")
})
.catch(()=>{
    console.log("Database connection Failed")
})


app.use("/api/products",productRouter)
app.use("/api/users",userRouter)
app.use("/api/orders",orderRouter)
app.use("/api/reviews",reviewRouter)
 
app.listen(5000,()=>{
    console.log("Server is running on port 5000");
}  );