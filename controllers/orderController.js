import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {
  if (!req.user) {
    return res.status(403).json({
      message: "Please log in and try again"
    });
  }

  const orderInfo = req.body;

  if (!orderInfo.name) {
    orderInfo.name = req.user.firstName + " " + req.user.lastName;
  }

  let orderId = "CBC00001";
  const lastOrder = await Order.find().sort({ date: -1 }).limit(1);

  if (lastOrder.length > 0) {
    const lastNum = parseInt(lastOrder[0].orderId.replace("CBC", ""));
    orderId = "CBC" + (lastNum + 1).toString().padStart(5, "0");
  }

  try {
    let total = 0;
    let labelledTotal = 0;
    const products = [];

    for (let i = 0; i < orderInfo.product.length; i++) {
      const reqItem = orderInfo.product[i];

      const quantity = Number(reqItem.qty);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Invalid product quantity"
        });
      }

      const item = await Product.findOne({ productId: reqItem.productId });

      if (!item || !item.isAvailable) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      products.push({
        productInfo: {
          productId: item.productId,
          name: item.name,
          altNames: item.altNames,
          price: item.price,
          description: item.description,
          image: item.image
        },
        quantity: quantity
      });

      total += item.price * quantity;
      labelledTotal += item.labelledPrice * quantity;
    }

    const order = new Order({
      orderId,
      email: req.user.email,
      name: orderInfo.name,
      address: orderInfo.address,
      totalAmount: total,          // ✅ server-calculated
      labelledTotal: labelledTotal, // ✅ required
      pNumber: orderInfo.pNumber,
      status: "pending",
      product: products             // ✅ validated array
    });

    const createdOrder = await order.save();

    res.json({
      message: "Order created successfully",
      order: createdOrder
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to create order",
      error: err.message
    });
  }
}

export async function getAllOrders(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message:"You are not an admin"
        })
        return
    }

    try{
        const orders =await Order.find();
        if(orders.length==0){
            res.status(404).json(
                {
                    error:"Orders not found"
                }
            )
            return
        }
        res.json(orders);
    }
    catch(e){
        res.status(500).json(
            {
                error:"Orders not found"
            }
        )
    }
}