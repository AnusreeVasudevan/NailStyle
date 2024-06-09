const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const {sendInsertOtp} = require("../util/insertotp");
const ProductModel=require('../models/productModel');
const categoryModel=require('../models/categoryModel');
const addressModel=require('../models/addressModel');
const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel')
const fs = require('fs');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const walletModel = require('../models/walletModel')


// Import necessary modules
const {generateOTP} = require('../util/otpgenerator'); // Import OTP generator function


//login user methods started

const loginLoad = async(req,res)=>{
    try{
        res.render('login');
    } catch(error){
        console.log(error.message); 
    }
}

const loadRegister = async(req,res)=>{
    try{
        console.log('hlo................');
        res.render('register');
    } catch(error){
        console.log(error.message);
    }
}

const insertUser = async (req, res) => {
    try {
        // Check if passwords match
        // if (req.body.password === req.body.confirm_password) {
        //     console.log('okkkkkkkkkkkkkkk');
        //     res.redirect('/verifyOTP'); // Redirect back to registration page with an error message
        // }

        // Generate OTP
        const otp = generateOTP();
        console.log(otp);

        // Storing into session
        req.session.Data = { ...req.body, otp };
        req.session.save();
        console.log(req.session, 'this is session');

        console.log(otp);
        console.log(req.session.Data.otp, 'wWWWWWW');
        const sentEmail = await sendInsertOtp(req.body.email, otp);
        if (sentEmail) {
            res.redirect('/verifyOTP');
        }
    } catch (error) {
        console.log('otp',error.message);
        // res.status(500).send('Internal Server Error');
    }
};


// Load to otp page

