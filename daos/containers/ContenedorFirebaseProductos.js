const crypto = require('crypto');
const admin = require('firebase-admin')
const serviceAccount = require('../../security/ecommerce-d8192-firebase-adminsdk-x1dhv-c3ceb48609.json')

class ContenedorFirebase {

    constructor({ databaseName }) {
        this.databaseName = databaseName;
        this.admin = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        }, databaseName)

        console.log("firebase started for", this.admin.name)

        this.db = this.admin.firestore();
        this.query = this.db.collection(this.databaseName)

    }

    //PUBLIC METHODS

    save({ cartID, product }) {
        return new Promise((resolve, reject) => {

            if (cartID) {
                const doc = this.query.doc(cartID)
                doc.get()
                    .then((res) => {
                        let existentData = res.data()
                        console.log (existentData)
                        existentData.product.push (product)
                        doc.update(existentData)
                        resolve(cartID)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }else{
                const id = crypto.randomUUID()   
                const doc = this.query.doc(id)  
                doc.create(product)
                    .then(resolve(id))
                    .catch((err)=> reject(err))
            }
        })
    }

    modifyEntry(id, object) {
        return new Promise((resolve, reject) => {
            const doc = this.query.doc(id)
            doc.update(object)
                .then(resolve(id))
                .catch((err) => reject(err))
        })
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            const doc = this.query.doc(id)
            doc.get()
                .then(res => resolve(res.data()))
                .catch((err) => reject(err))
        })
    }

    getAll() {
        return new Promise((resolve, reject) => {

            this.query.get()
                .then((querySnapshot) => {
                    let docs = querySnapshot.docs;

                    resolve(docs.map((doc) => ({
                        id: doc.id,
                        productName: doc.data().productName,
                        productDescription: doc.data().productDescription,
                        productCode: doc.data().productCode,
                        productPrice: doc.data().productPrice,
                        productStock: doc.data().productStock
                    }))
                    )
                })
                .catch((err) => reject(err))

        })
    }

    deleteByID(id) {
        return new Promise((resolve, reject) => {
            const doc = this.query.doc(id)
            doc.delete()
                .then(resolve())
                .catch((err) => reject(err))
        })
    }

}

module.exports = ContenedorFirebase