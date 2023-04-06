const mongoose = require('mongoose');
const UserModel = mongoose.model('UserModel');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config')
const bcyptjs = require('bcryptjs')
const protectedRoute = require('../middlewares/protectedResource')


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
    bcyptjs.hash(password, 18)
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
        .catch((err) => console.log(err))
    })

})

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(password)
    if(!email || !password) {
        return res.status(400).json({
            error: "Invalid credentials"
        })
    }
    UserModel.findOne({email : email})
    .then((userFoundInDB) => {
        bcyptjs.compare(password, userFoundInDB.password)
        .then((didMatch) => {
            if(didMatch) {
                const jwtToken = jwt.sign({ _id: userFoundInDB._id}, JWT_SECRET)
                const userDetails = {email}
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
        .catch((err) => [
            console.log(err)
        ])
    })
    .catch((err) => {
        console.log(err)
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

module.exports = router;