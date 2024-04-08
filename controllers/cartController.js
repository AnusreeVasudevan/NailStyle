const productModel = require("../models/productModel");
const User = require("../models/userModel");
const cartModel = require("../models/cartModel");
const addressModel = require("../models/addressModel");
const {couponModel}=require('../models/couponModel');
const wishlistModel=require('../models/wishlistModel');


// const loadCart = async(req,res)=>{
//     try{
//         const cart=await cartModel.findOne({owner:req.session.user}).populate({path:'items.productId',model:'Products'}) || null;
    
        
//         res.render('cart',{cart});
//     } catch(error){
//         console.log(error.message); 
//     }
// }




const loadAndShowCart = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        const userId = user._id;
        
        let userCart = await cartModel.findOne({ owner: userId }).populate({ path: 'items.productId', model: 'Products' });
        const coupon = await couponModel.find();
        const eligibleCoupons = coupon.filter(coupon => {
            return userCart.billTotal >= coupon.minimumAmount && userCart.billTotal <= coupon.maximumAmount && coupon.isActive;
        });
        
        let wish = await wishlistModel.findOne({ user: userId });
        
        if (!wish) {
            wish = null;
        }
        
        if (!userCart) {
            userCart = null;
        }
        
        res.render('cart', { cart: userCart, coupon: eligibleCoupons, wish }); // Pass the 'coupon' variable to the EJS template
    } catch (err) {
        console.log('loadAndShowCart:', err.message);
        res.status(500).send('Error loading cart');
    }
}




const addTocart = async (req, res) => {
    try {
        
        const productId = req.body.productId;

        const product = await productModel.findById(productId);
        console.log(product);
        if (!product) {
            console.log('Product is not found');
            return res.status(404).json({ message: 'Product not found' });
        }
console.log(req.session.user);
        let userCart = await cartModel.findOne({ owner: req.session.user });
        if (!userCart) {
            userCart = new cartModel({
                owner: req.session.user,
                items: [],
                billTotal: 0,
            });
        }
        
        const existingCartItem = userCart.items.find(item => item.productId._id.toString() === productId);

        if (existingCartItem) {
            if (existingCartItem.quantity < product.countInStock && existingCartItem.quantity < 5) {
                existingCartItem.quantity += 1;
                existingCartItem.price = existingCartItem.quantity * product.discountPrice;
                console.log(existingCartItem.price);
            } else if (existingCartItem.quantity + 1 > product.countInStock) {
                return res.status(409).json({ message: 'Stock Limit Exceeded' });
            } else {
                return res.status(400).json({ message: 'Maximum quantity per person reached' });
            }
        } else {
            userCart.items.push({
                productId: productId,
                quantity: 1,
                price: product.discountPrice,
            });
        }

        userCart.billTotal = userCart.items.reduce((total, item) => total + item.price, 0);

        const me= await userCart.save();
        console.log(me,"deatilka");
        return res.status(200).json({ message: 'add to cart' });
    } catch (err) {
        console.log('Error adding to cart:', err.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



// const showCart = async (req, res) => {
//     try {
//         const user = await User.findById(req.session.user);
//         const userId = user._id;
        
//         let userCart = await cartModel.findOne({ owner: userId }).populate({ path: 'items.productId', model: 'Products' });
//         const coupon = await couponModel.find();
//         const eligibleCoupons = coupon.filter(coupon => {
//             return userCart.billTotal >= coupon.minimumAmount && userCart.billTotal <= coupon.maximumAmount && coupon.isActive;
//         });
        
//         let wish = await wishlistModel.findOne({ user: userId });
        
//         if (!wish) {
//             wish = null;
//         }
        
//         if (!userCart) {
//             userCart = null;
//         }
        
//         if (userCart.items.length > 0) {
//             console.log(eligibleCoupons);
//             res.render('cart', { cart: userCart, coupon: eligibleCoupons, wish }); // Pass the 'coupon' variable to the EJS template
//         } else {
//             console.log("emptycart")
//             res.render('empty-cart', { wish, cart: userCart }); // Pass the 'coupon' variable to the EJS template
//         }
//     } catch (err) {
//         console.log('loadCart:', err.message);
//     }
// }



const increaseQuantity = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user;
        
        const cart = await cartModel.findOne({ owner: userId }).populate({ path: 'items.productId', model: 'Products' });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId._id.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Product not in cart' });
        }

        // Check if adding 1 to the quantity would exceed the maximum allowed quantity
        if (item.quantity >= 5) {
            return res.status(400).json({ message: 'Maximum quantity reached' });
        }

        // Check if adding 1 to the quantity would exceed the remaining stock
        if (item.quantity + 1 > item.productId.countInStock) {
            return res.status(409).json({ message: 'Stock limit exceeded' });
        }

        // Increase the quantity by 1
        item.quantity += 1;
        // Recalculate the price
        item.price = item.quantity * item.productId.discountPrice;

        // Update the bill total
        cart.billTotal = cart.items.reduce((total, item) => total + item.price, 0);

        // Save the cart
        await cart.save();

        console.log(cart);
        return res.status(200).json({ message: 'Quantity increased', cart });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};


const decreaseQuantity = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user;

        const cart = await cartModel.findOne({ owner: userId }).populate({ path: 'items.productId', model: 'Products' });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId._id.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Product not in cart' });
        }

        // Decrease the quantity by 1 if it's greater than 1
        if (item.quantity > 1) {
            item.quantity -= 1;
            // Recalculate the price
            item.price = item.quantity * item.productId.discountPrice;
        } else {
            return res.status(400).json({ message: 'Minimum quantity reached' });
        }

        // Update the bill total
        cart.billTotal = cart.items.reduce((total, item) => total + item.price, 0);

        // Save the cart
        await cart.save();

        console.log(cart);
        return res.status(200).json({ message: 'Quantity decreased', cart });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};


    const deleteCart = async (req, res) => {
        try {
            const user = await User.findById(req.session.user);
            const userId = user._id;
            const { productId } = req.body;
    
            // Find the user's cart
            let userCart = await cartModel.findOne({ owner: userId });
            if (!userCart) {
                // Handle the case where there's no cart found for the user
                return res.status(404).json({ message: 'Cart not found' });
            }
    
            // Find if the product exists in the cart
            const existingCartItemIndex = userCart.items.findIndex(item => item.productId.toString() === productId);
            if (existingCartItemIndex > -1) {
                // Remove the item from the cart
                userCart.items.splice(existingCartItemIndex, 1);
    
                // Recalculate the billTotal
                userCart.billTotal = userCart.items.reduce((total, item) => {
                    let itemPrice = Number(item.price); // Ensure item.price is a number
                    let itemQuantity = Number(item.quantity); // Ensure item.quantity is a number
                    let itemTotal = itemPrice * itemQuantity;
                    console.log(`Calculating Item Total: ${itemTotal} (Price: ${itemPrice}, Quantity: ${itemQuantity})`); // Debug log
                    return total + (isNaN(itemTotal) ? 0 : itemTotal);
                }, 0);
                // Save the updated cart
                await userCart.save();
                return res.status(200).json({ success: true, message: 'Item removed from cart' });
            } else {
                // Handle the case where the item is not found in the cart
                return res.status(404).json({ message: 'Item not found in cart' });
            }
        } catch (err) {
            console.error('Error deleting from cart:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };


module.exports = {
    // loadCart,
    addTocart,
    // showCart,
    increaseQuantity,
    decreaseQuantity,
    deleteCart,
    loadAndShowCart
    
}