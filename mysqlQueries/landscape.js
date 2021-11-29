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

queryObj.selectPendingMaintenanceRequest = function() {
    const mysqlQuery = 
        `
            SELECT * FROM MaintenanceRequest
            NATURAL JOIN MaintenanceRequest_User 
            NATURAL JOIN User 
            NATURAL JOIN Equipment
            Where Status="Pending";
        `
    return mysqlQuery;
}

queryObj.updateMaintenanceRequestStatus = function(params) {
    const mysqlQuery = 
        `
            UPDATE MaintenanceRequest
            SET Status="${params.Status}"
            WHERE MID="${params.MID}";
        `
    return mysqlQuery;
}

queryObj.selectScheduledGardener = function(params) {
    const mysqlQuery = 
        `
            SELECT Gardener.GName, Gardener.GID, Gardener.Phone, CampusArea.Address FROM GardenerDuty
            NATURAL JOIN Gardener_GardenerDuty
            NATURAL JOIN Gardener
            NATURAL JOIN Gardener_CampusArea 
            INNER JOIN CampusArea ON CampusArea.AID=Gardener_CampusArea.AID
            WHERE GardenerDuty.Day=${params.Day};
        `
    return mysqlQuery;
}

queryObj.selectPendingGardenerLeaveRequests = function(params) {
    const mysqlQuery = 
        `
            SELECT * From GardenerLeaveRequests
            NATURAL JOIN Gardener
            NATURAL JOIN Duty
            WHERE Status="Pending";
        `
    return mysqlQuery;
}

queryObj.updateGardenerLeaveRequestStatus = function(params) {
    const mysqlQuery = 
        `
            UPDATE GardenerLeaveRequests
            SET Status="${params.Status}"
            WHERE RequestID="${params.RequestID}";
        `
    return mysqlQuery;
}

queryObj.selectAvailableGardener = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM Gardener
            WHERE Gardener.GID NOT IN (SELECT GID FROM Gardener_GardenerDuty WHERE Gardener_GardenerDuty.DutyID="${params.DutyID}");
        `
    return mysqlQuery;
}

queryObj.updateGardenerReplacement = function(params) {
    const mysqlQuery = 
        `
            UPDATE GardenerLeaveRequests
            SET AssignedGardenerID="${params.AssignedGardenerID}"
            WHERE RequestID="${params.RequestID}";
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

queryObj.insertMaintenanceRequest = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO MaintenanceRequest
            VALUES ("${params.MID}", "${params.EID}", "${params.Date}", "${params.Description}", "${params.Status}");
        `
    return mysqlQuery;
}

queryObj.insertMaintenanceRequest_User = function(params) {
    const mysqlQUery = 
        `
            INSERT INTO MaintenanceRequest_User 
            VALUES ("${params.MID}", "${params.CollegeID}");
        `
    return mysqlQUery;
}

queryObj.insertNewGardenerLeaveRequest = function(params) {
    const mysqlQuery = 
    `
        INSERT INTO GardenerLeaveRequests(RequestID, GID, DutyID, Date, RequestTime, Reason, Status)
        VALUES ("${params.RequestID}", "${params.GID}", "${params.DutyID}", "${params.Date}", "${params.RequestTime}", "${params.Reason}", "${params.Status}");
    `
    return mysqlQuery;
}

queryObj.selectallEquipment = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM Equipment
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

const createGardenerDutyTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS GardenerDuty(
            DutyID int Primary Key,
            Day int CHECK (Day IN (1,2,3,4,5,6))
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
const createMaintenanceRequestTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS MaintenanceRequest(
            MID varchar(10) PRIMARY KEY,
            EID varchar(10),
            Date date NOT NULL,
            Description varchar(50) NOT NULL,
            Status varchar(15) NOT NULL, 
            CONSTRAINT MaintenanceRequest_fk1 FOREIGN KEY(EID) references Equipment(EID) 
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

const createGardenerLeaveRequestsTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS GardenerLeaveRequests(
            RequestID int Primary Key,
            GID varchar(10),
            DutyID int,
            Date date,
            RequestTime datetime,
            Reason varchar(100),
            Status varchar(10) CHECK (Status IN ('Pending', 'Accepted', 'Denied')),
            AssignedGardenerID varchar(10)
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
const createMaintenanceRequest_UserTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS MaintenanceRequest_User(
            MID varchar(10),
            CollegeID varchar(10),
            CONSTRAINT MaintenanceRequest_User_User_fk1 FOREIGN KEY (MID) references MaintenanceRequest(MID),
            CONSTRAINT MaintenanceRequest_User_User_fk2 FOREIGN KEY (CollegeID) references User(CollegeID),
            PRIMARY KEY(MID,CollegeID)
        );
    `
    
