const express = require('express');
const router = express.Router();

const User = require('./../Models/user')

const {jwtAuthMiddleware, generateToken}= require('./../jwt')

//post route to add a User
router.post('/signup',async (req,res) =>{
    try{
  
      const data = req.body // Assuming the request ody contains the person data
  
    //create a new User documentation using the mongoose model
  
    const newUser = new User(data);
  

    //save the new person to the database
  
    const response = await newUser.save();
      console.log('data saved');

      const payload={
        id:response.id
      }

      console.log(JSON.stringify(payload));

      const token = generateToken(payload);
      console.log("Token is :", token);


      res.status(200).json({response:response, token:token});
  
    }
    catch(err){
      console.log(err);
      res.status(500).json({error:'Internal Server error'});
    }
  })


  //LoginRoute
  router.post('/login', async(req,res) =>{
    try{

      //Extracts adharCardNumber and password from request body
      const {adharCardNumber,password}= req.body;

      //find the user by adharCardNumber
      const user= await User.findOne({adharCardNumber:adharCardNumber});

      //if user does not exists or password does not match return error
      if(!user || !(await user.comparePassword(password))){
        return res.status(401).json({error: 'Invalid adharCardNumber or password'});
      }

      //generate Token
      const payload ={
        id: user.id
      }

      const token = generateToken(payload);

      // return token as response
      res.json({token})

    }catch(err){
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  })



  //profile route
  router.get('/profile',jwtAuthMiddleware, async(req,res) =>{
    try{
      const userData = req.user;
      const userId = userData.id;
      const user = await Person.findById(userId);

      res.status(200).json({user});

    }catch(err){
      console.log(err);
      res.status(500).json({error:'Internal Server error'});
    }
  } )

 

  router.put('/profile/password',jwtAuthMiddleware, async(req,res) =>{
    try{
        const userId= req.user.id;// ExtrCT the id from the token
        
        const {currentPassword, newPassword} = req.body // Extract current and newPassword from request body

        // Find the user by userId
        const user = await User.findById(userId);

        //if user does not exists or password does not match return error
      if( !(await user.comparePassword(currentPassword))){
        return res.status(401).json({error: 'Invalid adharCardNumber or password'});
      }

      // Update the user password
      user.password = newPassword;
      await user.save();


        console.log('Passwprdupdated');
        res.status(200).json({message:"password updated"});

    }
    catch(err){
      console.log(err);
      res.status(500).json({error:'Internal Server error'});
   
    }
  })
  router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const user = await User.find();

        // Return the list of candidates
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

module.exports= router;