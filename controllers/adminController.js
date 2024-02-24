const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const bcrypt = require('bcrypt');
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
      req.session.destroy();
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


module.exports = {
    loadLogin,
    loadDashboard,
    verifyAdmin,
    logout,
    listUser,
    blockUser,
    unblockUser,
    loadCategory
}