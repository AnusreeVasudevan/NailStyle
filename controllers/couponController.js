const {couponModel}=require('../models/couponModel');
const cartModel=require('../models/cartModel');
const User=require('../models/userModel');
const { logout } = require('./adminController');

// const loadcoupon = async(req,res)=>{
//     try{
//         res.render('listCoupon');
//     }catch(error){
//         console.log(error.message);
//     }
// }

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
        console.log(error.message);
    }
}

const createCoupon = async (req, res) => {
    console.log("calling create coupon")
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
        console.log(req.body,'coupon from body');
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
        console.log(await newCoupon.save(),"coupon saved");

        res.status(200).json({ success: true, message: "Coupon created successfully." });
        }catch (error) {
            console.error("Error creating coupon:", error.message);
            res.status(500).json({ success: false});
        }
        
};

// const listCoupons = async (req, res) => {
//     try {
//         const coupons = await couponModel.find({});
//         res.status(200).json({ success: true, coupons });
//     } catch (error) {
//         console.error("Error listing coupons:", error.message);
//         res.status(500).json({ success: false, message: "Error listing coupons." });
//     }
// };

// Controller function to toggle the coupon status
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


module.exports = {
    // loadcoupon,
    loadcreatecoupon,
    createCoupon,
    listCoupons,
    toggleCouponStatus
}