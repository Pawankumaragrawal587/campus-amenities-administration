const express = require('express');
const router = express.Router();

router.get('/landscape',function(req,res){
    res.render("landscape/index");
});

module.exports = router;