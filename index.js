const express = require("express");
const app = express();
const port = 3000 || process.env.PORT;
const cors = require("cors");

require("dotenv").config();

const admin = require("firebase-admin");

const serviceAccount = require("./verifyfirebasetoken.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// default middleware
app.use(cors());
app.use(express.json());

// Varify User with middleware
const varifyFirebaseToken = async (req, res, next) => {
  console.log(req.headers?.authorization)
  if (!req.headers?.authorization) {
    return res.send({ message: "Unauthorize Access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.send({ message: "Unauthorize Access" });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("After token validation", decoded);
    next();
  } catch {
    return res.send({ message: "Unauthorize Access" });
  }
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.fqjmyg3.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("LoanLinkDatabase");
    const userCollection = database.collection("users");
    const AllLoanCollection = database.collection("allloan");
    const loanApplicationCollection = database.collection('loanApplication')

    // User related Apis
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user)
      user.role = "borrow";
      user.createdAt = new Date();

      // finding user if user already exit or not
      const axisUser = await userCollection.findOne({ email: user.email });
      if (axisUser) {
        return res.send({ message: "user already exis" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users/:email/role", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ role: user?.role || "borrow" });
    });

    // All loan related apis
    app.get("/allloans", async (req, res) => {
      console.log("token", req.headers.authorization);
      const result = await AllLoanCollection.find().toArray();
      res.send(result);
    });
    // Get latest 6 card for main section
    app.get("/loan/latestloan/top", async (req, res) => {
      // console.log("accesstoken", req.headers);
      const result = await AllLoanCollection.find().limit(6).toArray();
      res.send(result);
    });
    app.get('/allloans/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await AllLoanCollection.findOne(query)
      res.send(result)
    })


    // Loan Application Related API
    app.post('/loanApplication',async(req,res)=>{
      const data = req.body;
      data.submittedAt = new Date();
      data.status = 'pending';
      data.applicationFeeStatus = 'unpaid';
      const result = await loanApplicationCollection.insertOne(data);
      res.send(result)
    })

    // Borrower get his own data
    app.get('/loanApplication',async(req,res)=>{
      const email = req.query.email;
      const query = {}
      if(email){
        query.borrowerEmail = email
      }

      const result = await loanApplicationCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/loanApplication/:id/single',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await loanApplicationCollection.findOne(query);
      res.send(result)
    })
    
    // delete borower loan application
    app.delete('/loanApplication/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await loanApplicationCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Loanlink Server is runing");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
