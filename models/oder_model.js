const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    product: {
        type: Array,
        ref: "ProductModel",
    },
    status: {
        type: String,
    }
})

module.exports = mongoose.model('OrderModel', orderSchema);
