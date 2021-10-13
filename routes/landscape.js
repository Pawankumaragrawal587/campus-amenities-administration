const express = require('express');
const router = express.Router();

router.get('/landscape',function(req,res){
    res.send("This is landscape page!");
});

module.exports = router;