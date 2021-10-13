const express = require('express');
const router = express.Router();

router.get('/guest',function(req,res){
    res.render("guest/index");
});

module.exports = router;