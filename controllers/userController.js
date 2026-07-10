import axios from "axios";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import dotenv from "dotenv";
import OTP from "../models/otp.js";
dotenv.config();

export function createUser(req,res){

    if(req.body.role=="admin"){ //admin aaganum nu request anupuraar
        if(req.user!=null){
            if(req.user.role!="admin"){ //admin oralkku thaa innoru aalai admin aakka elum
                res.status(403).json({
                    message:"You are not authorized to create an admin account"
                })
                return
            }
        }
        else{
            res.status(404).json({
                message:"You are not authorized to create an admin accounts.Please login first"
            })
            return
        }
    }

    const hashedPassword=bcrypt.hashSync(req.body.password,10)

    const user=new User({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:hashedPassword

    })
    
    user.save().then(()=>{
        res.json(
            {
                message:"User Created Successfully"
            }
        )
    })
    .catch(()=>{
        res.json({
            message:"Failed to create the user"
        })
    })
}

export function loginUser(req,res){
    const email=req.body.email;
    const password=req.body.password;

    User.findOne({email:email}).then(
        (user)=>{
            if(user==null){
                res.status(404).json({
                    message:"User not found"
                })
            }
            else{
                const isPasswordCorrect=bcrypt.compareSync(password,user.password)
                if(isPasswordCorrect){
                    const token=jwt.sign({
                        _id: user._id,
                        email:user.email,
                        firstName:user.firstName,
                        lastName:user.lastName,
                        role:user.role,
                        img:user.img
                    },
                    process.env.JWT_SECRET
                )

                    res.json({
                        message:"Login Successful",
                        token:token,
                        role:user.role
                    })
                }
                else{
                    res.status(401).json({
                        message:"Invalid Password"
                    })
                }
            }
        }
    )
}

export async function loginWithGoogle(req,res){
    const token=req.body.accessToken;
    if(token==null){
        res.status(400).json({
            message:"Access token is required"
        })
        return
    }
    const response=await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    console.log(response.data)

    const user=await User.findOne({
        email:response.data.email
    })
    
    if(user==null){
        const newUser=new User({
            email:response.data.email,
            firstName:response.data.given_name,
            lastName:response.data.family_name,
            password:"googleUser",
            img:response.data.picture
        })
        await newUser.save()
        const token=jwt.sign({
            email:newUser.email,
            firstName:newUser.firstName,
            lastName:newUser.lastName,
            role:newUser.role,
            img:newUser.img
        },
        process.env.JWT_SECRET
        )
        res.json({
            message:"Login Successful",
            token:token,
            role:newUser.role
        })
    }else{
        const token=jwt.sign({
            email:user.email,
            firstName:user.firstName,
            lastName:user.lastName,
            role:user.role,
            img:user.img
        },
        process.env.JWT_SECRET
        )
        res.json({
            message:"Login Successful",
            token:token,
            role:user.role
        })
    }
}
const transporter=nodemailer.createTransport(
    {
        service:"gmail",
        auth:{
            user:process.env.GMAIL_USERNAME,
            pass:process.env.GMAIL_PASSWORD
        }
    }
)
export async function sendOTP(req,res){
    const randomOTP=Math.floor(100000+Math.random()*900000)
    const email=req.body.email;
    if(email==null){
        res.status(400).json({
            message:"Email is required"
        })
        return
    }
    const user=await User.findOne({
        email:email
    })
    if(user==null){
        res.status(404).json({
            message:"User not found"
        })
        return
    }
    await OTP.deleteMany(
        {
            email:email
        }
    )

    const message = {
    from: `"CineVerse" <${process.env.GMAIL_USERNAME}>`,
    to: email,
    subject: "🔐 Password Reset Verification Code",
    html: `
    <div style="
        max-width:600px;
        margin:auto;
        font-family:Arial, Helvetica, sans-serif;
        background:#111827;
        color:#ffffff;
        border-radius:16px;
        overflow:hidden;
        border:1px solid #2d3748;
    ">

        <div style="
            background:#1f2937;
            padding:25px;
            text-align:center;
        ">
            <h1 style="margin:0;color:#ffffff;">
                🎬 CineVerse
            </h1>
            <p style="margin-top:8px;color:#cbd5e1;">
                Password Reset Verification
            </p>
        </div>

        <div style="padding:35px;">

            <p style="font-size:16px;color:#e5e7eb;">
                Hello,
            </p>

            <p style="
                color:#d1d5db;
                line-height:1.8;
            ">
                We received a request to reset your password.
                Use the verification code below to continue.
            </p>

            <div style="
                text-align:center;
                margin:35px 0;
            ">
                <span style="
                    display:inline-block;
                    background:#2563eb;
                    color:white;
                    padding:16px 40px;
                    font-size:32px;
                    font-weight:bold;
                    border-radius:12px;
                    letter-spacing:8px;
                ">
                    ${randomOTP}
                </span>
            </div>

            <p style="
                color:#d1d5db;
                line-height:1.7;
            ">
                This OTP is valid for
                <strong>5 minutes</strong>.
                Do not share this code with anyone.
            </p>

            <p style="
                color:#9ca3af;
                font-size:14px;
                margin-top:30px;
            ">
                If you didn't request a password reset,
                you can safely ignore this email.
            </p>

        </div>

        <div style="
            background:#1f2937;
            text-align:center;
            padding:18px;
            color:#9ca3af;
            font-size:13px;
        ">
            © ${new Date().getFullYear()} CineVerse. All rights reserved.
        </div>

    </div>
    `
}

    const otp=new OTP({
        email:email,
        otp:randomOTP
    })
    await otp.save()

    transporter.sendMail(message,(err,info)=>{
        if(err){
            res.status(500).json({
                error:err,
                message:"Failed to send the OTP"
            })            
        }else{
            res.json({
                message:"OTP sent successfully"
            })
        }
    })
}

export async function resetPassword(req,res){
    const otp=req.body.otp;
    const email=req.body.email;
    const password=req.body.password;

    const response=await OTP.findOne({
        email:email,
    })

    if(response==null){
        res.status(404).json({
            message:"OTP not found"
        })
        return
    }
    if(response.otp==otp){
        await OTP.deleteMany({
            email:email
        })
        const hashedPassword=bcrypt.hashSync(password,10)
        const response2=await User.updateOne(
            {
                email:email
            },
            {
                $set:{
                    password:hashedPassword
                }
            }
        )
        res.json({
            message:"Password reset successfully"
        })


    }else{
        res.status(400).json({
            message:"Invalid OTP"
        })
        return
    }
}

export function isAdmin(req){
    if(req.user==null){
        return false
    }
    if(req.user.role!="admin"){
        return false
    }
    return true
}

