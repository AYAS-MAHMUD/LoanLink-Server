const express = require("express");
const app = express();
const port = 3000 || process.env.PORT;
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

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
  console.log(req.headers?.authorization);
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
    const loanApplicationCollection = database.collection("loanApplication");

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
      // Admin ShowOnHome er True/False control korte parbe
      const result = await AllLoanCollection.find().toArray();
      res.send(result);
    });

    // Admin Related API
    app.get("/allloans/admin", async (req, res) => {
      const result = await AllLoanCollection.find().toArray();
      res.send(result);
    });

    // admin get all user
    app.get("/alluser/admin", async (req, res) => {
      const result = await userCollection.find({ role: "borrow" }).toArray();
      res.send(result);
    });

    // Get latest 6 card for main section
    app.get("/loan/latestloan/top", async (req, res) => {
      // console.log("accesstoken", req.headers);
      const result = await AllLoanCollection.find({ showOnHome: true })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.patch("/loans/show-on-home/:id", async (req, res) => {
      const { id } = req.params;
      const { showOnHome } = req.body;

      const result = await AllLoanCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { showOnHome },
        }
      );

      res.send(result);
    });

    app.get("/allloans/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AllLoanCollection.findOne(query);
      res.send(result);
    });

    //Manager will Post loan
    app.post("/allloans", async (req, res) => {
      const data = req.body;
      data.createdAt = new Date();
      // data.pending = 'pending'
      const result = await AllLoanCollection.insertOne(data);
      res.send(result);
    });
    // Manager get his own loan post
    app.get("/allloans/:email/manageloan", async (req, res) => {
      const email = req.params.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await AllLoanCollection.find(query).toArray();
      res.send(result);
    });
    // delete manage loan by manager
    app.delete("/allloans/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AllLoanCollection.deleteOne(query);
      res.send(result);
    });
    // update loan by manager
    app.patch("/allloans/:id", async (req, res) => {
      const id = req.params.id;
      const updateLoan = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          title: updateLoan.title,
          tagline: updateLoan.tagline,
          interest: updateLoan.interest,
          max: updateLoan.max,
          img: updateLoan.img,
          tag: updateLoan.tag,
        },
      };
      const result = await AllLoanCollection.updateOne(query, update);
      res.send(result);
    });

    // Loan Application Related API

    // manager get all pending post
    app.get("/loanApplication/pendingpost", async (req, res) => {
      const result = await loanApplicationCollection
        .find({ status: "pending" })
        .toArray();
      res.send(result);
    });
    app.get("/loanApplication/approvedpost", async (req, res) => {
      const result = await loanApplicationCollection
        .find({ status: "approved" })
        .toArray();
      res.send(result);
    });

    // Admin will see all loan application
    app.get("/loanApplication/allApplication", async (req, res) => {
      const result = await loanApplicationCollection.find().toArray();
      res.send(result);
    });

    // manager will approved user
    app.patch("/loanApplication/approved/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      // const updateStatus  = {status : 'approved'};
      const update = {
        $set: {
          status: "approved",
          approvedData: new Date(),
        },
      };
      const result = await loanApplicationCollection.updateOne(query, update);
      res.send(result);
    });

    // manager will rejected user
    app.patch("/loanApplication/rejected/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      // const updateStatus  = {status : 'approved'};
      const update = {
        $set: {
          status: "rejected",
        },
      };
      const result = await loanApplicationCollection.updateOne(query, update);
      res.send(result);
    });

    // // borrower post application for loan
    app.post("/loanApplication", async (req, res) => {
      const data = req.body;
      data.submittedAt = new Date();
      data.status = "pending";
      data.applicationFeeStatus = "unpaid";
      const result = await loanApplicationCollection.insertOne(data);
      res.send(result);
    });

    // Borrower get his own data
    app.get("/loanApplication", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.borrowerEmail = email;
      }

      const result = await loanApplicationCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/loanApplication/:id/single", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await loanApplicationCollection.findOne(query);
      res.send(result);
    });

    // delete borower loan application
    app.delete("/loanApplication/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await loanApplicationCollection.deleteOne(query);
      res.send(result);
    });

    // ALL DASHBOARD API
    app.get("/totalloan/admin", async (req, res) => {
      const result = await AllLoanCollection.find().toArray();
      res.send(result);
    });
    app.get("/pendingapplication/admin", async (req, res) => {
      const result = await loanApplicationCollection
        .find({ status: "pending" })
        .toArray();
      res.send(result);
    });
    app.get("/approvedapplication/admin", async (req, res) => {
      const result = await loanApplicationCollection
        .find({ status: "approved" })
        .toArray();
      res.send(result);
    });
    app.get("/totalApplication/admin", async (req, res) => {
      const result = await loanApplicationCollection.find().toArray();
      res.send(result);
    });

    // Payment Related API here
    app.post("/create-checkout-session", async (req, res) => {
      const paymentInfo = req.body;
      
      const session = await stripe.checkout.sessions.create({
        line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 1000, // $10
            product_data: { name: "Default $10 Payment" },
          },
          quantity: 1,
        },
      ],
        // customer_email : paymentInfo.borrowerEmail,
        mode: "payment",
        metadata : {
          parcelId : paymentInfo.application_id
        },
        success_url: `${process.env.SIDE_DOMAIN}/dashboard/paymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.SIDE_DOMAIN}/dashboard/paymentCancel`,
      });
      console.log(session);
      res.send({ url : session.url})
    });

    app.patch('/payment_success',async(req,res)=>{
      const session_id = req.query.session_id;
      const session = await stripe.checkout.sessions.retrieve(session_id)

      if(session.payment_status==='paid'){
        const id = session.metadata.parcelId;
        const query = {_id : new ObjectId(id)}
        const update = {
          $set : {
            applicationFeeStatus : 'paid'
          }
        }
        const result = await loanApplicationCollection.updateOne(query,update);
        res.send(result)
      }
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
