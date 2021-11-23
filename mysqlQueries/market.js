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
            ServiceQuality varchar(10) NOT NULL,
            ShopWorkerBehaviour varchar(10) NOT NULL CHECK (ShopWorkerBehaviour IN ("Polite", "Rude")),
            Email varchar(50) NOT NULL
        );
    `
const  createRentPaymentTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS RentPayment(
            ReferenceID varchar(20) PRIMARY KEY,
            RentPaid int NOT NULL,
            ElectricityBillPaid int NOT NULL,
            DateofPayment date NOT NULL
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

const createTender_DetailsTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Tender_Details(
            ShopID varchar(20),
            ShopKeeperID varchar(20),
            ShopName varchar(20) NOT NULL,
            License_registered date NOT NULL,
            License_expiry date NOT NULL,
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
            ReferenceID varchar(20),
            Payment_Status varchar(10) NOT NULL,
            CONSTRAINT Payment_Details_fk1 FOREIGN KEY (ShopID) references Shop(ShopID),
            CONSTRAINT Payment_Details_fk2 FOREIGN KEY (ShopKeeperID) references ShopKeeper(ShopKeeperID),
            CONSTRAINT Payment_Details_fk3 FOREIGN KEY (ReferenceID) references RentPayment(ReferenceID),
            PRIMARY KEY (ShopID, ShopKeeperID, ReferenceID)
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
//              Database Configuration
//================================================

const queries = [
    createShopTableQuery,
    createShopKeeperTableQuery,
    createShopFeedbackTableQuery,
    createRentPaymentTableQuery,
    createShop_PerformanceTableQuery,
    createTender_DetailsTableQuery,
    createPayment_DetailsTableQuery,
    'DROP PROCEDURE IF EXISTS InsertShop;',
    createProcedureInsertShopQuery,
    'CALL InsertShop();',
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
