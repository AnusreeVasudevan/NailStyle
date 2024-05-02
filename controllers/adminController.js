const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const bcrypt = require('bcrypt');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel')
const fs = require('fs');
// const randomstring = require('randomstring');
// const securePassword = require('secure-password');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

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
  

// const loadDashboard = async (req, res) => {
//     try {
//     //   const userData = await User.findById({ _id: req.session.user_id })
//     const orders = await orderModel.find({}).populate('user');
//       res.render('adminhome',{orders});
  
//     }
//     catch (error) {
//       console.log(error.message);
//       res.status(500).send('Internal Server Error');
//     }
//   }

// const loadDashboard = async (req, res) => {
//     try {
//         const timeFrame = req.query.timeFrame;
//         console.log(timeFrame,'timeframe');
//         let filter = {};

//         if (timeFrame) {
//             const now = new Date();
//             switch (timeFrame) {
//                 case 'Daily':
//                     filter.orderDate = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
//                     break;
//                 case 'Weekly':
//                     const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
//                     filter.orderDate = { $gte: startOfWeek };
//                     break;
//                 case 'Monthly':
//                     filter.orderDate = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
//                     break;
//                 case 'Yearly':
//                     filter.orderDate = { $gte: new Date(now.getFullYear(), 0, 1) };
//                     break;
//             }
//         }

//         const orders = await orderModel.find(filter).populate('user');
//         res.render('adminhome', { orders });
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// };

const loadDashboard = async (req, res) => {
  try {
      const timeFrame = req.query.value;  
      console.log(timeFrame, 'timeframe');
      let filter = {};

      if (timeFrame) {
        filter.orderDate = timeframeFn(timeFrame);
      }

      const orders = await orderModel.find(filter).populate('user');
      console.log(orders,'orderssss');
      console.log(timeFrame,'timeframeee');
      res.render('adminhome', { orders,timeFrame}); // Adjust view name and data as required
  } catch (error) {
      console.error('Error loading dashboard:', error);
      res.status(500).send('Error loading dashboard');
  }
};

function timeframeFn(timeFrame){
  let now = new Date();  
          now.setHours(0, 0, 0, 0); 
          switch (timeFrame) {
            case 'All':
                  orderDate = { $gte: new Date(now.getFullYear(), 0, 1) };
                  break;
              case 'Daily':
                  orderDate = { $gte: now };
                  break;
              case 'Weekly':
                  let startOfWeek = new Date(now);
                  startOfWeek.setDate(now.getDate() - now.getDay());
                  orderDate = { $gte: startOfWeek };
                  break;
              case 'Monthly':
                  orderDate = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
                  break;
              case 'Yearly':
                  orderDate = { $gte: new Date(now.getFullYear(), 0, 1) };
                  break;
          }
          return orderDate;
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

const createReport = async(req,res)=>{
  console.log('entered!!!');
  try{
    let filter = {};
    const {timeFrame} = req.body;
    if (timeFrame) {
      filter.orderDate = timeframeFn(timeFrame);
    }

    const orders = await orderModel.find(filter).populate('user');
    console.log(orders,'reqqq');
    const htmlContent = fs.readFileSync('./views/admin/order-list-pdf.ejs', 'utf8');
        const template = handlebars.compile(htmlContent);

        
        let tableContent = `
            <table class="table border my-5" style="font-size: 10px">
                <thead>
                    <tr class="bg-primary-subtle">
                        <th scope="col">Order Id</th>
                        <th scope="col">Billing Name</th>
                        <th scope="col">Date</th>
                        <th scope="col">Discount</th>
                        <th scope="col">Order Status</th>
                        <th scope="col">Payment Method</th>
                    </tr>
                </thead>
                <tbody>
        `;
        console.log(orders,'orderssss');
        orders.forEach((item, index) => {
          console.log(item,'order id ');
            tableContent += `
                <tr>
                <td>${item.oId}</td>
                <td>${item.user.name}</td>
                <td>${item.orderDate}</td>
                <td>${item.price}</td>
                <td>${item.status}</td>
                <td>${item.status}</td>
                <td>${item.paymentMethod}</td>
                </tr>
            `;
        });

        tableContent += `
                </tbody>
            </table>
        `;
        const renderedHtml = template( {tableContent} );

        const browser = await puppeteer.launch();
        const paged = await browser.newPage();

        const marginOptions = {
            top: '1cm',
            bottom: '1cm',
            left: '1cm',
            right: '1cm'
        };

        await paged.setContent(renderedHtml);
        const pdfBuffer = await paged.pdf({
            format: 'A4',
            margin: marginOptions
        });

        await browser.close();

        res.setHeader('Content-Disposition', 'inline; filename="Sales Report"');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Error generating PDF" });
    }

}

const filterProducts = async (req, res) => {
  console.log("Filtering products");
  try {
      let filter = {};
      const type = req.query.type;

      if (type === 'product') {
          // Aggregate to find the most sold products by summing quantities sold
          const productSales = await orderModel.aggregate([
              { $unwind: "$items" },
              { $group: {
                  _id: "$items.productId",
                  totalSold: { $sum: "$items.quantity" }
              }},
              { $sort: { totalSold: -1 } },
              { $limit: 10 } // Adjust the limit as needed to show more or fewer products
          ]);

          console.log(productSales, "Product sales");

          // Convert aggregated results to product IDs for the query
          const productIds = productSales.map(sale => sale._id);
          filter._id = { $in: productIds }; // Ensure that the filter is correctly formatted

      } else if (type === 'category') {
          // Aggregate to find the most sold categories
          const categorySales = await orderModel.aggregate([
              { $unwind: "$items" },
              { $lookup: {
                  from: "products", // Ensure this is the correct collection name in your DB
                  localField: "items.productId",
                  foreignField: "_id",
                  as: "productDetails"
              }},
              { $unwind: "$productDetails" },
              { $group: {
                  _id: "$productDetails.category",
                  totalSold: { $sum: "$items.quantity" }
              }},
              { $sort: { totalSold: -1 } },
              { $limit: 1 }
          ]);

          if (categorySales.length > 0) {
              filter.category = categorySales[0]._id;
          }
      }

      const products = await productModel.find(filter).populate('category');
      console.log(products,'..............');
      res.json({status: true, products });
  } catch (error) {
      console.error("Error filtering products:", error);
      res.status(500).json({ message: error.message });
  }
};


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
    updateorder,
    createReport,
    filterProducts
}