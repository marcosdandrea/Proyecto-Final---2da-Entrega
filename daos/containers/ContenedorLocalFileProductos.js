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

                                product.id = crypto.randomUUID()
                                fileParsed.push(product)
                                this.#writeFile(JSON.stringify(fileParsed))
                                    .then(() => { resolve(product.id) })
                                    .catch((err) => { reject(err) })
                           
                        })
                        .catch(err => reject(err))
                })
                .catch(err => {
                    if (err.code === 'ENOENT') {
                        const newFile = []
                        product.id = crypto.randomUUID()
                        fileParsed.push(product)
                        this.#writeFile(JSON.stringify(newFile))
                            .then(() => {
                                if (verbose) console.log("File created: ", this.filename)
                                resolve(product.id)
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
                let foundedproducts = fileParsed.find(file => file.id == id)
                foundedproducts.product = [products];
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

    getAll() {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
                .then(fileParsed => {
                    if (fileParsed.length != 0){
                        resolve (fileParsed)
                    }else{
                        reject ("there's no registers")
                    }
                })
                .catch(err => {
                    reject(err)
                })

        })
    }

    deleteByID(UUID) {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
                .then(fileParsed => {
                    const productsID = fileParsed.findIndex(products => products.id === UUID);
                    if (productsID==-1){
                        reject("UUID not found")
                        return
                    }
                    fileParsed.splice(productsID, 1)
                    this.#writeFile(JSON.stringify(fileParsed))
                        .then(() => {
                            resolve(UUID + " has been removed from file")
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
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