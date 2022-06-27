const fs = require('fs').promises;
const crypto = require('crypto');

class ContendorLocalFile {

    constructor({filename}) {
        this.filename = filename;
    }

    //PUBLIC METHODS

    save({cartID, product}) {
        return new Promise((resolve, reject) => {
            this.#fileStatus()
                .then(() => {
                    this.#readFileAndParse()
                        .then(fileParsed => {
                            if (verbose) console.log("File opened: ", this.filename)

                            if (!cartID){
                                let newCart = {id: crypto.randomUUID(), product:[product]}
                                fileParsed.push(newCart)
                                this.#writeFile(JSON.stringify(fileParsed))
                                    .then(() => { resolve(newCart.id) })
                                    .catch((err) => { reject(err) })
                            }else{
                                let existentCart = fileParsed.find((cart) => cart.id == cartID)
                                if (! existentCart) reject("Cart ID does not exist")

                                    existentCart.product.push (product)
                                    this.#writeFile(JSON.stringify(fileParsed))
                                    .then(() => { resolve(cartID) })
                                    .catch((err) => { reject(err) })

                            }
                        })
                        .catch(err => reject(err))
                })
                .catch(err => {
                    if (err.code === 'ENOENT') {
                        let newCart = {id: crypto.randomUUID(), product: [product]}
                        this.#writeFile(JSON.stringify(newCart))
                            .then(() => {
                                if (verbose) console.log("File created: ", this.filename)
                                resolve(newCart.id)
                            })
                            .catch(err => reject(err))
                    }
                })
        })

    }

    modifyEntry(id, products) {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
            .then((fileParsed => {
                const foundedproducts = fileParsed.find(file => file.id == id)
                if (!foundedproducts) resolve(null)
                Object.keys(products).forEach(key => {
                    if (products[key] == undefined) return
                    foundedproducts.product[key] = products[key]
                })

                this.#writeFile(JSON.stringify(fileParsed))
                                .then(() => { resolve() })
                                .catch((err) => { reject(err) })
            }))
            .catch(err => {
                reject(err)
            })

        })
    }

    //for cart 
    deleteByProductID(cartID, productID) {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
            .then((fileParsed => {
                const foundedCart = fileParsed.find(cart => cart.id == cartID)
                if (foundedCart == undefined) {reject(null); return}

                const foundedProductInCartIndex = foundedCart.product.findIndex(product => product.productID == productID)
                if (foundedProductInCartIndex == -1) {reject(null); return}

                foundedCart.product.splice(foundedProductInCartIndex, 1)

                //deletes a cart if it's empty
                if (foundedCart.product.length == 0){
                    const foundedCartIndex = fileParsed.find(cart => cart.id == cartID)
                    fileParsed.splice(foundedCartIndex, 1)
                }

                this.#writeFile(JSON.stringify(fileParsed))
                                .then(() => { resolve() })
                                .catch((err) => { reject(err) })
            }))
            .catch(err => {
                reject(err)
            })

        })
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
                .then((fileParsed => {
                    const foundedproducts = fileParsed.find(file => file.id == id)
                    if (!foundedproducts) resolve(null)
                    resolve(foundedproducts)
                }))
                .catch(err => {
                    reject(err)
                })

        })
    }


    //PRIVATE METHODS

    #writeFile(content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.filename, content)
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    #readFileAndParse() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filename)
                .then(file => JSON.parse(file))
                .then((fileParsed => resolve(fileParsed)))
                .catch(err => { reject(err) })
        })

    }

    #fileStatus() {
        return new Promise((resolve, reject) => {
            fs.stat(this.filename)
                .then(ans => resolve(ans))
                .catch(err => reject(err))
        })
    }


}
verbose = false;

module.exports = ContendorLocalFile