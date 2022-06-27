const path = require("path")
const express = require("express")
const multer = require("multer");
const crypto = require("crypto")

const storage = multer.diskStorage({
    destination: "public/images",
    filename: (req, file, cb) => {
        const filename = file.originalname;
        cb(null, filename)
    }
})

const uploader = multer({ storage: storage })

module.exports = class Api {
    /**
     * 
     * @param {Express App} app 
     * @param {object} config 
     * @param {Contenedor} contenedor
     */
    constructor(app, config, contenedor) {

        this.app = app
        this.contenedor = contenedor;
        this.apiRouter = express.Router()

        this.apiRouter.get("/:id", (req, res) => {
            this.contenedor.getById(req.params.id)
                .then((cart) => {
                    if (cart.products == 0)
                        res.status(404).send(JSON.stringify({ error: 'no hay items' }))
                    else
                        res.status(200).send(JSON.stringify(cart))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(404).send(JSON.stringify({ error: 'item no encontrado' }))
                })
        })

        
        this.apiRouter.post("/", config.middlewareAuthentication, config.middlewareAuthorization, uploader.single("image"), (req, res) => {

            const productID = req.body.productID
            const productName = req.body.productName
            const productDescription = req.body.productDescription
            const productCode = req.body.productCode
            const productImageUrl = req.body.productImageUrl
            const productPrice = req.body.productPrice
            const productStock = req.body.productStock

            let product = [productID, productName, productDescription, productCode, productImageUrl, productPrice, productStock]

            if (product.some((entry)=>entry==undefined)) {
                res.status(404).send(JSON.stringify({ error: "datos incorrectos" }))
                return
            }

            product = {productID, productName, productDescription, productCode, productImageUrl, productPrice, productStock}

            this.contenedor.save({product})
                .then((id) => {
                            res.status(200).send(JSON.stringify({id}))                          
                })
                .catch((err) => {
                    console.log(err)
                    res.status(501).send(JSON.stringify({ error: 'cart no creado' }))
                })
        })

        this.apiRouter.post("/:cartID", config.middlewareAuthentication, config.middlewareAuthorization, uploader.single("image"), (req, res) => {

            const cartID = req.params.cartID
            const productID = req.body.productID
            const productName = req.body.productName
            const productDescription = req.body.productDescription
            const productCode = req.body.productCode
            const productImageUrl = req.body.productImageUrl
            const productPrice = req.body.productPrice
            const productStock = req.body.productStock

            const data = [productID, productName, productDescription, productCode, productImageUrl, productPrice, productStock]

            if (data.some((entry)=>entry==undefined)) {
                res.status(404).send(JSON.stringify({ error: "datos incorrectos" }))
                return
            }

            const product = {productID, productName, productDescription, productCode, productImageUrl, productPrice, productStock}

            console.log (product)

            this.contenedor.save({cartID, product})
                .then((id) => {
                            res.status(200).send(JSON.stringify({id}))                          
                })
                .catch((err) => {
                    console.log(err)
                    res.status(501).send(JSON.stringify({ error: 'no se agregó el producto al carrito' }))
                })
        })

        this.apiRouter.put("/:cartID", config.middlewareAuthentication, config.middlewareAuthorization, uploader.single("image"),  (req, res) => {

            const cartID = req.params.cartID
            const productID = req.body.productID
            const productName = req.body.productName
            const productDescription = req.body.productDescription
            const productCode = req.body.productCode
            const productImageUrl = req.body.productImageUrl
            const productPrice = req.body.productPrice
            const productStock = req.body.productStock

            const data = [cartID, productID, productName, productDescription, productCode, productImageUrl, productPrice, productStock]
            if (data.every((entry)=>entry==undefined)) {
                res.status(404).send(JSON.stringify({ error: "datos incorrectos" }))
                return
            }

            const product = {productID, productName, productDescription, productCode, productImageUrl, productPrice, productStock}
            contenedor.save({cartID, product})
                .then(() => {
                    res.status(200).send(JSON.stringify({ success: 'item agregado' }))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(501).send(JSON.stringify({ error: 'item no agregado' }))
                })

        })

        this.apiRouter.delete("/:cartID/:productID", (req, res) => {

            contenedor.deleteByProductID(req.params.cartID, req.params.productID)
                .then(() => {
                    res.status(200).send(JSON.stringify({ success: 'item eliminado' }))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(400).send(JSON.stringify({ error: 'no se pudo eliminar' }))
                })
        })

        this.apiRouter.delete("/:id", (req, res) => {

            contenedor.deleteByID(req.params.id)
                .then(() => {
                    res.status(200).send(JSON.stringify({ success: 'item eliminado' }))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(400).send(JSON.stringify({ error: 'no se pudo eliminar' }))
                })
        })
            
        this.app.use(config.apiRoute, this.apiRouter)

        this.app.use("/", express.static(path.join(__dirname, 'public')))
    }

}
