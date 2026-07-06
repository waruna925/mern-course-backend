import express from "express";
import { createOrder, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";

const orderRouter=express.Router();

orderRouter.post("/",createOrder)
orderRouter.get("/",getAllOrders)
orderRouter.put("/:orderId/:status",updateOrderStatus)

export default orderRouter