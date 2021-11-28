const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};

//================================================
//             Select Queries
//================================================

queryObj.selectAvailableShops = function(){
    const mysqlQuery = 
        `
            SELECT * FROM Shop 
            Where Occupied="No";
        `
    return mysqlQuery;
}

queryObj.selectShopKeeperinfo = function(){
    const mysqlQuery = 
        `
            SELECT * FROM ShopKeeper;
        `
    return mysqlQuery;
}

queryObj.selectPendingTenderRequests = function() {
    const mysqlQuery = 
        `
            SELECT * FROM Tender_Details
            NATURAL JOIN ShopKeeper
            WHERE Tender_Details.Tender_Status="Pending";
        `
    return mysqlQuery;
}

queryObj.updateTenderStatus = function(params) {
    const mysqlQuery = 
        `
            UPDATE Tender_Details
            SET Tender_Status="${params.Status}" 
            WHERE ShopID="${params.ShopID}" and ShopKeeperID="${params.ShopKeeperID}";
        `
    return mysqlQuery;
}

queryObj.updateLicense = function(params) {
    const mysqlQuery = 
        `
            UPDATE Tender_Details
            SET License_registered = "${params.License_registered}" , License_expiry = "${params.License_expiry}" 
            WHERE ShopID="${params.ShopID}" and ShopKeeperID="${params.ShopKeeperID}";
        `
    return mysqlQuery;
}

queryObj.setShopAsOccupied = function(params) {
    const mysqlQuery = 
        `
            UPDATE Shop
            SET Occupied="Yes" 
            WHERE ShopID="${params.ShopID}";
        `
    return mysqlQuery;
}

queryObj.selectActiveShops = function() {
    const mysqlQuery = 
        `
            SELECT * FROM Shop 
            NATURAL JOIN Tender_Details
            WHERE Occupied="Yes" and Tender_Status="Approved" and License_expiry>=CURDATE(); 
        `
    return mysqlQuery;
}

queryObj.selectShopKeeper = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM ShopKeeper
            WHERE ShopKeeperID="${params.ShopKeeperID}";
        `
    return mysqlQuery;
}

//================================================
//             Insert Queries
//================================================

queryObj.insertShopKeeper = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO ShopKeeper
            VALUES ("${params.ShopKeeperID}", "${params.ShopKeeperName}", "${params.MobileNo}", "${params.PanCardNo}", "${params.Address}");
        `
    return mysqlQuery;
}

queryObj.insertTender_Details = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO Tender_Details(ShopID, ShopKeeperID, ShopName, Tender_Status, TypeDescription)
            VALUES ("${params.ShopID}", "${params.ShopKeeperID}", "${params.ShopName}", "${params.Tender_Status}", "${params.TypeDescription}");
        `
    return mysqlQuery;
}

queryObj.insertFeedback = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO ShopFeedback
            VALUES ("${params.FeedbackID}", "${params.ServiceQuality}", "${params.ShopWorkerBehaviour}", "${params.Feedback}");
        `
    return mysqlQuery;
}

queryObj.insertShop_Performance = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO Shop_Performance
            VALUES ("${params.ShopID}", "${params.FeedbackID}");
        `
    return mysqlQuery;
}

queryObj.insertFeedback_user = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO Feedback_user
            VALUES ("${params.CollegeID}", "${params.FeedbackID}");
        `
    return mysqlQuery;
}



//================================================
//             Create Table Queries
//================================================

const createShopTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Shop(
            ShopID varchar(20) PRIMARY KEY,
            Location varchar(20) NOT NULL,
            Rent int NOT NULL,
            Occupied varchar(5) NOT NULL CHECK (Occupied IN ("Yes", "No")),
            Avg_Rating float NOT NULL,
            Img_link varchar(1000) NOT NULL
        );
    `

const createShopKeeperTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Shopkeeper(
            ShopKeeperID varchar(20) PRIMARY KEY,
            ShopKeeperName varchar(20) NOT NULL,
            MobileNo varchar(10) NOT NULL,
            PanCardNo varchar(10) NOT NULL,
            Address varchar(50) NOT NULL            
        );
    `

