const { query } = require('express');
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};

//================================================
//             Select Queries
//================================================

queryObj.selectCampusArea = function() {
    const mysqlQuery = 
        `
            SELECT * FROM CampusArea;
        `
    return mysqlQuery;
}

queryObj.selectPendingGrassCuttingRequests = function() {
    const mysqlQuery = 
        `
            SELECT * FROM GrassCuttingRequest
            NATURAL JOIN GrassCuttingRequest_User 
            NATURAL JOIN User
            NATURAL JOIN CampusArea
            WHERE Status="Pending";
        `
    return mysqlQuery;
}

queryObj.updateGrassCuttingRequestStatus = function(params) {
    const mysqlQuery = 
        `
            UPDATE GrassCuttingRequest
            SET Status="${params.Status}"
            WHERE GrassCuttingRequestID="${params.GrassCuttingRequestID}";
        `
    return mysqlQuery;
}



queryObj.selectEquipment = function() {
    const mysqlQuery = 
        `
            SELECT * FROM Equipment;
        `
    return mysqlQuery;
}

//================================================
//             Insert Queries
//================================================

queryObj.insertGrassCuttingRequest = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO GrassCuttingRequest(GrassCuttingRequestID, Date, AID, Comments, Status)
            VALUES ("${params.GrassCuttingRequestID}", "${params.Date}", "${params.AID}", "${params.Comments}", "${params.Status}");
        `
    return mysqlQuery;
}

queryObj.insertGrassCuttingRequest_User = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO GrassCuttingRequest_User
            VALUES ("${params.GrassCuttingRequestID}", "${params.CollegeID}");
        `
    return mysqlQuery;
}

//================================================
//             Create Table Queries
//================================================

const createGardenerTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Gardener(
            GID varchar(10) PRIMARY KEY,
            GName varchar(20) NOT NULL,
            Phone varchar(10) NOT NULL,
            Address varchar(50) NOT NULL,
            Salary int NOT NULL
        );
    `

const createEquipmentTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Equipment(
            EID varchar(10) PRIMARY KEY,
            EquipmentName varchar(20) NOT NULL,
            Cost int NOT NULL
        );
    `
const createCampusAreaTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS CampusArea(
            AID varchar(10) PRIMARY KEY,
            Address varchar(20) NOT NULL,
            AreaDescription varchar(100) NOT NULL
            
        );
    `
const createMaintainanceRequestTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS MaintainanceRequest(
            MID varchar(10) PRIMARY KEY,
            GID varchar(10),
            EID varchar(10),
            Date date NOT NULL,
            Description varchar(50) NOT NULL,
            Status varchar(15) NOT NULL, 
            CONSTRAINT MaintainanceRequest_fk1 FOREIGN KEY(GID) references Gardener(GID),
            CONSTRAINT MaintainanceRequest_fk2 FOREIGN KEY(EID) references Equipment(EID) 
        );
    `
const createGrassCuttingRequestTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS GrassCuttingRequest(
            GrassCuttingRequestID varchar(10) PRIMARY KEY,
            GID varchar(10),
            AID varchar(10),
            Date date NOT NULL,
            Comments varchar(50),
            Status varchar(15) NOT NULL,
            CONSTRAINT GrassCuttingRequest_fk1 FOREIGN KEY (GID) references Gardener(GID),
            CONSTRAINT GrassCuttingRequest_fk2 FOREIGN KEY (AID) references CampusArea(AID)
        );
    `
// const createGardener_UserTableQuery = 
//     `
//         CREATE TABLE IF NOT EXISTS Gardener_User(
//             GID varchar(10) ,
//             CollegeID varchar(10),
//             CONSTRAINT Gardener_User_fk1 FOREIGN KEY (GID) references Gardener(GID),
//             CONSTRAINT Gardener_User_fk2 FOREIGN KEY (CollegeID) references User(CollegeID),
//             PRIMARY KEY(GID,CollegeID)
            
