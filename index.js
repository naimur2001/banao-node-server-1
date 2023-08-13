require("dotenv").config()
const express=require("express");
const cors=require("cors")
const app=express();
const port=process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
// middleware
app.use(express.json())
app.use(cors())
// basic get method
app.get('/',(req,res)=>{
  res.send('Banao Server is Running')
})
app.listen(port,()=>{
  console.log(`Server Port is : ${port}`)
})

// mongo connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.etoufie.mongodb.net/?retryWrites=true&w=majority`;

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
const usersCollection=client.db("banao-node").collection("users")
// user adding primarily
//post method
app.post('/post_user',async (req,res)=>{

  const user=req.body;
  const query={email: user.email}
  const existUser=await usersCollection.findOne(query);
 
  if (existUser) {
    return res.send({message: 'User already exists'})
  }
  const result=await usersCollection.insertOne(user)
  res.send(result)

} )

//get method
app.get('/get_user/:username/:password', async (req, res) => {
  const username = req.params.username;
  const password = req.params.password;
  const filter = { username: username, password: password }; 

  const result = await usersCollection.findOne(filter);

  if (result) {
    res.send({ message: 'User found', user: result });
  } else {
    res.send({ message: 'User not found' });
  }
});

// patch method
app.patch('/patch_user/:username',async (req,res)=>{
  const username = req.params.username;
  const filter = { username: username }; 
  const password=req.body;
  const result = await usersCollection.findOne(filter);
  const updateDoc={
    $set: password
  
  }
  if (result) {
    const updated_password=await usersCollection.updateOne(filter,updateDoc);
    res.send({ message: 'Password updated', user: result });
  } else {
    res.send({ message: 'Password not updated' });
  }

} )



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);