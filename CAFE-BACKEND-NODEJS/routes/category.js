const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

//api for adding category only by admin(using token and checkrole)
router.post('/add',auth.authenticationTOken,checkRole.checkRole,(req,res,next)=>{
    let category = req.body;
    query = "insert into category (name) values(?)";
    connection.query(query,[category.name],(err,results)=>{
        if(!err)
        {
            res.status(200).json({message:"Category added successfully"})
        }
        else{
            return res.status(500).json(err);
        }
    })
})

//get categry api
router.get('/get',auth.authenticationTOken, (req,res,next)=>{
    var query = "select * from category order by name";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})

//update any category using checkrole as only admin can change category
router.patch('/update',auth.authenticationTOken,checkRole.checkRole,(req,res,next)=>{
    let product = req.body;
    var query = "update category set name=? where id=?";
    connection.query(query,[product.name,product.id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"Category id does not found"})
            }
            else{
                return res.status(200).json({message:"Category Updated Successfully"})
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;
