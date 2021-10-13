const express = require('express');
const router = express.Router();

router.get('/market',function(req,res){
    res.render("market/index");
});

module.exports = router;