const loadOtp = async(req,res)=>{
    try{
        res.render('verifyOTP',{message:null});
    }catch(error){
        console.log(error.message);
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};
    
const getOtp = async(req,res)=>{
    // console.log("ssjtgjuykdfg")
    try{
        const otpInBody = req.body.otp;
        console.log(otpInBody,'otp...............................');
        const otp = req.session.Data.otp;

        if(otpInBody === otp){
            const {name,email,mobile,password} = req.session.Data
            console.log("username:",name);
            console.log("email:",email);
            console.log("mobile:",mobile); // Fix: Use `mobile` instead of `mobileno`
            console.log("password:",password); // Fix: Use `password` instead of `userpassword`

            // const passwordHash = await bcrypt.hash(password,10);
            const passwordHash = await securePassword(req.session.Data.password);
            const existingUser = await User.findOne({email:email})
            if(!existingUser){
                const user = new User({
                    name: name,
                    email: email,
                    mobile: mobile,
                    password: passwordHash,
                    is_admin: 0,
                    is_verified: 1,
                    is_blocked: false
                });
                await user.save();//save to db
            }


     
        // Create a new wallet only if it doesn't exist
        let wallet = new walletModel({ user: req.session.user, balance: 0, actions: [] });
        await wallet.save();
      
            return res.redirect('/login'); 
        }
        else{
            return res.status(400).json({error:"otp invalid"}); 
        }
    } catch (error) {
        console.log('Error in OTP verification:', error);
        return res.render('verifyOTP', { message: 'An error occurred during OTP verification. Please try again later.' });
    }
};


const loadHome = async(req,res)=>{
    try{
       const product=await ProductModel.find().sort({createdAt:-1});
       if(!product){
        product=null;
       }
        res.render('home',{product});
    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try{
        
        const { email,password } = req.body;
       // console.log(email,password );
        if(!email || !password){
            req.flash('error',"Email and Password are required");
            console.log("Email and Password are required");
            return res.redirect('/login');
        }
        const userData = await User.findOne({ email });
       // console.log(userData);
        if(!userData){
            req.flash('error','User Not Found');
            console.log("User Not Found");
            return res.redirect('/login');
        }
        if(userData.is_blocked){
            req.flash('error','Sorry!!! User is Blocked');
            console.log("User is blocked");
            return res.redirect('/login');
        }
        const hashedPassword = await bcrypt.compare(password,userData.password);
        if(!hashedPassword){
            req.flash('error','Invalid Password');
            console.log("invalid password");
            return res.redirect('/login');
        }
        if(email===userData.email && hashedPassword ){
            req.session.user = userData._id;
            console.log(req.session.user);
            console.log("OKOKOKOK")
            res.redirect('/home');
        }
        
    } catch(error){
        console.log(error.message);
        return res.status(500).json({message: "Internal Server Error"});
    }
}



let resendOtp = async (req, res) => {
    try {
        const otp = generateOTP();
        // console.log(req.session.Data.email,otp);
         await sendInsertOtp(req.session.Data.email, otp);
    
            req.session.Data.otp=otp;
            res.status(200).json({
                status: true
              })
              
      
      
    } catch (error) {
      console.error('Error resending OTP:', error);
      res.status(500).json({
        status: false,
        message: 'Error resending OTP'
      });
    }
  };


  const userLogout = async(req,res)=>{

    try{
        req.session.user=false;
        res.redirect('/');
    }catch(error){
        console.log(error.message)
    }
}

const loadShop = async(req, res) => {
    try {
        const category = await categoryModel.find({is_active:false});
        if(req.session.search){
            search = req.session.search;
        }else{
            search = ""
        }
        res.render('shop',{category,search});
    } catch(error) {
        console.log(error.message);
    }
};


const loadForgotPasswordemail = async(req,res)=>{
    console.log("entered in forget passsword")
    try{
        res.render('emailforgotpassword');
    }catch(error){
        console.log(error.message);
    }
}


const loadpasswordReset = async (req, res) => {
    try {
        // If there's a need to send OTP
        if (req.body.email && !req.body.otp) {
            const user = await User.findOne({ email: req.body.email });
            if(!user){
                req.flash('error','User Not Found');
                console.log("User Not Found");
                return res.redirect('/login');
            }
            const otp = generateOTP();
            await sendInsertOtp(req.body.email, otp);

            // Initialize `Data` object in session if it doesn't exist
            if (!req.session.Data) {
                req.session.Data = {};
            }

            // Store OTP and email in session for later verification
            req.session.Data.otp = otp;
            req.session.Data.email = req.body.email;

            // Respond with success or redirect as appropriate
            return res.redirect('/forgotpassword');
        }
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).send({ error: 'An error occurred while processing your request.' });
    }
};


const loadForgotPassword = async(req,res)=>{
    try{
        res.render('forgotpassword');
    }catch(error){
        console.log(error.message);
    }
}

const passwordReset = async (req, res) => {
    try {
        const { otp, newPassword, confirmNewPassword } = req.body;
        const { Data } = req.session;

        // Validate session Data and OTP
        if (!Data || !Data.otp || otp !== Data.otp) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        // Validate passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password in the database
        const user = await User.findOneAndUpdate(
            { email: Data.email }, // Make sure 'email' is correctly indexed and exists in your User model
            { password: hashedPassword },
            { new: true }
        );

        // Clear the session data related to password reset
        delete req.session.Data;

        return res.redirect('/login');
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).send({ error: 'An error occurred while processing your request.' });
    }
};