const  createShopFeedbackTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS ShopFeedback(
            FeedbackID varchar(20) PRIMARY KEY,
            ServiceQuality float NOT NULL,
            ShopWorkerBehaviour varchar(10) NOT NULL CHECK (ShopWorkerBehaviour IN ("Polite", "Rude")),
            Feedback varchar(250)
        );
    `

const createShop_PerformanceTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Shop_Performance(
            ShopID varchar(20),
            FeedbackID varchar(20),
            CONSTRAINT Shop_Performance_fk1 FOREIGN KEY (ShopID) references Shop(ShopID),
            CONSTRAINT Shop_Performance_fk2 FOREIGN KEY (FeedbackID) references ShopFeedback(FeedbackID),
            PRIMARY KEY (ShopID,FeedbackID)
        );
    `
const createFeedback_userTableQuery =
    `
        CREATE TABLE IF NOT EXISTS Feedback_user(
            CollegeID varchar(20),
            FeedbackID varchar(20),
            CONSTRAINT Feedback_user_fk1 FOREIGN KEY (CollegeID) references User(CollegeID),
            CONSTRAINT Feedback_user_fk2 FOREIGN KEY (FeedbackID) references ShopFeedback(FeedbackID),
            PRIMARY KEY (CollegeID,FeedbackID)
        )

    `
const createTender_DetailsTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Tender_Details(
            ShopID varchar(20),
            ShopKeeperID varchar(20),
            ShopName varchar(50) NOT NULL,
            License_registered date,
            License_expiry date,
            Tender_Status varchar(10) NOT NULL,
            TypeDescription varchar(200) NOT NULL,
            CONSTRAINT Tender_Details_fk1 FOREIGN KEY (ShopID) references Shop(ShopID),
            CONSTRAINT Tender_Details_fk2 FOREIGN KEY (ShopKeeperID) references Shopkeeper(ShopKeeperID),
            PRIMARY KEY (ShopID, ShopKeeperID)
        );
    `

const createPayment_DetailsTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Payment_Details(
            ShopID varchar(20),
            ShopKeeperID varchar(20),
            RentReferenceID varchar(20),
            BillReferenceID varchar(20),
            RentPaid int NOT NULL,
            ElectricityBillPaid int NOT NULL,
            DateofVerification date NOT NULL,
            Payment_Status varchar(10) NOT NULL,
            CONSTRAINT Payment_Details_fk1 FOREIGN KEY (ShopID) references Shop(ShopID),
            CONSTRAINT Payment_Details_fk2 FOREIGN KEY (ShopKeeperID) references ShopKeeper(ShopKeeperID),
            PRIMARY KEY (ShopID, ShopKeeperID)
        );
    `    
    
//================================================
//            Create Procedure Queries
//================================================

const createProcedureInsertShopQuery = 
    `
        CREATE PROCEDURE InsertShop()
        BEGIN
            declare num int default 0;
            SELECT COUNT(*) INTO num FROM Shop;
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>= 20 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    IF num<5 THEN 
                        INSERT INTO Shop VALUES (CONCAT("Shop", num+1), CONCAT("Marketplace"), 5000, "No", 0, "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=667&q=80");
                    ELSEIF num<10 THEN 
                        INSERT INTO Shop VALUES (CONCAT("Shop", num+1), CONCAT("GuestHouse"), 6000, "No", 0, "https://hips.hearstapps.com/del.h-cdn.co/assets/16/24/1024x651/gallery-1466177617-2753296191-0f49c62756-b.jpg?resize=480:*");
                    ELSEIF num<15 THEN 
                        INSERT INTO Shop VALUES (CONCAT("Shop", num+1), CONCAT("BoysHostel"), 3000, "No", 0, "https://media.istockphoto.com/photos/bike-shop-owner-working-on-vintage-bicycle-picture-id1184214694?b=1&k=20&m=1184214694&s=170667a&w=0&h=eP3L4cmfEk0CAJQ9WGLTbV67q6G_pP93aDaNZfXSTHg=");
                    ELSE 
                        INSERT INTO Shop VALUES (CONCAT("Shop", num+1), CONCAT("TutorialBlock"), 4000, "No", 0, "https://i.pinimg.com/originals/99/0c/3c/990c3c2d987a9fbfc7a24571815c94ca.jpg");
                    END IF;
                    SET num = num + 1;
                END LOOP;
            END IF;
        END;
    `

