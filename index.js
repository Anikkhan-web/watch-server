


const express = require('express')
const app = express()
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qynnh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run()
{
    try
    {

        await client.connect();
        const database = client.db('Watch-world');
        const servicesCollection = database.collection('addedOrder');
        const usersCollection = database.collection('users');
        const servicesCollectionReview = database.collection('reviews');
        const servicesCollectionOrder = database.collection('orders');

        // get api
        app.get('/addOrder', async (req, res) =>
        {

            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services)

        })
        // post api
        app.post('/addOrder', async (req, res) =>
        {
            const service = req.body;
            console.log('hit the api', service);
            const result = await servicesCollection.insertOne(service);


            res.json(result);
        });


        // review post reviewSite
        app.get('/reviewSite', async (req, res) =>
        {

            const cursor = servicesCollectionReview.find({});
            const services = await cursor.toArray();
            res.send(services)

        })

        app.post('/reviewSite', async (req, res) =>
        {
            const service = req.body;

            const result = await servicesCollectionReview.insertOne(service);
            res.json(result);
        });


        //get single service
        app.get('/addOrder/:id', async (req, res) =>
        {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);


        })



        // order post here 
        app.post('/orders', async (req, res) =>
        {
            const service = req.body;

            const result = await servicesCollectionOrder.insertOne(service);
            res.json(result);
        });


        app.get('/orders', async (req, res) =>
        {

            const email = req.query.email;
            const query = { email: email }

            const cursor = servicesCollectionOrder.find(query);
            const services = await cursor.toArray();
            res.send(services)

        })




        // delete api
        // app.delete('/services/:id', async (req, res) =>
        // {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await servicesCollection.deleteOne(query);
        //     res.json(result);

        // })


        // admin and general user
        app.get('/users/:email', async (req, res) =>
        {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin')
            {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })


        app.post('/users', async (req, res) =>
        {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            console.log("result");
            res.json(result)

        });

        app.put('/users', async (req, res) =>
        {

            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };

            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        });


        app.put('/users/admin', async (req, res) =>
        {
            const user = req.body;

            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)



        });









    }
    finally
    {
        //  await  client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) =>
{
    res.send('Hello World-Watch!')
})

app.listen(port, () =>
{
    console.log(`Example app listening at http://localhost:${port}`)
})