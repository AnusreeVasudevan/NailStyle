const express = require("express");
const admin_route = express();

const session = require("express-session");
const config = require("../config/config");

admin_route.use(session({secret:config.sessionSecret}));

const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

const auth = require("../middleware/adminAuth");

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')

admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyAdmin);
admin_route.get('/home',auth.isLogin,adminController.loadDashboard);
admin_route.get('/adminLogin',adminController.logout);
admin_route.get('/userlist',auth.isLogin,adminController.listUser);
admin_route.get('/block-user',auth.isLogin,adminController.blockUser);
admin_route.get('/unblock-user',auth.isLogin,adminController.unblockUser);
admin_route.get('/category',auth.isLogin,adminController.loadCategory);
admin_route.post('/category',auth.isLogin,categoryController.createCategory);
admin_route.get('/edit-cate',categoryController.editCategoryLoad);
admin_route.post('/edit-cate',categoryController.updateCate);
admin_route.get('/delete-cate',categoryController.deleteCate);




module.exports = admin_route;