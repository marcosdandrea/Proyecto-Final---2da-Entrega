require('dotenv').config()

let ContenedorCarrito = undefined;
let ContenedorProductos = undefined;

switch (process.env.DB_ENGINE) {

    case "localFile":
        console.info ("Using 'Local File' for data persistance")
        ContenedorCarrito = require("./containers/ContenedorLocalFileCarrito")
        ContenedorProductos = require("./containers/ContenedorLocalFileProductos")
        break;
    
    case "mongoDB":
        console.info ("Using 'MongoDB' for data persistance")
        ContenedorCarrito = require("./containers/ContenedorMongoDBCarrito")
        ContenedorProductos = require("./containers/ContenedorMongoDBProductos")
        break;

    case "firebase":
        console.info ("Using 'Firebase' for data persistance")
        ContenedorCarrito = require("./containers/ContenedorFirebaseCarrito")
        ContenedorProductos = require("./containers/ContenedorFirebaseProductos")
        break;

    default:
        break;
}

module.exports = {ContenedorCarrito, ContenedorProductos }