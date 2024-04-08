const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const bcrypt = require('bcrypt');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel')
// const randomstring = require('randomstring');
// const securePassword = require('secure-password');

const loadLogin = async(req,res)=>{
    try{
        res.render('adminLogin');
    } catch(error){
        console.log(error.message);
    }
}

const logout = async(req,res)=>{
  try{
      req.session.user_id =false;
      res.redirect('/admin');
  }catch(error){
      console.log(error.message);
  }
}

const verifyAdmin = async (req, res) => {
    try {
  
      const email = req.body.email;
      const password = req.body.password;
      console.log(email,"emaillllllllllllllllllll");
      console.log(password);
      const userData = await User.findOne({ email: email });
      console.log(userData,'aaaaaaaaaaaaaaaaaaaaaaaaaa');
      if (userData) {
  
        const passwordMatch = await bcrypt.compare(password, userData.password);
  
        if (passwordMatch) {
          console.log("Yes");
          if (userData.is_admin === 0) {
            console.log("yess");
            res.render('adminlogin', { message: 'Email and password is Incorrect.' });
            console.log(userData);
  
          }
          else {
            console.log("no");
            // console.log(userData);
            req.session.user_id = userData._id;
            res.redirect('/admin/home')
          }
  
        }
        else {
          res.render('adminlogin', { message: 'Email and password is Incorrect.' });
        }
  
      }
      else {
        res.render('adminlogin', { message: 'Email and password is Incorrect.' });
      }
  
    }
    catch (error) {
      console.log(error.message);
    }
  }
  

const loadDashboard = async (req, res) => {
    try {
        console.log("hlooooooooooooo");
    //   const userData = await User.findById({ _id: req.session.user_id })
      res.render('adminhome');
  
    }
    catch (error) {
      console.log(error.message);
    }
  }

  const listUser = async(req,res)=>{
    try{
        const userData = await User.find({is_admin:0});
        console.log(userData);
        res.render('userlist',{users:userData});
    }catch(error){
        console.log(error.message);
    }
}

const blockUser = async (req, res) => {
  try {
      const id = req.query.id;
      const userData = await User.findById(id);

      if (userData) {
          // Update the user's status to blocked
          userData.is_blocked = true;
          await userData.save();

          // Redirect to the user listing page after blocking
          res.redirect('/admin/userlist');
      } 
  } catch (error) {
      console.log(error.message);
      // Handle the error appropriately, e.g., render an error page
      res.status(500).send('Internal Server Error');
  }
};


const unblockUser = async (req, res) => {
  try {
      const id = req.query.id;
      const userData = await User.findById(id);

      if (userData) {
          // Update the user's status to unblocked
          userData.is_blocked = false;
          await userData.save();
        console.log("123");
          // Redirect to the user listing page after unblocking
          res.redirect('/admin/userlist');
      } else {
          // If user data is not found, you may want to handle this case as well
          res.status(404).send('User not found');
          console.log("456");

      }
  } catch (error) {
      console.log(error.message);
      // Handle the error appropriately, e.g., render an error page
      res.status(500).send('Internal Server Error');
      console.log("789");
  }
};

const loadCategory = async(req,res)=>{
  try{
    const category = await Category.find({});
    console.log(category);

      res.render('category',{category});
  } catch(error){
      console.log(error.message);
  }
}

const loadorder = async(req,res)=>{
    try{
      const order = await orderModel.find({}).populate({path:'user',model:'User'});
      res.render('orders',{order});
    }catch(error){
      console.log(error.message);
    }
}

const loadorderdetails = async(req,res)=>{
  try{
    const id =req.query.id;
    const orders = await orderModel.findById(id).populate({path:'user',model:'User'});
    res.render('adminorderdetails',{orders});
  }catch(error){
    console.log(error.message);
  }
}

// const requestAccept = async (req, res) => {
//   try {
//       const { orderId,userId } = req.body;

//       const canceledOrder = await orderModel.findOne({ oId: orderId });
//       const user = await User.findById(userId);
//   if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//   }
//       if (!canceledOrder) {
//           return res.status(404).json({ success: false, message: 'Order not found' });
//       }
//       // let wallet = await WalletModel.findOne({ user: userId });
//       // if (!wallet) {
        
//       //     wallet = new WalletModel({
//       //         user: userId,
//       //         balance: 0, 
//       //         transactions: [] 
//       //     });
//       // }
//       // wallet.balance += canceledOrder.billTotal;
//       // wallet.transactions.push({
//       //     amount: canceledOrder.billTotal,
//       //     type: 'credit',
//       //     description: 'Refund for order ' + orderId
//       // });

