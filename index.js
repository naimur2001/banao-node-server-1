require("dotenv").config()
const express=require("express");
const cors=require("cors")
const app=express();
const port=process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

     //task 1 db
const usersCollection=client.db("banao-node").collection("users")
// task 2 db
const blogsCollection=client.db("banao-node").collection("blogs")

// task 1 starts  here
//post method
app.post('/post_user', async (req, res) => {
  const user = req.body;

  // Transform email to lowercase before querying
  user.email = user.email.toLowerCase();

  const query = {
    $and: [
      { username: user.username },
      { email: user.email }
    ]
  };

  try {
    const existingUser = await usersCollection.findOne(query);

    if (existingUser) {
      return res.send({ message: 'User already exists' });
    }

    const result = await usersCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (unique index violation)
      return res.send({ message: 'Username is already taken' });
    }
    // Handle other errors as needed
    console.error(error);
    res.status(500).send({ message: 'An error occurred' });
  }
});

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
//blog section
// task 2 starts  here
// ------------------- //
//blog post method
app.post('/post_blog', async (req, res) => {
  const blog = req.body;
  const result = await blogsCollection.insertOne(blog);
  res.send(result);
 
});
//blog get method

app.get('/get_blog', async(req,res)=>{
  const result=await blogsCollection.find().toArray();
  res.send(result)
})

//blog get method by id
app.get('/get_blog/:id', async(req,res)=>{
  const id=req.params.id
  try {
    const query={_id: new ObjectId(id)};
    console.log(query);
    const result=await blogsCollection.findOne(query);
    console.log(result);
    res.send(result)
  } catch (error) {
    console.log(error.message);
    res.send({message:error.message})
  }

})

//blog patch method
app.patch('/patch_blog/:id',async (req,res)=>{
  const id = req.params.id;
try {
  const filter={_id: new ObjectId(id)};
  const option={upsert: true};
  const updating=req.body;
  const blog={
   $set:{
    name:updating.name,
texts:updating.texts
   }
  }
const result=await blogsCollection.updateOne(filter,blog,option);
res.send(result)
} catch (error) {
  res.send({message:error.message})

}

} )
//blog delete method 
app.delete('/delete_blog/:id' , async (req,res)=>{
  const id =req.params.id;
  try {
    const query={_id: new ObjectId(id)}
    const result = await blogsCollection.deleteOne(query)
    res.send(result)
  } catch (error) {
    res.send({message:error.message})
  }
} )

//blog patch method for like
app.patch('/patch_blog/like/:id',async (req,res)=>{
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };


  try {
   const result= await blogsCollection.updateOne(filter, { $inc: { like: 1 } });
    const updatedDocument = await blogsCollection.findOne(filter);
    res.send(result);
  } catch (error) {
   
    res.send({message:error.message})
  }

} )
//blog patch method for comment
app.patch('/patch_blog/comment/:id',async (req,res)=>{
  const id = req.params.id;
  console.log(req.body);
  
try {
  const filter={_id: new ObjectId(id)};
  // const option={upsert: true};
  const {comment}=req.body;
  const updateComment={$push:{comment:comment}}
 
const result=await blogsCollection.updateOne(filter,updateComment);
res.send(result)
} catch (error) {
  res.send({message:error.message})
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