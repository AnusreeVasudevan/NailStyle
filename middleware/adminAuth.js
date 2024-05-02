const isLogin = async(req,res,next)=>{
    try{
        req.session.user_id = '65d58472c4dd0b9f64ee11aa';
        if(req.session.user_id){
            next();
        } else{
            res.redirect('/admin');
        }
        
    }catch(error){
        console.log(error.messag);
    }
}

const isLogout = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/admin/home');
        }else{
        next();}
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}