const productModel = require("../models/productModel");
const User = require("../models/userModel");
const cartModel = require("../models/cartModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel")
const randomstring = require("randomstring");
const Razorpay = require('razorpay');
const crypto = require('crypto');
const walletModel = require("../models/walletModel");
const categoryModel = require("../models/categoryModel");
const { log } = require("console");
const { path } = require("pdfkit");


const loadcheckout = async (req, res) => {
    try {
        let wallet = await walletModel.findOne({user:req.session.user})
        let address = await addressModel.findOne({
            user: req.session.user
        }) || null;
        const cart = await cartModel.findOne({
            owner: req.session.user
        }).populate({ path: 'items.productId', model: 'Products' }) || null;
        req.session.cart=cart._id
        const user = await User.findById(req.session.user);
        if(cart.items.length !== 0){
            res.render('checkout', { user, address, cart, wallet });
        }else{
            res.redirect('/shop')
        }
        
    }
    catch (error) {
        console.log('loadcheckout', error.message);
    }

};



const razorpayFn = async (req, res) => {
    try {
        console.log('Entered in the function');

        const { a_id, pay } = req.body.data;
        
        const cart=await cartModel.findOne({owner:req.session.user}).populate('items.productId');
      console.log(cart,'........');

        // Fetch the specific address
        const address = await addressModel.findOne({
            user: req.session.user,
            'addresses._id': a_id
        }, {
            'addresses.$': 1 // Use the positional $ operator to fetch only the matching address
        });

        console.log(address, 'Got address');

        // Populate cart items with product details
        

        // Generate a unique order ID
        const order_id = await generateUniqueOrderID();
        console.log(process.env.rzId, "Razorpay Key ID", cart.billTotal, "Cart bill total");

        const url = `orderconfirmed?id=${order_id}`;
        const instance = new Razorpay({ key_id: process.env.rzKey, key_secret: process.env.rzId });

        const options = {
            amount: cart.billTotal * 100, // Razorpay accepts amount in paise
            currency: "INR",
            receipt: order_id
        };
        console.log(options, 'Payment options');

        // Create an order in Razorpay
        const order = await new Promise((resolve, reject) => {
            instance.orders.create(options, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });

        console.log(order, "Razorpay order created");

        const orderData = new orderModel({
            user: req.session.user,
            oId: order_id,
            deliveryAddress: address.addresses[0],
            billTotal: cart.billTotal,
            paymentMethod: pay,
            coupon: cart.coupon,
            discountPrice: cart.discountPrice
        });

        console.log(orderData, "Order data before adding items");

        // Add items to the order
        for (const item of cart.items) {
            orderData.items.push({
                productId: item.productId._id,
                image: item.productId.images[0],
                name: item.productId.name,
                productPrice: item.productId.price,
                quantity: item.quantity,
                price: item.price
            });
        }
        await orderData.save();

        console.log(orderData, "Order data after adding items");

        // Save the order
       
      

        req.session.orderId = orderData._id;

        // Update stock levels and product popularity
        for (const item of cart.items) {
            const product = await productModel.findById(item.productId._id);
            product.countInStock -= item.quantity;
            product.popularity += item.quantity;
            await product.save();
        }

        // Clear the cart
        cart.items = [];
        await cart.save();

        const resurl = orderData._id;
        console.log(resurl, "Response URL");

        res.json({ order, resurl });

    } catch (error) {
        console.error("Error in Razorpay function:", error);
        res.status(500).json({ message: "An error occurred while processing your order." });
    }
};

           
// const codFn=async (req,res)=>{
//     const {a_id,pay}=req.body.data
//     const {user,c_id}=req.session
//     const address = await addressModel.findOne({
//         user: user,
//        'addresses._id': a_id
//     },{
//         'addresses.$': 1 // Use the positional $ operator to fetch only the matching address
//     })
//     const cart=await cartModel.findOne(c_id)
//     const order_id = await generateUniqueOrderID();

//     const url=`orderconfirmed?id=${order_id}`

//             console.log(address,a_id);


//             const orderData = new orderModel({
//                 user: user,
//                 oId: order_id,
//                 items:cart.items,
//                 deliveryAddress: address.addresses[0],
//                 paymentMethod: pay,
//                 coupon: cart.coupon,
//                 discountPrice: cart.discountPrice,
//                 cart: cart._id,
//                 billTotal: cart.billTotal,
//                 oId: order_id,
//             });

//             await orderData.save();
//             req.session.orderId = orderData._id;
//              // Update stock levels
//             for (const item of cart.items) {
//                 const product = await productModel.findOne({ _id: item.productId });
//                 product.countInStock -= item.quantity;
//                 await product.save();
//             }

//             // Clear the cart
//             cart.items = [];
//             await cart.save();
//             res.json({url})
// }

// const razorpayFn = async (req, res) => {
//     try {
//         console.log('Entered in the function');
//         const { a_id, pay } = req.body.data;
//         const { user, c_id } = req.session;

//         // Fetch address
//         const address = await addressModel.findOne({
//             user: user,
//             'addresses._id': a_id
//         }, {
//             'addresses.$': 1
//         });

//         if (!address) {
//             console.error('Address not found');
//             return res.status(404).send('Address not found');
//         }

//         console.log(address, 'got address');

//         // Fetch cart
//         const cart=await cartModel.findOne(c_id).populate('items.productId')
//         if (!cart) {
//             console.error('Cart not found');
//             return res.status(404).send('Cart not found');
//         }

//         console.log(process.env.rzId, "Razorpay ID", cart.billTotal, "cart bill");

//         // Generate unique order ID
//         const order_id = await generateUniqueOrderID();

//         // Create order
//         const order = await instance.orders.create({
//             amount: cart.billTotal * 100,
//             currency: "INR",
//             receipt: order_id,
//         });

//         console.log(address, a_id, 'address, a_id');

//         // Create order data in DB
//         const orderData = new orderModel({
//             user: user,
//             oId: order_id,
//             deliveryAddress: address.addresses[0],
//             billTotal: cart.billTotal,
//             paymentMethod: pay,
//             coupon: cart.coupon,
//             discountPrice: cart.discountPrice
//         });

//         // Add items to orderData
//         for (const item of cart.items) {
//             orderData.items.push({
//                 productId: item.productId._id,
//                 image: item.productId.images[0],
//                 name: item.productId.name,
//                 productPrice: item.productId.price,
//                 quantity: item.quantity,
//                 price: item.price
//             });
//         }

//         // Save orderData
//         await orderData.save();
//         console.log("!!!!!", orderData, 'order data');

//         // Update session
//         req.session.orderId = orderData._id;

//         // Update stock levels
//         for (const item of cart.items) {
//             await productModel.updateOne(
//                 { _id: item.productId._id },
//                 { $inc: { countInStock: -item.quantity } }
//             );
//         }

//         // Clear the cart
//         await cartModel.findByIdAndUpdate(c_id, { $set: { items: [] } });

//         // Send response
//         res.json({ order, resurl: orderData._id });

//     } catch (error) {
//         console.error('Error in razorpayFn:', error);
//         res.status(500).send('An error occurred');
//     }
// };



const codFn = async (req, res) => {
    const { a_id, pay } = req.body.data;
    const { user, c_id } = req.session;
    console.log(289,req.session.user);
    const cart = await cartModel.findOne({owner:user}).populate('items.productId');


    console.log(292,cart);
    if (pay === 'COD') {

        // Check if the total bill is above Rs 1000 and if payment method is COD
        if (cart.billTotal > 1000) {
            return res.status(400).json({
                message: "COD is not available for orders above Rs 1000."
            });
        }
    }

    const address = await addressModel.findOne({
        user: user,
        'addresses._id': a_id
    }, {
        'addresses.$': 1 // Use the positional $ operator to fetch only the matching address
    });

    const order_id = await generateUniqueOrderID();

    // const url = `orderconfirmed?id=${order_id}`;

    const orderData = new orderModel({
        user: user,
        oId: order_id,
        deliveryAddress: address.addresses[0],
        paymentMethod: pay,
        coupon: cart.coupon,
        discountPrice: cart.discountPrice,
        cart: cart._id,
        billTotal: cart.billTotal,
        oId: order_id,
        payId: "NA"
    });
    for (const item of cart.items) {
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
    req.session.orderId = orderData._id;
    // Update stock levels
    for (const item of cart.items) {
        const product = await productModel.findOne({ _id: item.productId });
        product.countInStock -= item.quantity;
        product.popularity += item.quantity;
        await product.save();
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    console.log(350, cart)
    console.log(351,orderData)
    const url = `orderconfirmed?id=${orderData._id}`;
    res.json({ url });
};


async function generateUniqueOrderID() {

    const randomPart = randomstring.generate({
        length: 6,
        charset: 'numeric',
    });
    const currentDate = new Date();


    const datePart = currentDate.toISOString().slice(0, 10).replace(/-/g, "");


    const orderID = `ID_${randomPart}${datePart}`;

    return orderID;
}


// Configure your Razorpay credentials

const orderonlineload = async (req, res) => {
    try {
        // Verify the payment with Razorpay (signature validation)
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, selectedAddress } = req.body.paymentData;
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto.createHmac("sha256", razorpaySecret).update(body).digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Signature validation successful, update order status in database
            const order = await Order.findOneAndUpdate({ oId: razorpay_order_id }, { paymentStatus: "Success" }, { new: true });

            // Send a response indicating the success of the payment
            res.json({ success: true, message: "Payment successful", order: order });
        } else {
            // Signature validation failed
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ success: false, message: "An error occurred while processing the payment" });
    }
};

