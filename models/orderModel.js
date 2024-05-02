const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectID = mongoose.Schema.Types.ObjectId;

const orderSchema = new Schema({
      user: {
        type: ObjectID,
        ref: 'User',
       },
       payId:{
        type: String,
       },
      cart: {
        type: ObjectID,
        ref: 'carts',
      },
      oId: {
        type: String,
       },

      items: [{
        productId: {
          type: ObjectID,
          ref: 'Products',
           },
        image: {
          type: String,
           },
        name: {
          type: String,
           },
        productPrice: {
          type: Number,
           },
        quantity: {
          type: Number,
             min: [1, 'Quantity can not be less than 1.'],
          default: 1,
        },
        price: {
          type: Number,
           },
      }, ],
      billTotal: {
        type: Number,
       },
      paymentMethod: {
        type: String,
      },
      paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending',
      },
      deliveryAddress: {
        
          addressType: String,
          HouseNo: String,
          Street: String,
          Landmark: String,
          pincode: Number,
          city: String,
          district: String,
          State: String,
          Country: String,
        
       },
      orderDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled', 'Returned'],
        default: 'Pending'
      },
      reason: {
        type: String
      },


      requests: [{
        type: {
          type: String,
          enum: ['Cancel', 'Return'],
        },
        status: {
          type: String,
          enum: ['Pending', 'Accepted', 'Rejected'],
          default: 'Pending',
        },
        reason: String,
        // Add other fields as needed for your specific use case
      }, ],
    coupon:{//display them seperately
        type:String
    },
    discountPrice:{
      type: Number,
      default: 0,
   }

    },
  {
    timestamps: true
  , strictPopulate: false });

const orderModel = mongoose.model('orders', orderSchema);

module.exports = orderModel;