const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};

//================================================
//                  Queries
//================================================

createRoomsTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS rooms(
            RoomNumber varchar(10) PRIMARY KEY,
            Occupancy varchar(10) NOT NULL CHECK (Occupancy IN ("Single", "Double")),
            HasBathroom varchar(5) NOT NULL CHECK (HasBathroom IN ("Yes", "No")),
            Cost int NOT NULL
        );
    `

//================================================
//              Database Configuration
//================================================

function createRoomsTable() {
    mysqlConnection.query(createRoomsTableQuery, function(err,results){
        if(err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

queryObj.configDB = function() {
    createRoomsTable();
}

module.exports = queryObj;
