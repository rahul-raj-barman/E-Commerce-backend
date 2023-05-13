const mongoose = require('mongoose');

const ItemsInCartSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'UserModel'
  },
  name:{
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  count: {
    type: Number,
    required: false
  },
  image: {
    type: String
  }
}) 


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    required: false
  },
  address: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  zipcode: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  orders: {
    type: Array
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  cart:[ItemsInCartSchema]
});


module.exports = mongoose.model('UserModel', userSchema);
module.exports = mongoose.model('CartItemsModel', ItemsInCartSchema)