//         );
//     `
const createGardener_CampusAreaTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Gardener_CampusArea(
            GID varchar(10) ,
            AID varchar(10),
            CONSTRAINT Gardener_CampusArea_fk1 FOREIGN KEY (GID) references Gardener(GID),
            CONSTRAINT Gardener_CampusArea_fk2 FOREIGN KEY (AID) references CampusArea(AID),
            PRIMARY KEY(GID,AID)
            
        );
    `
const createGardener_EquipmentTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Gardener_Equipment(
            GID varchar(10) ,
            EID varchar(10),
            CONSTRAINT Gardener_Equipment_fk1 FOREIGN KEY (GID) references Gardener(GID),
            CONSTRAINT Gardener_Equipment_fk2 FOREIGN KEY (EID) references Equipment(EID),
            PRIMARY KEY(GID,EID)
        );
    `
const createGardener_GrassCuttingRequestTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Gardener_GrassCuttingRequest(
            GID varchar(10) ,
            GrassCuttingRequestID varchar(10),
            CONSTRAINT Gardener_GrassCuttingRequest_fk1 FOREIGN KEY (GID) references Gardener(GID),
            CONSTRAINT Gardener_GrassCuttingRequest_fk2 FOREIGN KEY (GrassCuttingRequestID) references GrassCuttingRequest(GrassCuttingRequestID),
            PRIMARY KEY(GrassCuttingRequestID,GID)
            
        );
    `

const createGrassCuttingRequest_UserTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS GrassCuttingRequest_User(
            GrassCuttingRequestID varchar(10),
            CollegeID varchar(10),
            CONSTRAINT GrassCuttingRequest_User_fk1 FOREIGN KEY (GrassCuttingRequestID) references GrassCuttingRequest(GrassCuttingRequestID),
            CONSTRAINT GrassCuttingRequest_User_fk2 FOREIGN KEY (CollegeID) references User(CollegeID),
            PRIMARY KEY(GrassCuttingRequestID,CollegeID)
        );
    `
    
//================================================
//            Create Procedure Queries
//================================================

const createProcedureInsertGardenerQuery = 
    `
        CREATE PROCEDURE InsertGardener()
        BEGIN
            declare num int default 0;
            SELECT COUNT(*) INTO num FROM Gardener;
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>=30 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    INSERT INTO Gardener VALUES (CONCAT("G", num+1), CONCAT("Gardener_Name", num+1),CONCAT("GPhone",num+1),CONCAT("GardenerAddress_", num+1),FLOOR(RAND()*(100000-10000+1))+10000);
                    SET num = num + 1;
                END LOOP;
            END IF;
        END;
    `
const createProcedureInsertEquipmentQuery = 
    `
        CREATE PROCEDURE InsertEquipment()
        BEGIN
            declare num int default 0;
            SELECT COUNT(*) INTO num FROM Equipment;
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>=15 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    INSERT INTO Equipment VALUES (CONCAT("E", num+1), CONCAT("EquipmentName_", num+1),FLOOR(RAND()*(10000-100+1))+100);
                    SET num = num + 1;
                END LOOP;
            END IF;
        END;
    `

    
const createProcedureInsertCampusAreaQuery = 
`
    CREATE PROCEDURE InsertCampusArea()
    BEGIN
        declare num int default 0;
        SELECT COUNT(*) INTO num FROM CampusArea;
        IF num=0 THEN
            insertionLoop: LOOP
                IF num>=8 THEN 
                    LEAVE insertionLoop;
                END IF;
                INSERT INTO CampusArea VALUES (CONCAT("A", num+1), CONCAT("Address", num+1),CONCAT("Description_",num+1));
                SET num = num + 1;
            END LOOP;
        END IF;
    END;
`


const queries = [
    createGardenerTableQuery,
    createEquipmentTableQuery,
    createCampusAreaTableQuery,
    createMaintainanceRequestTableQuery,
    createGrassCuttingRequestTableQuery,
    createGardener_CampusAreaTableQuery,
    createGardener_EquipmentTableQuery,
    createGardener_GrassCuttingRequestTableQuery,
    createGrassCuttingRequest_UserTableQuery,
    'DROP PROCEDURE IF EXISTS InsertGardener;',
    createProcedureInsertGardenerQuery,
    'CALL InsertGardener();',
    'DROP PROCEDURE IF EXISTS InsertEquipment;',
    createProcedureInsertEquipmentQuery,
    'CALL InsertEquipment();',
    'DROP PROCEDURE IF EXISTS InsertCampusArea;',
    createProcedureInsertCampusAreaQuery,
    'CALL InsertCampusArea();'
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
