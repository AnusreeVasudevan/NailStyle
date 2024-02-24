const express = require("express");
const user_route = express();
const session = require("express-session");

const config = require("../config/config");

user_route.use(session({secret:config.sessionSecret}));

const auth = require("../middleware/userAuth");

user_route.set('view engine','ejs');
user_route.set('views','./views/user');

const userController = require("../controllers/userController");

user_route.get('/',userController.loginLoad);

user_route.get('/login',userController.loginLoad);
user_route.post('/login',userController.verifyLogin);

user_route.get('/home',auth.isLogin,userController.loadHome);

user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.insertUser);

user_route.get('/verifyOTP',userController.loadOtp);
user_route.post('/verifyOTP',userController.getOtp);

// user_route.post('/resendOtp',userController.resendOtp)


module.exports = user_route;