const loadorderconfirmed = async (req, res) => {
    try {
        // Retrieve the order details using the order ID from the query string
        const orderId = req.query.id;
        const order = await orderModel.findOne({ _id: orderId }).populate('items.productId');
        const cart = await cartModel.findOne({ owner: req.session.user })
        if (!order) {
            // Handle the case where an order is not found
            return res.status(404).render('errorPage', { message: "Order not found" });
        }
        // If the order is found, render the order confirmed page with the order details
        res.render('orderconfirmed', { order: order, cart:cart });
    } catch (error) {
        console.error("Error retrieving order:", error);
        // Handle any other errors, such as database connection issues
        res.status(500).render('errorPage', { message: "An error occurred while retrieving the order." });
    }
};


const payment = async(req,res)=>{
    try{
        const id = req.session.orderId;
        const order = await orderModel.findOne({_id:id}).populate( 'items.productId' );
        console.log(order,"order");
        const razor = req.query.razor;
        console.log(order,"order before saving");
        order.payId = razor;
        await order.save();
        console.log(order,"after",razor,"order after saving");
        res.redirect(`orderconfirmed?id=${order._id}`);
    }catch(error){
        console.log(error.message);
    }
}

const instance = new Razorpay({
    key_id: process.env.rzId,
    key_secret: process.env.rzKey
});

