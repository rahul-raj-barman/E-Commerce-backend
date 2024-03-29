const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MONGODB_URL } = require('./config');
require('./models/user_model');
require('./models/product_model');
require('./models/oder_model')
const userRoutes = require('./routes/user_route');
const productRoutes = require('./routes/product_route')
const fileRoute = require('./routes/file-route')

// Initializing an express application
const app = express();

// MongoDB connection
mongoose.connect(MONGODB_URL);
mongoose.connection.on('connected', () => {
    console.log(mongoose.connection.name)
    console.log('DB connected....');
})
mongoose.connection.on('error', (error) => {
    console.log(error);
})

// Using the middlewares
app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));


// Using the routes
app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/', fileRoute);

app.listen('5000', () => {
    console.log('Listening on port 5000.....')
});
