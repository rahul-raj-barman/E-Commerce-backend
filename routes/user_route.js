const mongoose = require('mongoose');
const UserModel = mongoose.model('UserModel');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config')
const bcyptjs = require('bcryptjs')
const protectedRoute = require('../middlewares/protectedResource');
const adminResource = require('../middlewares/adminResource');


router.post('/signup', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log(firstName)
    
    if(!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            error: 'One or more mandetory fields are empty'
        })
    }

    UserModel.findOne({email: email})
    .then((userFoundInDB) => {
        if(userFoundInDB) {
            return res.status(500).json({
                error: 'User with this email address already registered'
            })
        }
    })
    bcyptjs.hash(password, 12)
    .then((hashedPassword) => {
        const user = new UserModel({
            firstName, lastName, email, password:hashedPassword
        })
        user.save()
        .then((newUser) => {
            res.status(201).json({
                result: 'User signed up successfully',
                user: newUser
            })
        })
        .catch((err) => {
            res.status(404)
        })
    })

})

router.post('/login', (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    console.log(password)
    if( !email || !password) {
        return res.status(400).json({
            error: "Invalid credentials"
        })
    }
    UserModel.findOne({email : email})
    .then((userFoundInDB) => {
        if(!userFoundInDB) {
            return res.status(401).json({
                error: 'Invalid Credentials'
            })
        }
        bcyptjs.compare(password, userFoundInDB.password)
        .then((didMatch) => {
            if(didMatch) {
                const jwtToken = jwt.sign({ _id: userFoundInDB._id}, JWT_SECRET)
                const userDetails = {email, firstName: userFoundInDB.firstName, lastName: userFoundInDB.lastName, isAdmin: userFoundInDB.isAdmin}
                return res.status(200).json({
                    user_id: userFoundInDB._id,
                    token: jwtToken,
                    result: userDetails
                })
            }
            else {
                return res.status(401).json({
                    error: "Invalid credentials"
                })
            }
        })
        .catch((err) => {
            console.log(err)
        })
    })
    .catch((err) => {
        console.log(err)
    })
   

})



router.post('/editadress/:userid', (req, res) => {
    const userid = req.params.userid;
    const {name, address, phone, city, state, zip} = req.body;
    UserModel.findOneAndUpdate({_id : userid}, {address: address, firstName: name, state: state, phone:phone, city:city, zip:zip})
    .then((data) => {
        res.status(201).json({
            message : data
        })
    })
    .catch((err) => {
        res.status(404).json({
            error : err
        })
    })
})

router.get('/cartitemcount/:user', (req, res) => {
    const userId = req.params.user;
    console.log(userId)
    UserModel.find({_id: userId})
    .then((userFound) => {
        return res.status(200).json({
            userFound
        })
    })
    .catch((err) => {
        return res.status(404).json({
            error: "User not found"
        })
    })
})

router.get('/orders/:user', adminResource , (req, res) => {
    const userId = req.params.user;
    console.log(userId)
    UserModel.find({_id: userId})
    .then((userFound) => {
        return res.status(200).json({
            orders: userFound[0].orders
        })
    })
    .catch((err) => {
        return res.status(404).json({
            error: "User not found"
        })
    })
})

router.post('/addorder/:userid', adminResource, (req, res) => {
    const userid = req.params.userid;
    const {orderId, price} = req.body;
    UserModel.findByIdAndUpdate({_id: userid}, {$push: {orders: {orderId: orderId, price: price}}})
    .then((resp) => {
        res.status(201).json({
            message : 'Updates successfully !'
        })
    })
    .catch((err) => [
        res.status(400).json({
            error: err
        })
    ])
})


router.get('/getmyorders/:id', protectedRoute ,(req, res) => {
    const user_id = req.params.id;
    UserModel.findById(user_id)
    .then((userFound) => {
        if(!userFound) {
            return res.status(404).json({
                error: "User was not found!"
            })
        }
        return res.status(200).json({
            orders: userFound.orders
        })
    })
    .catch((err) => {
        return res.status(401).json({
            error: err
        })
    })
})



module.exports = router;