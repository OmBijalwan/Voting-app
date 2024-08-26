const express = require('express');
const router = express.Router();

const User = require('./../Models/user')
const candidate = require('./../Models/candidate')

const {jwtAuthMiddleware}= require('../jwt')
const checkAdminRole = async(userId) =>{
    try{
        
        const user = await User.findById(userId);
        if(user.role === 'admin')return true;

    }catch(err){
        return false;
    }
}


//post route to add a cadidate
router.post('/',jwtAuthMiddleware,async (req,res) =>{
    try{

        if(! await checkAdminRole(req.user.id)){
            console.log("admin role not found")
            return res.status(403).json({message:'user does not have admin role'});
        
        }
           
  
      const data = req.body // Assuming the request body contains the person data
  
    //create a new candidate documentation using the mongoose model
  
    const newCandidate = new candidate(data);
  

    //save the new candidate to the database
  
    const response = await newCandidate.save();
      console.log('data saved');
      res.status(200).json({response:response});
  
    }
    catch(err){
      console.log(err);
      res.status(500).json({error:'Internal Server error'});
    }
  })

  
  router.put('/:candidateID',jwtAuthMiddleware, async(req,res) =>{
    try{

        if(!checkAdminRole(req.user.candidateID))
            return res.status(403).json({message:'user does not have admin role'});
        
        const candidateID= req.params.candidateID;// ExtrCT the id from the URL parameter
        const updateCandidateData= req.body;// update data for the person

        const response = await Candidate.findByIdAndUpdate(candidateID, updateCandidateData,{
            new:true, // return the updates document
            runValidators:true, // Run Mongoose validation
        })
        if(!response){
            return res.status(404).json({error:' Candidate not found'});
        }
        console.log('candidate data updated');
        res.status(200).json(response);

        

    
    }
    catch(err){
      console.log(err);
      res.status(500).json({error:'Internal Server error'});
   
    }
  })

  router.delete('/:candidateID',jwtAuthMiddleware, async(req,res) =>{
    try{

        if(!checkAdminRole(req.user.candidateID))
            return res.status(403).json({message:'user does not have admin role'});
        
        
        const candidateID= req.params.candidateID;// ExtrCT the id from the URL parameter


        const response = await Candidate.findByIdAndDelete(candidateID);
    
        if(!response){
            return res.status(404).json({error:' Candidate not found'});
        }
        console.log('candidate deleted');
        res.status(200).json(response);

        

    
    }
    catch(err){
      console.log(err);
      res.status(500).json({error:'Internal Server error'});
   
    }
  })


  // lets start voting 
  router.post('/vote/:candidateId', jwtAuthMiddleware, async (req,res) =>{
    //no admin can vote
    //user can only vote once

    candidateId= req.params.candidateId;
    userId= req.user.id;

    try{
        //Find the candidate document with the specified candidateID

        const Candidate = await candidate.findById(candidateId);
        if(!Candidate){
            return res.status(404).json({message:'Candidate not found'});
        }
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message:'user not found'});
        }
        if(user.isVoted){
            res.status(400).json({message:'you have already voted'});
        }
        if(user.role == 'admin'){
            res.status(403).json({message:'admin is not allowed'});
        }

        //update the candidate document to record the vote 
        Candidate.voted.push({user:userId})
        Candidate.voteCount++;
        await Candidate.save();

        //update the user document
        user.isVoted = true
        await user.save();

        res.status(200).json({message:'Vote recorded successfully'})

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server error'});
    }
  });

  //Vote Count
  router.get('/vote/count', async (req ,res) =>{
    try{
        // Find all candidate and sort them by votecount in descending order

        const Candidate = await candidate.find().sort({voteCount:'desc'});

        //Map the candidate to only return their name and voteCount
        const voteRecord = Candidate.map((data)=>{
            return{
                party: data.party,
                count:data.voteCount
            }
        });

        return res.status(200).json(voteRecord);


    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server error'});
    }
  });

  // Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const Candidates = await candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(Candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

module.exports= router;