//       // await wallet.save();


//       for (const orderItem of canceledOrder.items) {
//         console.log('/////////////////',orderItem);
//           let product = await productModel.findById(orderItem.productId).exec();
//         console.log('///////product//////////////',product);
//         console.log('//////////////cout',orderItem.quantity);
//           if (product) {
//               product.countInStock += orderItem.quantity;
//               console.log('/////////stock////////',product.countInStock);
//               await product.save();
//           }
//       }
// for(let i=0;i<canceledOrder.requests.length;i++){
//       if(canceledOrder.requests[i].type==='Cancel'){
//       await orderModel.findOneAndUpdate(
//           { oId: orderId },
//           { $set: { status: 'Canceled', 'requests.$[elem].status': 'Accepted' } },
//           { new: true, arrayFilters: [{ 'elem.status': 'Pending' }] }
//       );}else{
//            await orderModel.findOneAndUpdate(
//               { oId: orderId },
//               { $set: { status: 'Returned', 'requests.$[elem].status': 'Accepted' } },
//               { new: true, arrayFilters: [{ 'elem.status': 'Pending' }] }
//           );
//       }}
//       return res.status(200).json({ success: true, message: 'Order status updated successfully'});
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

const requestAccept = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    const canceledOrder = await orderModel.findOne({ oId: orderId });
    if (!canceledOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Iterate over each item in the canceled order to update product stock.
    for (const orderItem of canceledOrder.items) {
      let product = await productModel.findById(orderItem.productId).exec();
      console.log('comeeeeeeeeeeeeee',orderItem.productId,orderItem.quantity);
      console.log(product,'come2');
      if (product) {
        product.countInStock += Number(orderItem.quantity);
        await product.save();
      }
    }

    // Process each request in the canceledOrder.
    for (let request of canceledOrder.requests) {
      if (request.status === 'Pending') { // Ensure we're only updating pending requests.
        const newStatus = request.type === 'Cancel' ? 'Canceled' : 'Returned';
        await orderModel.findOneAndUpdate(
          { oId: orderId, 'requests._id': request._id }, // Match the specific request by its ID.
          {
            $set: {
              status: newStatus,
              'requests.$.status': 'Accepted' // Update the matched request status.
            }
          },
          { new: true }
        );
      }
    }

    return res.status(200).json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const requestCancel = async(req,res)=>{
  try {
      const { orderId} = req.body;
     

          const Order = await orderModel.findOne({oId:orderId});

          if (!Order) {
              return res.status(404).json({ success: false, message: 'Order not found' });
          }
      
      for (const orderItem of Order.items) {
          const product = await productModel.findById(orderItem.productId);

          if (product &&product.countInStock>0 ) {
           
              // product.countInStock -= orderItem.quantity;
              await product.save();
          }
      }
  
      const updatedOrder = await orderModel.findOneAndUpdate(
          { oId: orderId },
          { $set: { status: 'Pending', 'requests.$[elem].status': 'Rejected' } },
          { new: true, arrayFilters: [{ 'elem.status': 'Pending' }] }
      );
      

  if (!updatedOrder) {
      
      return res.status(201).json({ success: true, message: 'Order not found' });
      
  }
  

  return res.status(200).json({ success: true, message: 'Order status rejected', updatedOrder })
   }catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: 'Internal server error' });
  }
}

const updateorder=async(req,res)=>{
  try{
      const {newStatus,orderId}=req.body;
     
      const order=await orderModel.findOne({oId:orderId});
      if(newStatus==='Canceled'){
          for (const orderItem of order.items) {
              let product = await productModel.findById(orderItem.productId);
  

              if (product) {
                  product.countInStock += orderItem.quantity;
                  await product.save();
              }
          }

      }
      const updatedOrder = await orderModel.findOneAndUpdate(
          { oId: orderId },
          {$set:{ status: newStatus } },
          { new: true }
      );
        
      if (!updatedOrder) {
          return res.status(404).json({ success: false, message: 'Order not found' });
      }

      return res.status(200).json({ success: true, message: 'Order status updated successfully', updatedOrder });
  }
  catch(error){
      console.log('uporder:',error.message);
  }

}

module.exports = {
    loadLogin,
    loadDashboard,
    verifyAdmin,
    logout,
    listUser,
    blockUser,
    unblockUser,
    loadCategory,
    loadorder,
    loadorderdetails,
    requestAccept,
    requestCancel,
    updateorder
}