const loaduserprofile = async (req, res) => {
  try {
    console.log(req.session.user)
      let address = await addressModel.findOne({ user: req.session.user }) || null;
      const orders = await orderModel.find({ user: req.session.user }).sort({ orderDate: -1 }) || [];
      const user = await User.findById(req.session.user);
      let wallet = await walletModel.findOne({user:req.session.user})|| { balance: 0, transactions: [], actions:[] };
        console.log(wallet,"mywallet")
    
    //   console.log( orders,'AAAAAAA');
      res.render('userProfile', { user, address, orders, wallet });
  } catch (error) {
      console.log('loaduserProfile Error:', error.message);
  }
};


  const editprofile = async (req, res) => {
    try {
        let address = await addressModel.findOne({
            user: req.session.user
          }) || null;
      const { name, mobile, email } = req.body;
  
      const existemail = await User.findOne({ email: email});
      const user = await User.findById(req.session.user);
    //   let wish=await wishlistModel.findOne({user:user._id});
    //   if(!wish){
    //     wish=null;
    //   }
    //   let cart=await cartModel.findOne({owner:user._id})
    //   if(!cart)
    //   {
    //   cart=null;
    //   }
    
    
  
      // Check if the mobile already exists for another user
      const orders=await orderModel.findOne({user:req.session.user});
      const wallet = await walletModel.findOne({user:req.session.user})
      const existingUserWithMobile = await User.findOne({ mobile: mobile });
      if (existingUserWithMobile && existingUserWithMobile.email!==user.email) {
        return res.render('userProfile', { error: 'There is a user with this mobile number.', user,address,orders,wallet});
        // return res.render('user-detail', { error: 'There is a user with this mobile number.', user,wish,cart });
      }
  
      // Update user details
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.session.user},
        {
          $set: {
            name: name,
            mobile: mobile
          }
        },
        { new: true }
      );
  
  
      if (updatedUser) {
        return res.render('userProfile', { message: 'Updated successfully!', user: updatedUser,address,orders,wallet});
        // return res.render('user-detail', { message: 'Updated successfully!', user: updatedUser ,wish,cart});

      } else {
        return res.render('userProfile', { error: 'Failed to update user details.', user,address,orders,wallet});
        // return res.render('user-detail', { error: 'Failed to update user details.', user,wish,cart });

      }
    } catch (error) {
      console.log('editprofile', error.message);
     
    }
  };
  
  const loadaddaddress = async(req,res)=>{
    try{
        res.render('addAddress');
    } catch(error){
        console.log(error.message); 
    }
}

const addAddress = async (req, res) => {
    try {
   
      
      const {
        addressType,
        houseNo,
        street,
        landmark,
        pincode,
        city,
        district,
        state,
        country
      } = req.body;
  
   
      const user = await User.findById(req.session.user);
      // console.log(user);
      if (!user) {
       console.log('user is not found');
      }
  
     
      let useraddresses = await addressModel.findOne({
        user: user._id
      });
  
      if (!useraddresses) {
        // If the useraddresses document doesn't exist, create a new one
        useraddresses = new addressModel({
          user:  user._id,
          addresses: []
        });
      }
    //   let wish=await wishlistModel.findOne({user:user._id});
    //   if(!wish){
    //     wish=null;
    //   }
    //   let cart=await cartModel.findOne({owner:user._id})
    //   if(!cart)
    //   {
    //   cart=null;
    //   }
  
      // Check if the address already exists for the user
      const existingAddress = useraddresses.addresses.find((address) =>
        address.addressType === addressType &&
        address.HouseNo === houseNo &&
        address.Street === street &&
        address.pincode === pincode &&
        address.Landmark === landmark &&
        address.city === city &&
        address.district === district&&
        address.State === state &&
        address.Country === country
      );
      const existtype=useraddresses.addresses.find((address) =>address.addressType === addressType);
      if (existingAddress) {
       
        res.render('addAddress',{error:'Address already exists for this user'});
        // res.render('add-address',{error:'Address already exists for this user',wish,cart});
      }
      
      else if(existtype) {
       
        res.render('addAddress',{error:`${existtype.addressType} is alredy registered`});
        // res.render('add-address',{error:`${existtype.addressType} is alredy registered`,wish,cart});
      }
    
      else if (useraddresses.addresses.length >= 3) {
        
        res.render('addAddress',{error:'User cannot have more than 3 addresses'});
        // res.render('add-address',{error:'User cannot have more than 3 addresses',cart,wish});
      }
  else{
      // Create a new address object
      const newAddress = {
        addressType: addressType,
        HouseNo: houseNo,
        Street: street,
        Landmark: landmark,
        pincode: pincode,
        city: city,
        district: district,
        State: state,
        Country: country,
      };
  
      useraddresses.addresses.push(newAddress);
  
  
      await useraddresses.save();
  
     res.redirect('/userProfile');
    }
    } catch (err) {
    
      console.log('addaddress:',err.message)
    }
  };

  const loadeditAddress=async(req,res)=>{
    try{
      const user= await User.findById(req.session.user);
      // console.log(user)
      let useraddresses = await addressModel.findOne({
        user:user._id
      });
      //console.log(useraddresses)
      const addressType=req.query.addressType;
      
      const address = useraddresses.addresses.find(address => address.addressType === addressType);
   // console.log(address);
//    let wish=await wishlistModel.findOne({user:user._id});
//    if(!wish){
//      wish=null;
//    }
//    let cart=await cartModel.findOne({owner:user._id})
//    if(!cart)
//    {
//    cart=null;
//    }
  
  if (address) {
     
      res.render('editAddress', { addresses: address });
    //   res.render('edit-address', { address: address,wish,cart });
  } else {
      
      console.log('Address or HouseNo not found');
      
  }
  
    
    }
    catch(error){
      console.log('editAddress',error.message);
    }
  
  };

