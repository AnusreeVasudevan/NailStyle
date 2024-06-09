const userModel = require("../models/userModel")

const isLogin = async(req,res,next)=>{
    // req.session.user='65d599545a78f982240d2a0f'
    try{
        if(req.session.user){
            next();
        }else{
            res.redirect('/');
        }
    } catch(error){
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const isLogout = async(req,res,next)=>{
    try{

        if(req.session.user){
            res.redirect('/home')
        }else{
            next();
        }
        
    }
    catch(error){
        console.log(error.message);
    }
}

const checkAuth = (req, res, next) => {
    if (req.session.user) {
        // User is logged in, proceed
        next();
    } else {
        // User is not logged in, redirect to login page
        res.redirect('/login');
    }
};

const ifBlocked = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.session.user);
        
        if (user.is_blocked === true) {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect('/login');
            });
        } else {
            return next();
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    isLogin,
    isLogout,
    checkAuth,
    ifBlocked
};