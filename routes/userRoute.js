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

user_route.get('/productDetails',auth.isLogin,productController.loadIndividualProduct);
user_route.get('/shop',auth.isLogin,userController.loadShop);
user_route.get('/emailforgotpassword',auth.isLogin,userController.loadForgotPasswordemail);
user_route.post('/emailforgotpassword',userController.loadpasswordReset);
user_route.get('/forgotpassword',auth.isLogin,userController.loadForgotPassword);
user_route.post('/forgotpassword',userController.passwordReset);
user_route.get('/userprofile',auth.isLogin,userController.loaduserprofile);
user_route.post('/userprofile',userController.editprofile)
user_route.get('/addaddress',auth.isLogin,userController.loadaddaddress);
user_route.post('/addaddress',userController.addAddress);
user_route.get('/editaddress',auth.isLogin,userController.loadeditAddress);
user_route.post('/editaddress',userController.editAddress)
user_route.get('/deleteaddress',auth.isLogin,userController.deleteAddress);
// user_route.get('/cart',auth.isLogin,cartController.loadCart);
user_route.get('/cart',auth.isLogin,cartController.loadAndShowCart);

user_route.post('/add-to-cart',cartController.addTocart);
user_route.post('/increaseQty',cartController.increaseQuantity);
user_route.post('/decreaseQty',cartController.decreaseQuantity);
user_route.post('/cart-delete',cartController.deleteCart);
user_route.get('/checkout',auth.isLogin,checkoutController.loadcheckout);
user_route.post('/checkout',checkoutController.Postcheckout);
user_route.get('/orderconfirmed',auth.isLogin,checkoutController.loadorderconfirmed);
user_route.get('/orderdetails',auth.isLogin,checkoutController.loadorderdetails);
user_route.post('/orderdetails',userController.cancelorder);
user_route.get('/wishlist',auth.isLogin,wishlistController.loadWishlist);
user_route.get('/addtowishlist',auth.isLogin,wishlistController.addToWishlist);
user_route.get('/removeWishlist',auth.isLogin,wishlistController.removeWishlist);



module.exports = user_route;