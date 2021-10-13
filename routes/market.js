const express = require('express');
const router = express.Router();

router.get('/market',function(req,res){
    res.send("This is market page!");
});

module.exports = router;