// const createProcedureInsertShopKeeperQuery = 
//     `
//         CREATE PROCEDURE InsertShopKeeper()
//         BEGIN
//             declare num int default 0;
//             SELECT COUNT(*) INTO num FROM Shopkeeper;
//             IF num=0 THEN
//                 insertionLoop: LOOP
//                     IF num>= 10 THEN 
//                         LEAVE insertionLoop;
//                     END IF;
//                     IF num<5 THEN 
//                         INSERT INTO Shopkeeper VALUES (CONCAT("Oth", num+1), CONCAT("Shopkeeper_NAME", num+1), CONCAT("2021-01-", num+10), CONCAT("2022-01-", num+10), LPAD(FLOOR(RAND() * 10000000000), 10, '0'), LPAD(FLOOR(RAND() * 10000000000), 10, '0'), CONCAT("Shop_NAME", num+1));
//                     ELSE
//                         INSERT INTO Shopkeeper VALUES (CONCAT("Oth", num+1), CONCAT("Shopkeeper_NAME", num+1-5), CONCAT("2021-02-", num+10), CONCAT("2022-02-", num+10), LPAD(FLOOR(RAND() * 10000000000), 10, '0'), LPAD(FLOOR(RAND() * 10000000000), 10, '0'), CONCAT("Shop_NAME", num+1-5));
//                     END IF;    
//                     SET num = num + 1;
//                 END LOOP;
//             END IF;
//         END;
//     `

//================================================
//            Create Triggers
//================================================

const createTriggerUpdateRating = 
    `
        CREATE TRIGGER AFTER_Shop_Performance_Insertion
        AFTER INSERT
        ON Shop_Performance FOR EACH ROW
        BEGIN
            DECLARE NumberOfFeedbacks float;
            DECLARE TotalRating float;
            DECLARE NewRating float;
            DECLARE OldAverageRating float;
            SELECT COUNT(*) into NumberOfFeedbacks FROM Shop_Performance WHERE ShopID=New.ShopID;
            SELECT ServiceQuality INTO NewRating FROM ShopFeedback WHERE FeedbackID=New.FeedbackID;
            SELECT Avg_Rating INTO OldAverageRating FROM Shop WHERE ShopID=New.ShopID; 
            SET TotalRating=(NumberOfFeedbacks-1)*OldAverageRating+NewRating;
            UPDATE Shop SET Avg_Rating=TotalRating/NumberOfFeedbacks WHERE ShopID=New.ShopID;
        END
    `

//================================================
//              Database Configuration
//================================================

const queries = [
    createShopTableQuery,
    createShopKeeperTableQuery,
    createShopFeedbackTableQuery,
    createShop_PerformanceTableQuery,
    createFeedback_userTableQuery,
    createTender_DetailsTableQuery,
    createPayment_DetailsTableQuery,
    'DROP PROCEDURE IF EXISTS InsertShop;',
    createProcedureInsertShopQuery,
    'CALL InsertShop();',
    'DROP TRIGGER IF EXISTS AFTER_Shop_Performance_Insertion',
    createTriggerUpdateRating
    // 'DROP PROCEDURE IF EXISTS InsertShopKeeper;',
    // createProcedureInsertShopKeeperQuery,
    // 'CALL InsertShopKeeper();'
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