//   const editAddress = async (req, res) => {
//     try {
//       const {
//         addressType,
//         houseNo,
//         street,
//         landmark,
//         pincode,
//         city,
//         district,
//         state,
//         country
//       } = req.body;
  
     
//       const addresses = await addressModel.findOne({
//         user: req.session.user
//       })
  
//       if (!addresses) {
//         console.log('address is not found');
//       }
//     //   let wish=await wishlistModel.findOne({user:user._id});
//     //   if(!wish){
//     //     wish=null;
//     //   }
//     //   let cart=await cartModel.findOne({owner:user._id})
//     //   if(!cart)
//     //   {
//     //   cart=null;
//     //   }
//       const addressToEdit = addresses.addresses.find(addr => addr.addressType === addressType);
  
//       if (!addressToEdit) {
        
//         console.log('Address with type not found')
//       }
  
//       addressToEdit.HouseNo = houseNo;
//       addressToEdit.Street = street;
//       addressToEdit.Landmark = landmark;
//       addressToEdit.pincode = pincode;
//       addressToEdit.city = city;
//       addressToEdit.district = district;
//       addressToEdit.State = state;
//       addressToEdit.Country = country;
  
//       await addresses.save();
//       res.render('userProfile', {addresses,message:'Updated sucessfully!'});
//     //   res.render('edit-address', { addresses,message:'Updated sucessfully!',wish,cart});

  
//     } catch (err) {
//       console.error(err);
//      console.log('editAddress:',err.message)
//   }
//   }
   

const editAddress = async (req, res) => {
    try {
        const {
            addressType,
            houseNo,
            street,
            landmark,
            pincode,
            city,
            district,
            state,
            country
        } = req.body;

        const addresses = await addressModel.findOne({
            user: req.session.user
        });

        if (!addresses) {
            console.log('Address is not found');
            // Handle the case where addresses are not found
            return res.status(404).send('Address not found');
        }

        const addressToEdit = addresses.addresses.find(addr => addr.addressType === addressType);

        if (!addressToEdit) {
            console.log('Address with type not found');
            // Handle the case where the specified address type is not found
            return res.status(404).send('Address type not found');
        }

        // Update the address fields
        addressToEdit.HouseNo = houseNo;
        addressToEdit.Street = street;
        addressToEdit.Landmark = landmark;
        addressToEdit.pincode = pincode;
        addressToEdit.city = city;
        addressToEdit.district = district;
        addressToEdit.State = state;
        addressToEdit.Country = country;

        // Save the changes
        await addresses.save();
        const user=await User.findById(req.session.user)
        const orders = await orderModel.findOne({user:user._id});
        // Render the editAddress template with the updated addresses
        return res.render('userProfile', { address:addresses, message: 'Updated successfully!' ,user,orders});
    } catch (err) {
        console.error('editAddress:', err.message);
        // Handle errors
        return res.status(500);
    }
};

