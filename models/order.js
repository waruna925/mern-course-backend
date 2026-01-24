import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        labelledTotal: {
            type: Number,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        pNumber: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            default: "pending"
        },
        product: [
            {
                productInfo: {
                    productId: {
                        type: String,
                        required: true
                    },
                    name: {
                        type: String,
                        required: true
                    },
                    altNames: [
                        { type: String }
                    ],
                    price: {
                        type: Number,
                        required: true
                    },
                    description: {
                        type: String,
                        required: true
                    },
                    image: {
                        type: String
                    }
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        date: {
            type: Date,
            default: Date.now
        }
    }

)

const Order=mongoose.model("orders",orderSchema);

export default Order