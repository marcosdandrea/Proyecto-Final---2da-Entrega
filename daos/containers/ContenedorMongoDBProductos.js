const mongoose = require("mongoose")
const crypto = require('crypto');
const productos = require("../../models/products")

class ContenedorMongoDB {

    constructor({ filename }) {
        this.filename = filename;
    }

    //PUBLIC METHODS

    async save({ cartID, product }) {
        await mongoose.connect(process.env.MONGO_URL)

        const newProduct = new productos(product)
        await newProduct.save()
        mongoose.disconnect();
        return (newProduct._id)


    }

    async modifyEntry(id, object) {
        await mongoose.connect(process.env.MONGO_URL)

        return await productos.find({ _id: id }).updateOne(object)
    }

    async getById(id) {
        await mongoose.connect(process.env.MONGO_URL)
        return await productos.find({ _id: id })
    }

    async getAll() {
        await mongoose.connect(process.env.MONGO_URL)
        return await productos.find({})
    }

    async deleteByID(id) {
        await mongoose.connect(process.env.MONGO_URL)
        return await productos.findOneAndRemove({ _id: id })
    }


}
verbose = false;

module.exports = ContenedorMongoDB