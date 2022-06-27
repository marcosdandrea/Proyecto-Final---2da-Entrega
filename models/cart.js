const mongoose = require("mongoose");

const cartCollection = "carrito";

const cartSchema = new mongoose.Schema({

    cartID: { type: String, require: true, max: 100 },
    productName: {type: String, require: true, max: 100},
    productDescription: {type: String, require: false, max: 255},
    productCode: {type: String, require: true, max: 100},
    productPrice: {type: Number, require: true},
    productStock: {type: Number, require: true},
    productID: {type: String, require: true, max: 100},
    productImageUrl : {type: String, require: true, max: 255}

})

const carrito = mongoose.model(cartCollection, cartSchema);
module.exports = carrito