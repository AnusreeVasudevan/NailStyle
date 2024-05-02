const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId;
const walletSchema=new mongoose.Schema({
    user:{
        type:ObjectID,
        ref:'Users'
    },
    credit:{
        type:Boolean
    },
    balance: Number,
    actions:[
        {
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


const walletModel=mongoose.Schema('Wallet',walletSchema)
module.exports=walletModel