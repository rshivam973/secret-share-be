//jshint esversion:6
require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');

var bodyParser=require('body-parser');
const DB = process.env.DATABASE;
const PORT= process.env.PORT || 5000;

const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(cors());

mongoose.connect(DB,{useNewUrlParser:true})
.then(()=>{
    console.log("database connected")

});

const messageSchema = new mongoose.Schema({
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    Name: String,
    username:String,
    email: String,
    password: String,
    confirmPassword:String,
    messages : [messageSchema]
})



const User =  new mongoose.model("User",userSchema);
const Message = new mongoose.model("Messages",messageSchema);
//register starts
app.post("/register", async (req, res) => {
    const { Name, username, email, password, confirmPassword } = req.body;
  
    try {
      const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });
  
      if (existingUser) {
        // User with the same username or email already exists
        return res.status(409).json({ message: 'Username or email already exists' });
      }
  
      // Register the user
      const newUser = new User({
        Name: Name,
        username: username,
        email: email,
        password: password,
        confirmPassword:confirmPassword,
        messages: []
      });
  
      await newUser.save();
  
      return res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
});
//register ends

//login starts
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email: email });
  
      if (!user) {
        // User with the given email does not exist
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.password !== password) {
        // Incorrect password
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Login successful
      return res.status(200).json({ message: 'Login successful' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
//login ends

//get details
app.get('/get-details', async (req, res) => {
  try {
    const email = req.query.email;

    // Find user by email
    const user = await User.findOne({ email });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


//send message
app.post("/send-message/:username", async (req, res) => {
  const recipientUsername = req.params.username;
  const { content } = req.body;

  try {
    const recipientUser = await User.findOne({ username: recipientUsername });

    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    const newMessage = {
      content: content,
    };

    recipientUser.messages.push(newMessage);

    await recipientUser.save();

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 
app.get("/check-user/:username", async(req, res)=>{
  const recipientUsername = req.params.username;
  try {
    const recipientUser = await User.findOne({ username: recipientUsername });
    if (!recipientUser) {
      // If the username is not found, return a status of false
      return res.status(404).json({ status: false });
    }

    // If the username is found, return a status of true
    return res.status(200).json({ status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});




app.listen(PORT,()=>{
    console.log("backend started at port 5000")
});