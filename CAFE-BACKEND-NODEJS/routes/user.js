const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require("dotenv").config();

/* importing unwanted files will result in 
(Assignment to constant variable.) error)*/

var auth = require('../services/authentication');// for putting restictions (authentication purpose)
var checkRole = require('../services/checkRole');// for putting restictions (authentication purpose)

//Signup Api
router.post('/signup',(req,res)=>{
    const user = req.body;
    query = "select email,password,role,status from user where email = ?"
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length <= 0)//check wherether email exists in database
            {
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
                connection.query(query,[user.name,user.contactNumber,user.email,user.password],(err,results)=>{
                    if(!err)
                    {
                        return res.status(200).json({message: "Successfully Registered"});
                    }
                    else{
                        return res.status(500).json(err);
                    }
                })
            }
            else{
                return res.status(400).json({message : "Email already exists"});
            }
        }
        else
        {
            return res.status(500).json(err);
        }
    })
    
})

//login Api
router.post('/login',(req,res)=>{
    const user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query,[user.email],(err,results)=>{
        if(!err)
        {
            if(results.length <=0 || results[0].password != user.password) //check whether user exists or password is correct
            {
                return res.status(401).json({message:"Incorrect Username or Password"});
            }
            else if(results[0].status === 'false') //checking status 
            {
                return res.status(401).json({message:"Wait for admins approval"});
            }
            else if(results[0].password == user.password){ //if password is correct
                const response = {email: results[0].email, role: results[0].role}
                const accessToken = jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn:'8h'})
                res.status(200).json({token: accessToken});
            }
            else{
                return res.status.json({message:"Something went wrong"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

//to use email services
var transporter = nodemailer.createTransport({
    service: 'outlook',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})


//forget password api
router.post('/forgotPassword',(req,res)=>{
    
    const user = req.body;
    query = "select email,password from user where email=?";
    connection.query(query,[user.email],(err,results)=>{
        if(!err)
        {
            if(results.length <= 0)
            {
                return res.status(200).json({message:"Password sent successfully to your mail"});
            }
            else{//sending mail
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subect:'Password by cafe',
                    html:'<p><b> Your login details for cafe management Systsem</b><br><b>Email:  </b>'+results[0].email+'<br><b>Password:  </b>'+results[0].password+'<br><a href="http://localhost:4200/">Click here to login</a></p>'
                };
                transporter.sendMail(mailOptions,function(error,info){
                    if(error)
                    {
                        console.log(error);
                    }
                    else{
                        console.log('Email sent: '+info.response)
                    }
                })
                return res.status(200).json({message:"Password sent successfully to your mail"});
            }
        }
        else{
            return res.status(500).json(err);
        }

    })
})


//Api for getting all the users
router.get('/get',checkRole.checkRole,auth.authenticationTOken,(req,res)=>{
    var query = "select id,name,email,contactNumber,status from user where role='user'";
    connection.query(query,(err,results)=>{
        if(!err)
        {
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})


//Api for updating status of a User
router.patch('/update',checkRole.checkRole,auth.authenticationTOken,(req,res)=>{
    let user =req.body;
    var query = "update user set status=? where id=?";
    connection.query(query,[user.status,user.id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0)
            {
                return res.status(404).json({message:"User Does Not Exixtes"});
            }
            return res.status(200).json({message:"User Updated Successfully"});
        }
        else{
            return res.status(500).json(err);
        }
    })

})

//to check the token api
router.get('/checkToken',auth.authenticationTOken,(req,res)=>{
    return res.status(200).json({message:"true"})
})

//api for changing password
router.post('/changePassword',auth.authenticationTOken,(req,res)=>{
    const user = req.body;
    const email = res.locals.email;//getting email value from Token (locals)
    var query = "select * from user where email=? and password=?";
    connection.query(query,[email,user.oldPassword],(err,results)=>{
        if(!err)
        {
            if(results.length <= 0)
            {
                return res.status(400).json({message:"Incorrect old password"});
            }
            else if(results[0].password == user.oldPassword)
            {
                query = "update user set password=? where email=?";
                connection.query(query,[user.newPassword,email],(err,results)=>{
                    if(!err)
                    {
                        return res.status(200).json({message:"Password Updated Successfully"});
                    }
                    else{
                        return res.status(500).json(err);
                    }
                })
            }
            else{
                return res.status(400).json({message:"Somthening went wrong"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;