const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cuvfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
});

let productCollection;

async function run() {
  try {
    await client.connect();
    productCollection = client.db("productDB").collection("products");

    // Routes
    app.get("/", (req, res) => {
      res.send("Sport Hive server is running!");
    });

    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged MongoDB successfully!");
  } catch (err) {
    console.error(err);
  }
}
run();
