const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel'
  },
  rating: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryModel'
  },
  image: {
    type: String,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  reviews: [reviewSchema]
});

const ProductModel = mongoose.model('ProductModel', productSchema);
const ReviewModel = mongoose.model('ReviewModel', reviewSchema);

module.exports = { ProductModel, ReviewModel };
