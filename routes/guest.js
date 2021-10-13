const express = require('express');
const router = express.Router();

router.get('/guest',function(req,res){
    res.send("This is guest page!");
});

module.exports = router;