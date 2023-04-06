const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ProductModel = mongoose.model('ProductModel')
const protectedResource = require('../middlewares/protectedResource');
const UserModel = mongoose.model('UserModel')
const ReviewModel = mongoose.model('ReviewModel')
const CartItemsModel = mongoose.model('CartItemsModel')


router.post('/addproduct', (req, res) => {
    const { name, description, price, quantity } = req.body;
    if(!name || !description || !price || !quantity) {
        return res.status(400).json({
            error: 'One or more mandetory fields are empty'
        })
    }
    const product = new ProductModel({
        name, description, price, quantity
    });
    product.save()
    .then((newProduct) => {
        return res.status(201).json({
            result: "Product added successfully"
        })
    })
    .catch((err) => {
        console.log(err)
    })
})

async function getAllProducts() {
    try {
      const products = await ProductModel.find();
      return products;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

router.get('/allproducts',protectedResource ,(req, res) => {
    let product = getAllProducts()
    product.then((result) => res.send(result))
    .catch((err) => {
        res.send(err)
    })
})

router.post('/addtocart', (req, res) => {
    const {_id, quantity, userId} = req.body;
    ProductModel.find({_id:_id})
    .then((productFound) => {
        console.log(productFound[0])
        if(productFound[0].quantity - quantity < 1) {
            return res.status(400).json({
                error: 'Out of stock'
            });
        }
        let updatedQauntity = productFound[0].quantity-=quantity;
        const updated =  ProductModel.findByIdAndUpdate(
           _id,
           {quantity: updatedQauntity},
           {new : true}
        )
        const name = productFound[0].name;
        const price = productFound[0].price;
        updated.then((resp)=> console.log(resp))
        const newCartItem = new CartItemsModel({
            _id, name, price 
        })
        UserModel.findOneAndUpdate({_id: userId}, { $push: {cart: newCartItem}}, {new: true})
        .then((result) => {
            return res.status(201).json({
                message: 'Item added to cart'
            })
        })
        .catch((err) => {
            return res.status(404).json({
                error: err
            })
        })
    })
    .catch((err) => {
        console.log(err);
        res.status(201).json({
            
        });
    })
})

router.get('/getproductbyid/:id', (req, res) => {
    const id = req.params;
    console.log(id.id)
    ProductModel.findById(id.id)
    .then((product) => {
        res.status(200).json({
            product
        })
    })
    .catch((err) => {
        res.status(404).json({
            error: "Product not found"
        })
    })
})


router.post('/addreview/:productId', (req, res) => {
    const _id = req.params.productId;
    const {user, rating, text} = req.body;
    const newReview = new ReviewModel({
        user, rating, text
    })

    ProductModel.findOneAndUpdate(
        { _id: _id },
        { $push:{reviews: newReview} },
        { new: true })
        .then((newObj) => {
            res.status(201).json({
                success: 'Review added'
            })
        })
        .catch((error) => {
            res.status(404).json({
                error: 'Product not found'
            })
        })
    
})

router.get('/userscartitems/:userId', (req, res) => {
    const userId = req.params.userId
    UserModel.find({_id: userId})
    .then((userFound) => {
        res.status(200).json({
            userFound
        })
    })
    .catch((err) => {
        res.status(404).json({
            error: "Products couldn't found"
        })
    })
})

module.exports = router;
