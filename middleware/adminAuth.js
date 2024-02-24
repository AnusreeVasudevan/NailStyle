const isLogin = async(req,res,next)=>{
    try{
        if(req.session.user_id){
        } else{
            res.redirect('/admin');
        }
        next();
    }catch(error){
        console.log(error.messag);
    }
}

const isLogout = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/admin/home');
        }
        next();
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}