const Postcheckout = async (req, res) => {
    try {
        const { paymentOption, addressType } = req.body;
        if (!paymentOption || !addressType) {
            return res.status(400).json({ message: "Required information is missing" });
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

        const addressdetails = OrderAddress.addresses.find(item => item.addressType === addressType);
        if (!addressdetails) {
            return res.status(400).json({ message: "Invalid address ID" });
        }

        const selectedItems = cart.items;
        for (const item of selectedItems) {
            const product = await productModel.findOne({ _id: item.productId });
            if (!product || product.countInStock < item.quantity) {
                return res.status(400).json({ message: "Product out of stock or not found" });
            }
        }

        const order_id = await generateUniqueOrderID(); 

        if (paymentOption === "online") {
            const order = await instance.orders.create({
                amount: cart.billTotal * 100, 
                currency: "INR",
                receipt: order_id,
            });

            // Handle other order creation logic here
            const orderData = new orderModel({
                user: user._id,
                cart: cart._id,
                billTotal: cart.billTotal,
                oId: order_id,
                paymentStatus: "Pending",
                paymentMethod: paymentOption,
                deliveryAddress: addressdetails,
                coupon: cart.coupon,
                discountPrice: cart.discountPrice
            });

            await orderData.save();
            res.json({ status: "online", order: order });
        } else if (paymentOption === "COD") {
            const orderData = new orderModel({
                user: user._id,
                cart: cart._id,
                billTotal: cart.billTotal,
                oId: order_id,
                paymentStatus: "Pending",
                paymentMethod: paymentOption,
                deliveryAddress: addressdetails,
                coupon: cart.coupon,
                discountPrice: cart.discountPrice
            });

            await orderData.save();
            res.json({ status: "COD", message: "Order added successfully", cart: cart });
        } else {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        // Update stock levels
        for (const item of selectedItems) {
            const product = await productModel.findOne({ _id: item.productId });
            product.countInStock -= item.quantity;
            await product.save();
        }

        // Clear the cart
        cart.items = [];
        await cart.save();

    } catch (error) {
        console.log('Post checkout error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const loadorderdetails = async (req, res) => {
    try {
        const orderId = req.query.oId;
        // let address = await addressModel.findOne({ user: req.session.user }) || null;
        const order = await orderModel.findOne({ _id: orderId }).populate('items.productId');
        // const user = await User.findById(req.session.user);

        // console.log(order);
        req.session.order = orderId;
        res.render('orderdetails', { order });
    } catch (error) {
        console.log('loadorderdetails Error:', error.message);
    }
};

const razorpayVerify = async (req, res) => {
    try {
        const address = req.body.address || 'home';

        const user = await User.findById(req.session.user);
        const cart = await cartModel.findOne({ owner: user._id }).populate({ path: 'items.productId', model: 'Products' });

        if (!cart) {
            return res.status(400).json({ message: "Cart not found" });
        }

        const OrderAddress = await addressModel.findOne({ user: user._id });

        if (!OrderAddress) {
            return res.status(400).json({ message: "Address not found" });
        }

        const addressdetails = OrderAddress.addresses.find(item => item.addressType === address);

        if (!addressdetails) {

        }

        const secretKey = 'l6B3j2Z3kF00qUhBO9qzF1IM';

        let expectedSignature = crypto.createHmac("sha256", secretKey)

        expectedSignature.update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
        expectedSignature = expectedSignature.digest("hex");


        const selectedItems = cart.items;

        // if (expectedSignature === req.body.razorpay_signature) {
        const orderData = new orderModel({
            user: user._id,

            billTotal: cart.billTotal,
            oId: req.body.razorpay_order_id,
            paymentStatus: "Success",
            paymentMethod: 'razorpay',
            deliveryAddress: addressdetails,
            coupon: cart.coupon,
            discountPrice: cart.discountPrice
        });

        for (const item of cart.items) {
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
        res.json({ success: true, message: "Order processed successfully", orderId: req.body.razorpay_order_id });


        // } 

    } catch (err) {
        console.log(err.message);
        return res.status(500).send("Internal Server Error");
    }
}

// const revisePayment = async(req,res)=>{
//     try{
//         console.log(req.session.order);
//         const orders = await orderModel.findOne({_id:req.session.order});
//         console.log(orders,"orders vannu");
//         const order = await instance.orders.create({
//             amount: orders.billTotal * 100, 
//             currency: "INR",
//             receipt: await generateUniqueOrderID(),
//        });
        

//         console.log(order+'kittum');
//         res.json({order})
//     }catch(error){
//         console.log(error.message);
//     }
// }

const revisePayment = async (req, res) => {
    try {
        console.log("----------------------")
        const orderId = req.session.order;
        console.log(orderId)
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID not found in session.' });
        }

        console.log(646);
        const orders = await orderModel.findOne({ _id: orderId });
        console.log(648);
        if (!orders) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        console.log(650,orders)

        const instance = new Razorpay({ key_id: process.env.rzKey, key_secret: process.env.rzId });

        const options = {
            amount: orders.billTotal * 100, // Razorpay accepts amount in paise
            currency: "INR",
            receipt: orders.oId
        };
        console.log(options, 'Payment options');

        // Create an order in Razorpay
        const order = await new Promise((resolve, reject) => {
            instance.orders.create(options, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });
        console.log(667)
        console.log(order);
        req.session.orderId=orders._id

        res.json({ order });
    } catch (error) {
        console.error('Error revising payment:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const wallet = async (req, res) => {
    const { a_id, pay } = req.body.data;
    const { user, c_id } = req.session;
    const wallet=await walletModel.findOne({user:user})
    const cart = await cartModel.findOne({owner:req.session.user}).populate('items.productId');
    console.log(694,cart);

    

    const address = await addressModel.findOne({
        user: user,
        'addresses._id': a_id
    }, {
        'addresses.$': 1 // Use the positional $ operator to fetch only the matching address
    });

    const order_id = await generateUniqueOrderID();

    // const url = `orderconfirmed?id=${order_id}`;

    const orderData = new orderModel({
        user: user,
        oId: order_id,
        deliveryAddress: address.addresses[0],
        paymentMethod: pay,
        coupon: cart.coupon,
        discountPrice: cart.discountPrice,
        cart: cart._id,
        billTotal: cart.billTotal,
        oId: order_id,
    });
    for (const item of cart.items) {
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
        wallet.balance-=cart.billTotal
        wallet.actions.push({
            credit: false,
            amount: cart.billTotal,
            order: orderData._id
    })



        // Check if the total bill is above Rs 1000 and if payment method is COD
        // if (cart.billTotal > 1000) {
        //     return res.status(400).json({
        //         message: "COD is not available for orders above Rs 1000."
        //     });
        // }
    await wallet.save()

    req.session.orderId = orderData._id;
    // Update stock levels
    for (const item of cart.items) {
        const product = await productModel.findOne({ _id: item.productId });
        product.countInStock -= item.quantity;
        product.popularity += item.quantity;
        await product.save();
    }

    // Clear the cart
    cart.items = [];
    await cart.save();
    console.log(orderData)
    const url = `orderconfirmed?id=${orderData._id}`;

    res.json({ url });
};


module.exports = {
    loadcheckout,
    Postcheckout,
    loadorderconfirmed,
    loadorderdetails,
    razorpayVerify,
    orderonlineload,
    razorpayFn,
    payment,
    codFn,
    revisePayment,
    wallet
}