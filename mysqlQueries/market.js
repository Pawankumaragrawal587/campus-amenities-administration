const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};


//================================================
//             Create Table Queries
//================================================

const createShopTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Shop(
            ShopID varchar(20) PRIMARY KEY,
            ShopName varchar(20) NOT NULL,
            Location varchar(20) NOT NULL,
            Rent int NOT NULL,
            Electricity_Bill int NOT NULL
        );
    `

const createShopkeeperTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Shopkeeper(
            ShopKeeperID varchar(20) PRIMARY KEY,
            ShopKeeperName varchar(20) NOT NULL,
            GatePass_registered date NOT NULL,
            GatePass_expiry data NOT NULL
        );
    `

const  createShopFeedbackTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS ShopFeedback(
            FeedbackID varchar(20) PRIMARY KEY,
            ServiceQuality varchar(10) NOT NULL,
            ShopWorkerAttitude NOT NULL CHECK (ShoWorkerAttitude IN ("Polite", "Rude"))
        );
    `

const createShop_PerformanceTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Shop_Performance(
            ShopID varchar(20),
            FeedbackID varchar(10),
            CONSTRAINT Shop_Performance_fk1 FOREIGN KEY (ShopID) references Shop(ShopID),
            CONSTRAINT Shop_Performance_fk2 FOREIGN KEY (FeedbackID) references ShopFeedback(FeedbackID),
            PRIMARY KEY (ShopID,FeedbackID)
        );
    `

const createTender_DetailsTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Tender_Details(
            ShopID varchar(20),
            ShopKeeperID varchar(20),
            License_registered date NOT NULL,
            License_expiry date NOT NULL,
            CONSTRAINT Tender_Details_fk1 FOREIGN KEY (ShopID) references Shop(ShopID),
            CONSTRAINT Tender_Details_fk2 FOREIGN KEY (ShopKeeperID) references Shopkeeper(ShopKeeperID),
            PRIMARY KEY (ShopID, ShopKeeperID)
        );
    `


//================================================
//              Database Configuration
//================================================

const queries = [
    createShopTableQuery,
    createShopkeeperTableQuery,
    createShopFeedbackTableQuery,
    createShop_PerformanceTableQuery,
    createTender_DetailsTableQuery
]

function executeQueries(queryNum) {
    if (queryNum === queries.length) {
        return;
    } else {
        console.log(queryNum);
        mysqlConnection.query(queries[queryNum], function(err,results){
            if(err) {
                console.log(err);
            } else {
                console.log(results);
                executeQueries(queryNum+1);
            }
        });
    }
}



queryObj.configDB = function() {
    executeQueries(0);
}

module.exports = queryObj;
