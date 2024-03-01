const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const {sendInsertOtp} = require("../util/insertotp");
const ProductModel=require('../models/productModel');
const categoryModel=require('../models/categoryModel');

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
            return res.redirect('/login'); // Fix: Use `return` to prevent further execution
        }
        else{
            return res.status(400).json({error:"otp invalid"}); // Fix: Use `return` to prevent further execution
        }
    } catch (error) {
        console.log('Error in OTP verification:', error);
        return res.render('verifyOTP', { message: 'An error occurred during OTP verification. Please try again later.' });
    }
};


const loadHome = async(req,res)=>{
    try{
       const product=await ProductModel.find();
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
    
}