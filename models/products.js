const mongoose = require("mongoose");

const productsCollection = "productos";

const productsSchema = new mongoose.Schema({
    productName: {type: String, require: true, max: 100},
    productDescription: {type: String, require: false, max: 255},
    productCode: {type: String, require: true, max: 100},
    productPrice: {type: Number, require: true},
    productStock: {type: Number, require: true},
    productID: {type: String, require: true, max: 100},
    productImageUrl : {type: String, require: true, max: 255}
})

const productos = mongoose.model(productsCollection, productsSchema);
module.exports = productos