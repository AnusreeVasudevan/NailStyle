const express = require("express");
const user_route = express();
const session = require("express-session");

const config = require("../config/config");

user_route.use(session({secret:config.sessionSecret}));

const auth = require("../middleware/userAuth");

user_route.set('view engine','ejs');
user_route.set('views','./views/user');

const userController = require("../controllers/userController");
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const checkoutController = require('../controllers/checkoutController');
const wishlistController = require('../controllers/wishlistController');
const couponController = require('../controllers/couponController');
const walletController = require('../controllers/walletController');


user_route.get('/',auth.isLogout,userController.loginLoad);
user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);
user_route.get('/logout',userController.userLogout);
user_route.get('/home',auth.isLogin,userController.loadHome);
user_route.get('/register',auth.isLogout,userController.loadRegister);
user_route.post('/register',userController.insertUser);
user_route.get('/verifyOTP',auth.isLogout,userController.loadOtp);
user_route.post('/verifyOTP',userController.getOtp);
user_route.post('/resendotp',userController.resendOtp);
user_route.get('/productDetails',auth.isLogin,auth.ifBlocked,productController.loadIndividualProduct);
user_route.get('/shop',auth.isLogin,auth.ifBlocked,userController.loadShop);
user_route.get('/emailforgotpassword',userController.loadForgotPasswordemail);
user_route.post('/emailforgotpassword',userController.loadpasswordReset);
user_route.get('/forgotpassword',userController.loadForgotPassword);
user_route.post('/forgotpassword',userController.passwordReset);
user_route.get('/userprofile',auth.isLogin,auth.ifBlocked,userController.loaduserprofile);
user_route.post('/userprofile',userController.editprofile)
user_route.get('/addaddress',auth.isLogin,auth.ifBlocked,userController.loadaddaddress);
user_route.post('/addaddress',userController.addAddress);
user_route.get('/editaddress',auth.isLogin,auth.ifBlocked,userController.loadeditAddress);
user_route.post('/editaddress',userController.editAddress);
user_route.get('/deleteaddress',auth.isLogin,userController.deleteAddress);
user_route.get('/cart',auth.isLogin,auth.ifBlocked,cartController.loadAndShowCart);
user_route.post('/add-to-cart',auth.ifBlocked,cartController.addTocart);
user_route.post('/increaseQty',cartController.increaseQuantity);
user_route.post('/decreaseQty',cartController.decreaseQuantity);
user_route.post('/cart-delete',cartController.deleteCart);
user_route.get('/checkout',auth.isLogin,auth.ifBlocked,checkoutController.loadcheckout);
// user_route.post('/checkout',checkoutController.Postcheckout);
user_route.get('/orderconfirmed',auth.isLogin,auth.ifBlocked,checkoutController.loadorderconfirmed);
user_route.get('/orderdetails',auth.isLogin,auth.ifBlocked,checkoutController.loadorderdetails);
user_route.post('/orderdetails',userController.cancelorder);
user_route.get('/wishlist',auth.isLogin,auth.ifBlocked,wishlistController.loadWishlist);
user_route.get('/addtowishlist',auth.isLogin,auth.ifBlocked,wishlistController.addToWishlist);
user_route.get('/removeWishlist',auth.isLogin,auth.ifBlocked,wishlistController.removeWishlist);
user_route.post('/apply-coupon',couponController.applycoupon);
user_route.post('/remove-coupon', couponController.removeCoupon);
user_route.post('/orderdetails/return', userController.returnOrder);
user_route.post('/orderOnlinePayment',checkoutController.razorpayVerify);
user_route.post('/orderonlineload',checkoutController.orderonlineload);
user_route.post('/razorpay',checkoutController.razorpayFn);
user_route.get('/payment',checkoutController.payment);
user_route.post('/cashondelivery',checkoutController.codFn);
user_route.post('/wallet',checkoutController.wallet);
user_route.post('/downloadinvoice/:oId',userController.downloadInvoice);
user_route.post('/retrypayment',checkoutController.revisePayment);
user_route.post('/myShop',userController.loadMyProducts);

module.exports = user_route;














/*
wallet value refresh after delay, wallet td vs tr value difference
wallet total amount not satisfying actions
add  address validation
add address not returning to routes
order date formatting

*/