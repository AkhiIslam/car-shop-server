const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 7000;
const ObjectId = require('mongodb').ObjectId

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bwvhp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {

        await client.connect();
        // console.log('connected')
        const database = client.db('carMechanic')
        const servicesCollection = database.collection('services')
        const orderCollection = database.collection('orders')
        const reviewCollection = database.collection('review')
        const usersCollection = database.collection('users')

        // post api
        app.post('/services', async (req, res) => {

            const service = req.body;
            // console.log('hit the api', service)
            const result = await servicesCollection.insertOne(service)

            // console.log(result)
            res.json(result)
        })

        // get api
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({})
            const services = await cursor.toArray()
            res.send(services)
        })

        // get single data
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await servicesCollection.findOne(query)
            res.json(service)
        })

        // delete api
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.deleteOne(query)
            res.json(result)
        })

        // orders post
        app.post('/orders', async (req, res) => {

            const service = req.body;
            const result = await orderCollection.insertOne(service)
            res.json(result)
        })

        // call orders
        app.get('/orders/:email', async (req, res) => {
            const cursor = orderCollection.find({ email: req.params.email })
            const result = await cursor.toArray()
            res.send(result)
        })

        // delete order
        app.delete('/deleteOrder/:id', async (req, res) => {
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id)
            })
            res.send(result)
        })

        // review post
        app.post('/review', async (req, res) => {

            const service = req.body;
            const result = await reviewCollection.insertOne(service)
            res.json(result)
        })

        // call review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        // post users
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.json(result)
            // console.log(result)
        })

        app.put('users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        // call admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
            // console.log(user)

        })

        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
            // console.log(result)

        })


    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('hello world Rehad')
})

app.listen(port, () => {
    console.log(`Example app at http://localhost:${port}`)
})