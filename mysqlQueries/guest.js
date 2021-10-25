const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};

queryObj.testQuery = 'show processlist;';

function test() {
    mysqlConnection.query(queryObj.testQuery, function(err,results){
        console.log(results);
    });
}

queryObj.configDB = function() {
    test();
}

module.exports = queryObj;
