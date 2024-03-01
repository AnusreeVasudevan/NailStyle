const express = require("express");
const user_route = express();
const session = require("express-session");

const config = require("../config/config");

user_route.use(session({secret:config.sessionSecret}));

const auth = require("../middleware/userAuth");

user_route.set('view engine','ejs');
user_route.set('views','./views/user');

const userController = require("../controllers/userController");
const productController = require('../controllers/productController')

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

user_route.get('/productDetails',productController.loadIndividualProduct);




module.exports = user_route;