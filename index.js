const express = require('express')
const app = express()
const port = 3000 || process.env.PORT
const cors = require("cors");

require("dotenv").config();


// default middleware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.fqjmyg3.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db('LoanLinkDatabase')
    const userCollection = database.collection('users')
    const AllLoanCollection = database.collection('allloan')

    // User related Apis
    app.post('/users',async(req,res)=>{
      const user = req.body;
      console.log(user)
      user.role = 'borrow';
      user.createdAt = new Date();
      
      // finding user if user already exit or not 
      const axisUser = await userCollection.findOne({email : user.email});
      if(axisUser){
        return res.send({message : 'user already exis'})
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    app.get('/users/:email/role',async(req,res)=>{
      const email = req.params.email;
      const query = {email}
      const user = await userCollection.findOne(query);
      res.send({role : user?.role || 'borrow'})
    })


    // All loan related apis
    // Get latest 6 card for main section
    app.get('/alllone/latestloan',async(req,res)=>{
      const result = await AllLoanCollection.find().limit(6).toArray()
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Loanlink Server is runing')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