const deleteAddress=async(req,res)=>{
    try{
     
    
          const user = await User.findById(req.session.user);
          if (!user) {
            return res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }
         
          //console.log(user);
          const addresses = await addressModel.findOne({
            user: user._id
          })
          // console.log(addresses);
      
         
      
          const addressTypeToDelete = req.query.addressType; 
      
          const addressIndexToDelete = addresses.addresses.findIndex((address) => address.addressType === addressTypeToDelete);
      
         
        
          addresses.addresses.splice(addressIndexToDelete, 1);
      
          await addresses.save();
      
         
      
    }
    catch(error){
      console.log('deleteAddress',error.message);
    
    }
    };

    
const cancelorder = async (req, res) => {
  try {
      const { reason, oId } = req.body;

      if (!reason || !oId) {
          return res.status(400).json({ success: false, error: "Reason and orderId are required" });
      }

      const order = await orderModel.findOne({ oId });
      console.log(order,"cancelled order")

      if (!order) {
          return res.status(404).json({ success: false, error: "Order not found" });
      }

      // Add cancellation request to the order
      const newCancelRequest = {
          type: 'Cancel',
          status: 'Pending',
          reason: reason
      };
      
      order.requests.push(newCancelRequest);
      await order.save();

      let wallet = await walletModel.findOne({usre:req.session.user});
      
      const credit = order.billTotal;
      wallet.balance = credit;
      wallet.actions.push({amount : credit, ref:order.requests.reason, order:order._id, createdAt: new Date()})
      await wallet.save();

      res.json({ success: true, message: "Order canceled successfully and Amount refunded successfully" });
  } catch (error) {
      console.error("deleteOrder error:", error);
      return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const returnOrder = async (req, res) => {
    try {
        const { reason, oId } = req.body;

        if (!reason || !oId) {
            return res.status(400).json({ success: false, error: "Reason and orderId are required" });
        }

        const order = await orderModel.findOne({ oId });

        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        // Check if the order status is 'Delivered' to allow return request
        if (order.status !== 'Delivered') {
            return res.status(400).json({ success: false, error: "Cannot return order. Order is not delivered yet." });
        }

        // Add return request to the order
        const newReturnRequest = {
            type: 'Return',
            status: 'Pending',
            reason: reason
        };
        
        order.requests.push(newReturnRequest);
        await order.save();

        res.json({ success: true, message: "Return request submitted successfully" });
    } catch (error) {
        console.error("returnOrder error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

const downloadInvoice = async(req,res)=>{
    console.log("invoice downloaded");
    try{
        console.log(req.body)
        console.log(req.params)
        const  {oId}  = req.params;
        const orders = await orderModel.findOne({_id:oId}).populate('user').populate('items.productId');
        console.log("jhgsjdhga "+orders,'orderszzz');
        const htmlContent = fs.readFileSync('./views/user/invoice-pdf.ejs', 'utf8');
        const template = handlebars.compile(htmlContent);
        let discount,shipping
        if(orders.coupondiscount==NaN){
            discount=orders.coupondiscount

        }
        else{
            discount="NA"
        }
        if(orders.shipping==NaN){
            shipping=orders.shipping

        }
        else{
            shipping="NA"
        }
        const {HouseNo, Street, Landmark, pincode,city,district,State,Country}=orders.deliveryAddress

        let addresscontent = `<p>Order Number: ${orders.oId}</p>
        <p class="text-primary">Invoice To</p>
        <h4>${orders.user.name}</h4>
        <ul class="list-unstyled">
            <li>${HouseNo}, ${Street}, ${Landmark} </li>
            <li>${city}, ${ district}, ${State}</li>
            <li>${Country} - ${pincode}</li>
        </ul>`
        
        let tableContent = `
            <table class="table border my-5" style="font-size: 10px">
                <thead>
                    <tr class="bg-primary-subtle">
                        <th scope="col">Name</th>
                        <th scope="col">Rate</th>
                        <th scope="col" style="width:80px">Quantity</th>
                        <th scope="col">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        `;
console.log(orders,'1111111111111');
        orders.items.forEach((item, index) => {
            tableContent += `
                <tr>
                <td>${item.productId.name}</td>
                <td>${item.productId.discountPrice}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                </tr>
            `;
        });
        tableContent += `
                <tr>
                <td></td>
                <td></td>
                <td></td>
                <td>Total<br>Discounts<br>Shipping<br><span style="color:blue">Grand Total</span></td>
                <td>${orders.billTotal}<br>${orders.discountPrice}<br>${shipping}<br><span style="color:blue">${orders.discountPrice}</span></td>
                </tr>
            `;    
        tableContent += `
                </tbody>
            </table>
        `;
        const renderedHtml = template( {tableContent,addresscontent} );

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

        res.setHeader('Content-Disposition', 'inline; filename="Invoice"');
        res.setHeader('Content-Type', 'application/pdf');
        console.log("chummmaaaa");
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Error generating PDF" });
    }
}


const loadMyProducts = async (req,res)=>{
    try{
        let {category,minamount,maxamount,sort,stock,search,page} = req.body.obj
        let sortOption = {};

        switch(sort) {
            case 'rating':
                sortOption = { rating: -1 }; 
                break;
            case 'priceAsc':
                sortOption = { discountPrice: 1 }; 
                break;
            case 'priceDesc':
                sortOption = { discountPrice: -1 }; 
                break;
            case 'newness':
                sortOption = { createdAt: -1 }; 
                break;
            case 'nameAsc':
                sortOption = { name: 1 }; 
                break;
            case 'nameDesc':
                sortOption = { name: -1 }; 
                break;
            
            default:
                sortOption = { createdAt: -1 }; 
                break;
        }
         console.log(category,minamount,maxamount,sort,stock,search,page,"MyData")
         if(search)
            req.session.search = search;

            
            if(stock){
                stock = 1;
            }else{
                stock = 0;
            }
            let limit = 4 , skip = (page-1)*limit
            const product = await ProductModel.find({is_deleted:false,category:category,discountPrice:{$gte:minamount,$lte:maxamount},countInStock:{$gte:stock},name: { $regex: new RegExp(search,"i") },description: {$regex: new RegExp(search,"i")}}).sort(sortOption).skip(skip).limit(limit);
            const pro = await ProductModel.countDocuments({is_deleted:false,category:category,discountPrice:{$gte:minamount,$lte:maxamount},countInStock:{$gte:stock},name: { $regex: new RegExp(search,"i") },description: {$regex: new RegExp(search,"i")}});
            // const product = await ProductModel.countDocuments({is_deleted:false,category:category,discountPrice:{$gte:minamount,$lte:maxamount}}).sort(sortOption);
        //  console.log(category,"mycategory")
         console.log(product,"MyProducts")
         res.status(200).json({message:"success",product,limit,pro})
    }catch(error){

    }
}

module.exports = {
    loginLoad,
    loadRegister,
    insertUser,
    loadOtp,
    getOtp,
    loadHome,
    verifyLogin,
    resendOtp,
    userLogout,
    loadShop,
    loadForgotPasswordemail,
    loadpasswordReset,
    loadForgotPassword,
    passwordReset,
    loaduserprofile,
    editprofile,
    loadaddaddress,
    addAddress,
    loadeditAddress,
    editAddress,
    deleteAddress,
    cancelorder,
    returnOrder,
    downloadInvoice,
    loadMyProducts
    
}