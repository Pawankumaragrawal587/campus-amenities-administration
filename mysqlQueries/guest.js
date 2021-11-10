const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};

//================================================
//              Select Queries
//================================================

queryObj.selectUser = function(webmail) {
    const mysqlQuery = 
        `
            SELECT * FROM User 
            WHERE User.webmail="${webmail}";
        `
    return mysqlQuery;
}

queryObj.roomAvailabilityQuery = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM Room
            where Occupancy="${params.occupancy}" and HasBathroom="${params.hasBathroom}"
            and RoomNumber NOT IN (
                SELECT RoomNumber FROM Room_Booking
                INNER JOIN Booking ON Room_Booking.BookingID=Booking.BookingID
                WHERE Booking.Status!="Rejected"
                and (Booking.BookedFrom <= "${params.stayTill}" and Booking.BookedTill >= "${params.stayFrom}")
            );
        `
    return mysqlQuery;
}

queryObj.pendingBookings = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM Booking
            NATURAL JOIN User_Booking
            NATURAL JOIN Room_Booking
            NATURAL JOIN Guest_Booking
            NATURAL JOIN Guest
            WHERE Status="Pending";
        `
    return mysqlQuery;
}

queryObj.updateRoomBookingStatus = function(params) {
    const mysqlQuery = 
        `
            UPDATE Booking
            SET Status="${params.status}"
            WHERE BookingID=${params.bookingId};
        `
    return mysqlQuery;
}

//================================================
//              Insert Queries
//================================================

queryObj.insertBooking = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO Booking
            VALUES (${params.bookingID}, "${params.status}", "${params.bookingTime}", "${params.stayFrom}", "${params.stayTill}", "${params.purposeOfStay}", "${params.paymentMethod}");
        `
    return mysqlQuery;
}

queryObj.insertGuest = function(params) {
    const mysqlQuery = 
        `
            INSERT IGNORE INTO Guest
            VALUES ("${params.aadharNumber}", "${params.name}", ${params.age}, "${params.email}", "${params.mobile}");
        `
    return mysqlQuery;
}

//================================================
//             Create Table Queries
//================================================

const createUserTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS User(
            CollegeID varchar(20) PRIMARY KEY,
            UserType varchar(10) NOT NULL CHECK (UserType IN ("Admin", "Staff", "Student")),
            Name varchar(50) NOT NULL,
            Webmail varchar(50) NOT NULL UNIQUE,
            Password varchar(50) NOT NULL
        );
    `

const createRoomTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Room(
            RoomNumber varchar(10) PRIMARY KEY,
            Occupancy varchar(10) NOT NULL CHECK (Occupancy IN ("Single", "Double")),
            HasBathroom varchar(5) NOT NULL CHECK (HasBathroom IN ("Yes", "No")),
            Cost int NOT NULL
        );
    `

const createBookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Booking(
            BookingID int PRIMARY KEY,
            Status varchar(10) NOT NULL CHECK (Status IN ("Approved", "Rejected", "Pending")),
            BookingTime datetime NOT NULL,
            BookedFrom date NOT NULL,
            BookedTill date NOT NULL,
            PurposeOfStay varchar(200) NOT NULL,
            PaymentMethod varchar(20) NOT NULL
        );
    `

const createGuestTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Guest(
            AadharNumber char(12) Primary Key,
            Name varchar(30) NOT NULL,
            Age int NOT NULL,
            Email varchar(30) NOT NULL,
            Mobile char(10) NOT NULL
        );
    `

const createUser_BookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS User_Booking(
            CollegeID varchar(20),
            BookingID int,
            CONSTRAINT User_Booking_fk1 FOREIGN KEY (CollegeID) references User(CollegeID),
            CONSTRAINT User_Booking_fk2 FOREIGN KEY (BookingID) references Booking(BookingID),
            PRIMARY KEY (CollegeID, BookingID)
        );
    `

const createRoom_BookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Room_Booking(
            RoomNumber varchar(10),
            BookingID int,
            CONSTRAINT Room_Booking_fk1 FOREIGN KEY (RoomNumber) references Room(RoomNumber),
            CONSTRAINT Room_Booking_fk2 FOREIGN KEY (BookingID) references Booking(BookingID),
            PRIMARY KEY (RoomNumber, BookingID)
        );
    `

const createGuest_BookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Guest_Booking(
            AadharNumber char(12),
            BookingID int,
            CONSTRAINT Guest_Booking_fk1 FOREIGN KEY (AadharNumber) references Guest(AadharNumber),
            CONSTRAINT Guest_Booking_fk2 FOREIGN KEY (BookingID) references Booking(BookingID),
            PRIMARY KEY (AadharNumber, BookingID)
        );
    `

const createIDGeneratorTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS IDGenerator(
            TableName varchar(20) Primary Key,
            ID int
        );
    `

//================================================
//            Create Procedure Queries
//================================================

const createProcedureInsertRoomQuery = 
    `
        CREATE PROCEDURE InsertRoom()
        BEGIN
            declare num int default 0;
            SELECT COUNT(*) INTO num FROM Room;
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>= 40 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    IF num<10 THEN 
                        INSERT INTO Room VALUES (CONCAT("RMA-", num+1), "Single", "No", 800);
                    ELSEIF num<20 THEN 
                        INSERT INTO Room VALUES (CONCAT("RMB-", num+1), "Double", "No", 1300);
                    ELSEIF num<30 THEN 
                        INSERT INTO Room VALUES (CONCAT("RMC-", num+1), "Single", "Yes", 1000);
                    ELSE
                        INSERT INTO Room VALUES (CONCAT("RMD-", num+1), "Double", "Yes", 1500);
                    END IF;
                    SET num = num + 1;
                END LOOP;
            END IF;
        END;
    `

const createProcedureInsertUserQuery = 
    `
        CREATE PROCEDURE InsertUser()
        BEGIN
            declare num int default 0;
            SELECT COUNT(*) INTO num FROM User WHERE UserType="Admin";
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>= 5 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    INSERT INTO User VALUES (CONCAT("ADM", num+1), "Admin", CONCAT("ADMIN_NAME", num+1), CONCAT(CONCAT("ADMINNAME", num+1), "_", CONCAT("ADM", num+1), "@iitp.ac.in"), LEFT(MD5(RAND()), 10));
                    SET num = num + 1;
                END LOOP;
            END IF;
            SET num=0;
            SELECT COUNT(*) INTO num FROM User WHERE UserType="Staff";
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>= 100 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    INSERT INTO User VALUES (CONCAT("EMP", num+1), "Staff", CONCAT("STAFF_NAME", num+1), CONCAT(CONCAT("STAFF_NAME", num+1), "_", CONCAT("EMP", num+1), "@iitp.ac.in"), LEFT(MD5(RAND()), 10));
                    SET num = num + 1;
                END LOOP;
            END IF;
            SET num=0;
            SELECT COUNT(*) INTO num FROM User WHERE UserType="Student";
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>= 320 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    IF num<80 THEN 
                        INSERT INTO User VALUES (CONCAT("1701CS", num+1), "Student", CONCAT("STUDENT_NAME", num+1), CONCAT(CONCAT("STUDENT_NAME", num+1), "_", CONCAT("1701CS", num+1), "@iitp.ac.in"), LEFT(MD5(RAND()), 10));
                    ELSEIF num<160 THEN 
                        INSERT INTO User VALUES (CONCAT("1801CS", num+1-80), "Student", CONCAT("STUDENT_NAME", num+1-80), CONCAT(CONCAT("STUDENT_NAME", num+1-80), "_", CONCAT("1801CS", num+1-80), "@iitp.ac.in"), LEFT(MD5(RAND()), 10));
                    ELSEIF num<240 THEN 
                        INSERT INTO User VALUES (CONCAT("1901CS", num+1-160), "Student", CONCAT("STUDENT_NAME", num+1-160), CONCAT(CONCAT("STUDENT_NAME", num+1-160), "_", CONCAT("1901CS", num+1-160), "@iitp.ac.in"), LEFT(MD5(RAND()), 10));
                    ELSE
                        INSERT INTO User VALUES (CONCAT("2001CS", num+1-240), "Student", CONCAT("STUDENT_NAME", num+1-240), CONCAT(CONCAT("STUDENT_NAME", num+1-240), "_", CONCAT("2001CS", num+1-240), "@iitp.ac.in"), LEFT(MD5(RAND()), 10));
                    END IF;    
                    SET num = num + 1;
                END LOOP;
                UPDATE User SET Name="Pawan Kumar Agrawal", Webmail="Pawan_1901CS40@iitp.ac.in" WHERE CollegeID="1901CS40";
            END IF;
        END;
    `

const createInsertBookingRelationsProcedure = 
    `
        CREATE PROCEDURE InsertBookingRelations(
            IN CollegeID varchar(20),
            IN RoomNumber varchar(10),
            IN AadharNumber char(12),
            IN BookingID int
        )
        BEGIN
            INSERT INTO User_Booking VALUES (CollegeID, BookingID);
            INSERT INTO Room_Booking VALUES (RoomNumber, BookingID);
            INSERT INTO Guest_Booking VALUES (AadharNumber, BookingID);
        END
    `

//================================================
//              Functions
//================================================

const createGetIDFunction = 
    `
        CREATE FUNCTION GetID(TableName varchar(20))
        RETURNS int 
        DETERMINISTIC
        BEGIN
            DECLARE result int DEFAULT 0;
            IF EXISTS (SELECT * FROM IDGenerator WHERE IDGenerator.TableName=TableName) THEN 
                UPDATE IDGenerator SET ID=ID+1 WHERE IDGenerator.TableName=TableName;
                SELECT ID INTO result FROM IDGenerator WHERE IDGenerator.TableName=TableName;
            ELSE
                INSERT INTO IDGenerator VALUES (TableName, 1);
                SET result=1;
            END IF;
            RETURN result;
        END
    `

//================================================
//              Database Configuration
//================================================

const queries = [
    createUserTableQuery,
    createRoomTableQuery,
    createBookingTableQuery,
    createGuestTableQuery,
    createUser_BookingTableQuery,
    createRoom_BookingTableQuery,
    createGuest_BookingTableQuery,
    createIDGeneratorTableQuery,
    'DROP PROCEDURE IF EXISTS InsertRoom;',
    createProcedureInsertRoomQuery,
    'CALL InsertRoom();',
    'DROP PROCEDURE IF EXISTS InsertUser;',
    createProcedureInsertUserQuery,
    'CALL InsertUser();',
    'DROP PROCEDURE IF EXISTS InsertBookingRelations',
    createInsertBookingRelationsProcedure,
    'DROP FUNCTION IF EXISTS GetID',
    createGetIDFunction
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
