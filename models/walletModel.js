const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId;
const walletSchema=new mongoose.Schema({
    user:{
        type:ObjectID,
        ref:'Users'
    },
    balance: Number,
    actions:[
        {
            credit: Boolean,
            amount:Number,
            ref:String,
            order:{
                type:ObjectID
            },
            createdAt:{
                type:Date,
                default:Date.now()
            }
        }
    ]
})


const walletModel=mongoose.model('Wallet',walletSchema)
module.exports=walletModel