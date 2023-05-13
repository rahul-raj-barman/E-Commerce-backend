const express = require('express');
const mongoose = require('mongoose');
const UserModel = mongoose.model('UserModel');
const { JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    console.log(req.header)
    console.log(authorization)
    if(!authorization) {
        return res.status(401).json({
            error: "User not logged in"
        });
    }
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET, (error, payload) => {
        if(error) {
            return res.status(401).json({
                error: "User not logged in"
            })

        }
        const {_id} = payload;
        UserModel.findById(_id)
        .then((dbUser) => {
            if(!dbUser.isAdmin) {
                return res.status(403).json({
                    error: 'Forbidden request'
                })
            }
            req.user = dbUser;
            next();
        })
    })
}