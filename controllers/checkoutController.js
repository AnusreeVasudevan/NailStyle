const productModel = require("../models/productModel");
const User = require("../models/userModel");
const cartModel = require("../models/cartModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel")
const randomstring = require("randomstring");


const loadcheckout=async(req,res)=>{
    try{
        let address = await addressModel.findOne({
          user: req.session.user
        }) || null;
        // const order=await orderModel.findOne({
        //   user: req.session.user
        // }) || null;
        const cart=await cartModel.findOne({
          owner: req.session.user
        }).populate({path:'items.productId', model:'Products'}) || null;
        console.log(cart);
        const user=await User.findById(req.session.user);
        res.render('checkout',{user,address,cart});
    }
    catch(error){
      console.log('loadcheckout',error.message);
    }
  
  };

  async function generateUniqueOrderID() {

    const randomPart= randomstring.generate({
        length: 6,
        charset: 'numeric',
      });
   
  
  
    const currentDate = new Date();
  
    
    const datePart = currentDate.toISOString().slice(0, 10).replace(/-/g, "");
  
   
    const orderID = `ID_${randomPart}${datePart}`;
  
    return orderID;
  }

//   const loadorderconfirmed = async(req,res)=>{
//     try{
//         const id=req.query.id;
//         const order=await orderModel.findOne({oId:id})
//         res.render('orderconfirmed',{order});
//     }catch(error){
//         console.log(error.message);
//     }
// }

const loadorderconfirmed = async (req, res) => {
    const orderId = req.query.id; // Retrieve the order ID from the query string
    try {
        const order = await orderModel.findOne({oId:orderId});
        console.log(order);
        if (!order) {
            // Handle the case where an order is not found
            return res.status(404);
        }
        // If the order is found, render the order confirmed page with the order details
        res.render('orderconfirmed', { order: order }); // Ensure you have an 'orderConfirmed.ejs' view in your views directory
    } catch (error) {
        console.error("Error retrieving order:", error);
        // Handle any other errors, such as database connection issues
        res.status(500).render('errorPage', { message: "An error occurred while retrieving the order." });
    }
};

  const Postcheckout = async (req, res) => {
    try {
        const paymentOption = req.body.paymentOption;
        const address = req.body.addressType ;
        if (!paymentOption) {
            return res.status(400);
        }
        if (!address) {
            return res.status(400);
        }

        const user = await User.findById(req.session.user);
        const cart = await cartModel.findOne({ owner: user._id }).populate({ path: 'items.productId', model: 'Products' });
        if (!cart) {
            return res.status(400).json({ message: "Cart not found" });
        }

        const OrderAddress = await addressModel.findOne({ user: user._id });
        if (!OrderAddress) {
            return res.status(400).json({ message: "Address not found" });
        }

        const addressdetails = OrderAddress.addresses.find(
            (item) => item.addressType === address
        );
        if (!addressdetails) {
            return res.status(400).json({ message: "Invalid address ID" });
        }

        const selectedItems = cart.items;

        for (const item of selectedItems) {
            const product = await productModel.findOne({ _id: item.productId });

            if (product.countInStock === 0) {
                return res.status(400).json({ message: "product Out of stock" });
            }
            if (product) {
                if (product.countInStock >= item.quantity) {
                    product.countInStock -= item.quantity;
                    // product.popularity++;

                    await product.save();
                }
            } else {
                console.log('Product not found');
            }
        }

        const order_id = await generateUniqueOrderID();

        const orderData = new orderModel({
            user: user._id,
            cart: cart._id,
            billTotal: cart.billTotal,
            oId: order_id,
            paymentStatus: "Success",
            paymentMethod: paymentOption,
            deliveryAddress: addressdetails,
            coupon: cart.coupon,
            discountPrice: cart.discountPrice
        });

        for (const item of selectedItems) {
            orderData.items.push({
                productId: item.productId._id,
                image: item.productId.images[0],
                name: item.productId.name,
                productPrice: item.productId.price,
                quantity: item.quantity,
                price: item.price
            })
        }

        await orderData.save();

        cart.items = [];
        cart.isApplied = false;
        await cart.save();

        res.status(200).json({order_id});

    } catch (error) {
        console.log('Post checkout error:', error.message);
        res.status(500).json({ message: "Internal server error" });
        res.redirect('/home');
    }
};

const loadorderdetails = async (req, res) => {
    try {
        const orderId = req.query.id
        // let address = await addressModel.findOne({ user: req.session.user }) || null;
        const order = await orderModel.findOne({ _id:orderId }) ;
        // const user = await User.findById(req.session.user);
  
        console.log(order);
  
        res.render('orderdetails', { order });
    } catch (error) {
        console.log('loadorderdetails Error:', error.message);
    }
  };


  module.exports = {
    loadcheckout,
    generateUniqueOrderID,
    Postcheckout,
    loadorderconfirmed,
    loadorderdetails
  }