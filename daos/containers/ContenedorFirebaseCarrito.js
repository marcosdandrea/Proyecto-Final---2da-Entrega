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

            if (!cartID)
                product.cartID = crypto.randomUUID();
            else
                product.cartID = cartID
            const doc = this.query.doc()
            doc.create(product)
                .then(resolve(product.cartID))
                .catch((err) => reject(err))
        })
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            this.query.where('cartID', "==", id).get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        reject('No matching documents.');
                        return;
                    }
                    let response = []
                    snapshot.forEach(doc => {
                        response.push (doc.data())
                    });
                    resolve (response)
                })
        })
    }

    deleteByProductID(cartID, productID) {
        return new Promise((resolve, reject) => {
            const batch = this.db.batch();
            this.query.where('cartID', "==", cartID).where('productID', '==', productID).get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        reject('No matching documents.');
                        return;
                    }
                    snapshot.docs.forEach(async (doc) => {
                        batch.delete(doc.ref);
                    });
                    batch.commit()
                        .then (()=> resolve())
                        .catch (()=> reject())
                })
        })
    }

}

module.exports = ContenedorFirebase