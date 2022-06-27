const path = require("path")
const multer = require("multer");
const express = require("express")

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

        this.apiRouter.get("/", config.middlewareAuthentication, config.middlewareAuthorization, (req, res) => {

            contenedor.getAll()
                .then((products) => {
                    if (products.length == 0)
                        res.status(404).sendFile(path.join(__dirname, config.notFound))
                    else
                        res.status(200).send(JSON.stringify(products))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(404).sendFile(path.join(__dirname, config.notFound))
                })
        })

        this.apiRouter.get("/:id", config.middlewareAuthentication, config.middlewareAuthorization,  (req, res) => {

            this.contenedor.getById(req.params.id)
                .then((products) => {
                    if (products.length == 0)
                        res.status(404).send(JSON.stringify({ error: 'item no encontrado' }))
                    else
                        res.status(200).send(JSON.stringify(products))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(404).send(JSON.stringify({ error: 'item no encontrado' }))
                })
        })


        this.apiRouter.post("/", config.middlewareAuthentication, config.middlewareAuthorization, uploader.single("image"), (req, res) => {

            const { file } = req;
            const productName = req.body.productName
            const productDescription = req.body.productDescription
            const productCode = req.body.productCode
            const productPrice = req.body.productPrice
            const productStock = req.body.productStock
            const productID = req.body.productID

            const data = [file, productName, productDescription, productCode, productPrice, productStock, productID]
            if (data.some(entry => entry == undefined)) {
                res.status(404).send(JSON.stringify({ error: "datos incorrectos" }))
                return
            }

            const price = parseFloat(productPrice)
            const imgDir = "../images/"
            const productImageUrl = imgDir + file.filename
            const product = { productName, productDescription, productCode, productID, productImageUrl, price, productStock }
            this.contenedor.save({product})
                .then(id => {
                    res.status(200).send(id)
                })
                .catch((err) => {
                    console.log(err)
                    res.status(501).send(JSON.stringify({ error: 'item no agregado' }))
                })

        })

        this.apiRouter.put("/:id", config.middlewareAuthentication, config.middlewareAuthorization,  uploader.single("image"), (req, res) => {

            const { file } = req;
            const productName = req.body.productName
            const productDescription = req.body.productDescription
            const productCode = req.body.productCode
            const productPrice = req.body.productPrice
            const productStock = req.body.productStock 

            const data = [productName, productDescription, productCode, productPrice, productStock]

            if (data.every(entry => entry == undefined)) {
                res.status(404).send(JSON.stringify({ error: "datos incorrectos" }))
                return
            }

            let price = undefined
            if (productPrice)
            price = parseFloat(productPrice)
            const imgDir = "../images/"
            let productImageUrl = undefined
            if (file)
            productImageUrl = imgDir + file.filename

            const existingProduct = { productName, productDescription, productCode, productImageUrl, price, productStock }
            contenedor.modifyEntry(req.params.id, existingProduct)
                .then(() => {
                    res.status(200).send(JSON.stringify({ success: 'item modificado' }))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(501).send(JSON.stringify({ error: 'item no agregado' }))
                })

        })

        this.apiRouter.delete("/:id", config.middlewareAuthentication, config.middlewareAuthorization, (req, res) => {

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
