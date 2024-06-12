const {couponModel}=require('../models/couponModel');
const cartModel=require('../models/cartModel');
const User=require('../models/userModel');
const { logout } = require('./adminController');


const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({});
       res.render('listcoupon',{coupons})
    } catch (error) {
        console.error("Error listing coupons:", error.message);
        res.status(500).json({ success: false, message: "Error listing coupons." });
    }
};


const loadcreatecoupon = async(req,res)=>{
    try{
        res.render('createCoupon');
    }catch(error){
        //console.log(error.message);
    }
}

const createCoupon = async (req, res) => {
    //console.log("calling create coupon")
    try {
        const {
            code,
            description,
            discountPercentage,
            minPurchaseAmount,
            maxPurchaseAmount,
            expirationDate,
            maxUsers
        } = req.body;
        //console.log(req.body,'coupon from body');
        const newCoupon = new couponModel({
            code,
            description,
            minimumAmount: minPurchaseAmount,
            maximumAmount: maxPurchaseAmount,
            discountPercentage:discountPercentage,
            expirationDate: new Date(expirationDate),
            maxUsers
        });

        await newCoupon.save();
        //console.log(await newCoupon.save(),"coupon saved");

        res.status(200).json({ success: true, message: "Coupon created successfully." });
        }catch (error) {
            console.error("Error creating coupon:", error.message);
            res.status(500).json({ success: false});
        }
        
};


const toggleCouponStatus = async (req, res) => {
    try {
        const { couponId, isActive } = req.body;

        // Find the coupon by ID and update its isActive field
        await couponModel.findByIdAndUpdate(couponId, { isActive: isActive });

        res.status(200).json({ success: true, message: "Coupon status toggled successfully." });
    } catch (error) {
        console.error("Error toggling coupon status:", error.message);
        res.status(500).json({ success: false, message: "Failed to toggle coupon status." });
    }
};

//     const applycoupon = async(req,res)=>{
//     const { couponCode } = req.body;
//     const userId = req.session.user;

//     try {
//         const userCart = await cartModel.findOne({ owner: userId });
//         const coupon = await couponModel.findOne({ code: couponCode, isActive: true });

//         if (!coupon) {
//             return res.status(404).send({ message: "Coupon not found or not active." });
//         }

//         // Check if the cart meets the coupon requirements
//         if (userCart.billTotal < coupon.minimumAmount) {
//             return res.status(400).send({ message: "Cart total does not meet the minimum amount required for this coupon." });
//         }

//         // Calculate discount and new total
//         const discount = (coupon.discountPercentage / 100) * userCart.billTotal;
//         userCart.billTotal -= discount;
//         // Optionally save the applied coupon to the cart
//         userCart.appliedCoupon = couponCode;

//         await userCart.save();

//         res.send({ newTotal: userCart.billTotal, message: "Coupon applied successfully." });
//     } catch (error) {
//         //console.log(error);
//         res.status(500).send({ message: "An error occurred while applying the coupon." });
//     }
// };

// const applycoupon = async (req, res) => {
//     const { couponCode } = req.body;
//     const userId = req.session.user;
//     //console.log(couponCode, "couponcode");

//     try {
//         const userCart = await cartModel.findOne({ owner: userId });

//         if (!userCart || !userCart.items.length) {
//             return res.status(400).send({ message: "Cart is empty. Cannot apply coupon." });
//         }

//         // Check if a coupon is already applied
//         if (userCart.isApplied) {
//             return res.status(400).send({ message: "A coupon is already applied to your cart." });
//         }

//         const coupon = await couponModel.findOne({ code: couponCode, isActive: true });

//         if (!coupon) {
//             return res.status(404).send({ message: "Coupon not found or not active." });
//         }

//         if (userCart.billTotal < coupon.minimumAmount) {
//             return res.status(400).send({ message: "Cart total does not meet the minimum amount required for this coupon." });
//         }

//         // Calculate the discount amount
//         const discountAmount = (coupon.discountPercentage / 100) * userCart.billTotal;
//         userCart.discountAmount = discountAmount;

//         // Apply the discount to get the new total
//         userCart.discountPrice = userCart.billTotal - discountAmount;

//         // Update other relevant cart properties
//         userCart.coupon = couponCode;
//         userCart.isApplied = true;

//         // Save the updated cart
//         await userCart.save();

//         res.send({ newTotal: userCart.discountPrice, message: "Coupon applied successfully." });
//     } catch (error) {
//         //console.log(error);
//         res.status(500).send({ message: "An error occurred while applying the coupon." });
//     }
// };
// const removeCoupon = async (req, res) => {
//     const userId = req.session.user;

//     try {
//         const userCart = await cartModel.findOne({ owner: userId });

//         if (!userCart || !userCart.isApplied) {
//             return res.status(400).send({ message: "No coupon is applied to your cart." });
//         }

//         userCart.appliedCoupon = null;
//         userCart.discountPrice = 0;
//         // userCart.billTotal += userCart.discountPrice;
//         userCart.billTotal += userCart.discountPrice;
//         userCart.isApplied = false;

//         await userCart.save();

//         res.send({ newTotal: userCart.billTotal, message: "Coupon removed successfully." });
//     } catch (error) {
//         //console.log(error);
//         res.status(500).send({ message: "An error occurred while removing the coupon." });
//     }
// };

const applycoupon = async (req, res) => {
    const { couponCode } = req.body;
    const userId = req.session.user;

    try {
        const userCart = await cartModel.findOne({ owner: userId });

        if (!userCart || !userCart.items.length) {
            return res.status(400).send({ message: "Cart is empty. Cannot apply coupon." });
        }

        // Check if a coupon is already applied
        if (userCart.isApplied) {
            return res.status(400).send({ message: "A coupon is already applied to your cart." });
        }

        const coupon = await couponModel.findOne({ code: couponCode, isActive: true });

        if (!coupon) {
            return res.status(404).send({ message: "Coupon not found or not active." });
        }

        if (userCart.billTotal < coupon.minimumAmount) {
            return res.status(400).send({ message: "Cart total does not meet the minimum amount required for this coupon." });
        }

        // Calculate the discount amount
        const discountAmount = (coupon.discountPercentage / 100) * userCart.billTotal;
        userCart.discountAmount = discountAmount;

        // Apply the discount to get the new total
        userCart.discountPrice = userCart.billTotal - discountAmount;

        // Update other relevant cart properties
        userCart.coupon = couponCode;
        userCart.isApplied = true;

        // Save the updated cart
        await userCart.save();

        res.send({ newTotal: userCart.discountPrice, appliedCoupon: couponCode, message: "Coupon applied successfully." });
    } catch (error) {
        //console.log(error);
        res.status(500).send({ message: "An error occurred while applying the coupon." });
    }
};

const removeCoupon = async (req, res) => {
    const userId = req.session.user;

    try {
        const userCart = await cartModel.findOne({ owner: userId });

        if (!userCart || !userCart.isApplied) {
            return res.status(400).send({ message: "No coupon is applied to your cart." });
        }

        userCart.coupon = null;
        userCart.isApplied = false;
        userCart.discountAmount = 0;
        userCart.discountPrice = 0;

        await userCart.save();

        res.send({ newTotal: userCart.billTotal, message: "Coupon removed successfully." });
    } catch (error) {
        //console.log(error);
        res.status(500).send({ message: "An error occurred while removing the coupon." });
    }
};


module.exports = {
    loadcreatecoupon,
    createCoupon,
    listCoupons,
    toggleCouponStatus,
    applycoupon,
    removeCoupon
}