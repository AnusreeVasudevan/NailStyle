const express = require("express");
const admin_route = express();
const product = require('../controllers/productController');
const multer=require('multer');

const session = require("express-session");
const config = require("../config/config");

admin_route.use(session({secret:config.sessionSecret}));

const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

const auth = require("../middleware/adminAuth");

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const couponController = require('../controllers/couponController');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
      cb(null,'./uploads/productImages');
    
    },
    filename:function(req,file,cb){
     
      cb(null,file.originalname);
    }
    });
  
const upload=multer({storage:storage}).array('images', 3);

admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyAdmin);
admin_route.get('/home',auth.isLogin,adminController.loadDashboard);
admin_route.get('/adminLogin',adminController.logout);
admin_route.get('/userlist',auth.isLogin,adminController.listUser);
admin_route.get('/block-user',auth.isLogin,adminController.blockUser);
admin_route.get('/unblock-user',auth.isLogin,adminController.unblockUser);
admin_route.get('/category',auth.isLogin,adminController.loadCategory);
admin_route.post('/category',auth.isLogin,categoryController.createCategory);
admin_route.get('/edit-cate',auth.isLogin,categoryController.editCategoryLoad);
admin_route.post('/edit-cate',categoryController.updateCate);
admin_route.get('/delete-cate',auth.isLogin,categoryController.deleteCate);
admin_route.get('/product',auth.isLogin,productController.loadProduct);
// admin_route.post('/product',auth.isLogin,upload,productController.addProduct);
admin_route.get('/active',auth.isLogin,productController.activeStatus)
admin_route.get('/editproduct',auth.isLogin,productController.loadEdit);
admin_route.post('/editproduct',upload,productController.editProduct);
admin_route.get('/logout',auth.isLogin,adminController.logout);
admin_route.get('/order',adminController.loadorder);
admin_route.get('/adminorderdetails',auth.isLogin,adminController.loadorderdetails);
admin_route.post('/acceptcancel',adminController.requestAccept);
admin_route.post('/rejectcancel',adminController.requestCancel);
admin_route.post('/updateorderstatus',adminController.updateorder);
admin_route.get('/coupon',couponController.listCoupons);
admin_route.get('/createcoupon',couponController.loadcreatecoupon);
admin_route.post('/createcoupon',couponController.createCoupon);
admin_route.post('/togglecoupon',couponController.toggleCouponStatus);
admin_route.post('/createreport',adminController.createReport);
admin_route.get('/admin/filter-products', adminController.filterProducts);
admin_route.get('/addproduct',productController.loadaddproduct);
admin_route.post('/addproduct',upload,productController.addProduct)
admin_route.get('/dashboard',adminController.loadCharts)
admin_route.post('/monthly',adminController.monthlyData);
admin_route.post('/daily',adminController.dailyData);
admin_route.get('/topproducts',adminController.topProducts);
admin_route.get('/topcategory',adminController.topCategory);





module.exports = admin_route;