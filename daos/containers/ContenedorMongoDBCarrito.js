const mongoose = require("mongoose")
const crypto = require('crypto');
const carrito = require("../../models/cart")

class ContenedorMongoDB {

    constructor({ filename }) {
        this.filename = filename;
    }

    //PUBLIC METHODS

    async save({ cartID, product }) {
        await mongoose.connect(process.env.MONGO_URL)
        if (!cartID)
            product.cartID = crypto.randomUUID();
        else
            product.cartID = cartID
        const newCarrito = new carrito(product)
        await newCarrito.save()
        mongoose.disconnect();
        return (product.cartID)
    }

    async getById(id) {
        await mongoose.connect(process.env.MONGO_URL)
        return await carrito.find({ cartID: id })
    }

    async deleteByProductID(cartID, productID) {
        await mongoose.connect(process.env.MONGO_URL)
        return await carrito.findOneAndRemove({ cartID, productID })
    }


}
verbose = false;

module.exports = ContenedorMongoDB