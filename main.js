const express = require('express');
const ApiProducts = require('./apis/ApiProducts')
const ApiCart = require('./apis/ApiCart')
const {ContenedorCarrito, ContenedorProductos} = require("./daos/daoIndex")

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const APP_PORT = 8080;

app.listen(APP_PORT, () => {

    const middlewareAuthentication = (req, res, next) => {
        req.user = {
            username: "mdandrea",
            isAdmin: true
        };
        //res.status(401).send (JSON.stringify({error: "User not authenticated"}))
        next();
    }

    const middlewareAuthorization = (req, res, next) => {
        if (req.user.isAdmin) next();
        else res.status(403).send (JSON.stringify({error: "User not authorized"}))
    }

    const apiConfigProducts = {
        apiRoute: "/api/productos",
        notAllowed: "../public/notAllow.html",
        notFound: "../public/noProducts.html",
        middlewareAuthentication,
        middlewareAuthorization
    }

    const containerConfigProducts = {
        filename: "./data/productos.json",
        databaseName: "productos"
    }

    new ApiProducts(app, apiConfigProducts, new ContenedorProductos(containerConfigProducts))

    const apiConfigCart = {
        apiRoute: "/api/carrito",
        notAllowed: "../public/notAllow.html",
        notFound: "../public/noItems.html",
        middlewareAuthentication,
        middlewareAuthorization
    }

    const containerConfigCart = {
        filename: "./data/carrito.json",
        databaseName: "carrito"
    }

    new ApiCart(app, apiConfigCart, new ContenedorCarrito(containerConfigCart))

    app.use((req, res, next) => {
        res.status(404).send({
            status: 404,
            error: 'Not found'
        })
    })

    app.use(express.json())

    console.log("listening on port " + APP_PORT)
});