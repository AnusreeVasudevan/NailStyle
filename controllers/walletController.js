const walletModel = require('../models/walletModel')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')


const wallet = async(req,res)=>{
    try{
        //console.log("enterd in walletfn")

        const order = await orderModel.find({status:"Canceled"})
        //console.log(order,"order came")
        
    }catch(error){
        //console.log(error.message)
    }
}


module.exports = {
    wallet
}