const createGardener_GardenerDutyTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Gardener_GardenerDuty(
            GID varchar(10),
            DutyID int,
            CONSTRAINT Gardener_GardenerDuty_fk1 FOREIGN KEY (GID) references Gardener(GID),
            CONSTRAINT Gardener_GardenerDuty_fk2 FOREIGN KEY (DutyID) references GardenerDuty(DutyID),
            PRIMARY KEY(GID,DutyID)
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
                    IF num>=10 THEN 
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
                    IF num>=5 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    INSERT INTO CampusArea VALUES (CONCAT("A", num+1), CONCAT("Address", num+1),CONCAT("Description_",num+1));
                    SET num = num + 1;
                END LOOP;
            END IF;
        END;
    `

const createProcedureInsertGardener_CampusAreaQuery = 
    `
        CREATE PROCEDURE InsertGardener_CampusArea()
        BEGIN
            declare num int default 0;
            declare num2 int default 0;   
            SELECT COUNT(*) INTO num FROM Gardener_CampusArea;
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>=30 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    INSERT INTO Gardener_CampusArea VALUES (CONCAT("G", num+1), CONCAT("A",num2+1));
                    INSERT INTO Gardener_CampusArea VALUES (CONCAT("G", num+2), CONCAT("A",num2+1));
                    INSERT INTO Gardener_CampusArea VALUES (CONCAT("G", num+3), CONCAT("A",num2+1));
                    INSERT INTO Gardener_CampusArea VALUES (CONCAT("G", num+4), CONCAT("A",num2+1));
                    INSERT INTO Gardener_CampusArea VALUES (CONCAT("G", num+5), CONCAT("A",num2+1));
                    INSERT INTO Gardener_CampusArea VALUES (CONCAT("G", num+6), CONCAT("A",num2+1));
                    SET num = num + 6;
                    SET num2 = num2 + 1;
                END LOOP;
            END IF;
        END;
    `

const createInsertGardenerDutiesProcedure = 
    `
        CREATE PROCEDURE InsertGardenerDuties()
        BEGIN
            DECLARE num int default 0;
            SELECT COUNT(*) INTO num FROM GardenerDuty;
            IF num=0 THEN
                SET num = num + 1;
                insertionLoop: LOOP
                    IF num<=6 THEN 
                        INSERT INTO GardenerDuty VALUES (num, num);
                    ELSE
                        LEAVE insertionLoop;
                    END IF;
                    SET num = num + 1;
                END LOOP;
            END IF;
        END
    `

const createGardenerDutyScheduler = 
    `
        CREATE PROCEDURE GardenerDutyScheduler()
        BEGIN
            DECLARE num int default 0;
            CALL InsertGardenerDuties();
            SELECT COUNT(*) INTO num FROM Gardener_GardenerDuty;
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num<30 THEN
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+1), 1);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+1), 2);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+1), 3);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+1), 4);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+1), 5);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+2), 1);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+2), 2);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+2), 3);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+2), 4);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+2), 6);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+3), 1);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+3), 2);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+3), 3);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+3), 5);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+3), 6);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+4), 1);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+4), 2);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+4), 4);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+4), 5);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+4), 6);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+5), 1);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+5), 3);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+5), 4);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+5), 5);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+5), 6);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+6), 2);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+6), 3);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+6), 4);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+6), 5);
                        INSERT INTO Gardener_GardenerDuty VALUES (CONCAT('G', num+6), 6);
                    ELSE
                        LEAVE insertionLoop;
                    END IF;
                    SET num = num + 6;
                END LOOP;
            END IF;
        END
    `

const queries = [
    createGardenerTableQuery,
    createGardenerDutyTableQuery,
    createEquipmentTableQuery,
    createCampusAreaTableQuery,
    createMaintenanceRequestTableQuery,
    createGrassCuttingRequestTableQuery,
    createGardenerLeaveRequestsTableQuery,
    createGardener_CampusAreaTableQuery,
    createGardener_GrassCuttingRequestTableQuery,
    createGrassCuttingRequest_UserTableQuery,
    createMaintenanceRequest_UserTableQuery,
    createGardener_GardenerDutyTableQuery,
    'DROP PROCEDURE IF EXISTS InsertGardener;',
    createProcedureInsertGardenerQuery,
    'CALL InsertGardener();',
    'DROP PROCEDURE IF EXISTS InsertEquipment;',
    createProcedureInsertEquipmentQuery,
    'CALL InsertEquipment();',
    'DROP PROCEDURE IF EXISTS InsertCampusArea;',
    createProcedureInsertCampusAreaQuery,
    'CALL InsertCampusArea();',
    'DROP PROCEDURE IF EXISTS InsertGardener_CampusArea;',
     createProcedureInsertGardener_CampusAreaQuery,
    'CALL InsertGardener_CampusArea();',
    'DROP PROCEDURE IF EXISTS InsertGardenerDuties',
    createInsertGardenerDutiesProcedure,
    'DROP PROCEDURE IF EXISTS GardenerDutyScheduler',
    createGardenerDutyScheduler,
    'CALL GardenerDutyScheduler();'
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
