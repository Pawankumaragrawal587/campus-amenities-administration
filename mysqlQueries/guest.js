const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};

//================================================
//              Select Queries
//================================================

queryObj.roomAvailabilityQuery = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM room
            WHERE occupancy="${params.occupancy}" and HasBathroom="${params.hasBathroom}";
        `
    return mysqlQuery;
}

queryObj.selectUser = function(webmail) {
    const mysqlQuery = 
        `
            SELECT * FROM user 
            WHERE user.webmail="${webmail}";
        `
    return mysqlQuery;
}

//================================================
//             Create Table Queries
//================================================

const createUserTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS user(
            CollegeID varchar(20) PRIMARY KEY,
            UserType varchar(10) NOT NULL CHECK (UserType IN ("Admin", "Staff", "Student")),
            Name varchar(30) NOT NULL,
            Webmail varchar(30) NOT NULL,
            Password varchar(100) NOT NULL
        );
    `

const createRoomTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS room(
            RoomNumber varchar(10) PRIMARY KEY,
            Occupancy varchar(10) NOT NULL CHECK (Occupancy IN ("Single", "Double")),
            HasBathroom varchar(5) NOT NULL CHECK (HasBathroom IN ("Yes", "No")),
            Cost int NOT NULL
        );
    `

const createBookingRequestTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS BookingRequest(
            BookingRequestId varchar(10) primary Key,
            Status varchar(10) NOT NULL CHECK (Status IN ("Pending", "Failed", "Booked")),
            TimeStamp datetime NOT NULL
        );
    `

const createBookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Booking(
            BookingID varchar(10) PRIMARY KEY,
            BookedBy varchar(30) NOT NULL,
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

const createRoom_BookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Room_Booking(
            RoomNumber varchar(10),
            BookingID varchar(10),
            CONSTRAINT Room_Booking_fk1 FOREIGN KEY (RoomNumber) references room(RoomNumber),
            CONSTRAINT Room_Booking_fk2 FOREIGN KEY (BookingID) references Booking(BookingID),
            PRIMARY KEY (RoomNumber, BookingID)
        );
    `

const createGuest_BookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Guest_Booking(
            AadharNumber char(12),
            BookingID varchar(10),
            CONSTRAINT Guest_Booking_fk1 FOREIGN KEY (AadharNumber) references Guest(AadharNumber),
            CONSTRAINT Guest_Booking_fk2 FOREIGN KEY (BookingID) references Booking(BookingID),
            PRIMARY KEY (AadharNumber, BookingID)
        );
    `

const createBookingRequest_BookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS BookingRequest_Booking(
            BookingRequestId varchar(10),
            BookingID varchar(10),
            CONSTRAINT BookingRequest_Booking_fk1 FOREIGN KEY (BookingRequestId) references BookingRequest(BookingRequestId),
            CONSTRAINT BookingRequest_Booking_fk2 FOREIGN KEY (BookingID) references Booking(BookingID),
            PRIMARY KEY (BookingRequestId, BookingID)
        );
    `

//================================================
//            Create Procedure Queries
//================================================

const createProcedureinsertRoomQuery = 
    `
        CREATE PROCEDURE insertRoom()
        BEGIN
            declare num int default 0;
            SELECT COUNT(*) INTO num FROM room;
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>= 40 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    IF num<10 THEN 
                        INSERT INTO room VALUES (CONCAT("RMA-", num+1), "Single", "No", 800);
                    ELSEIF num<20 THEN 
                        INSERT INTO room VALUES (CONCAT("RMB-", num+1), "Double", "No", 1300);
                    ELSEIF num<30 THEN 
                        INSERT INTO room VALUES (CONCAT("RMC-", num+1), "Single", "Yes", 1000);
                    ELSE
                        INSERT INTO room VALUES (CONCAT("RMD-", num+1), "Double", "Yes", 1500);
                    END IF;
                    SET num = num + 1;
                END LOOP;
            END IF;
        END;
    `

//================================================
//              Database Configuration
//================================================

const queries = [
    createUserTableQuery,
    createRoomTableQuery,
    createBookingRequestTableQuery,
    createBookingTableQuery,
    createGuestTableQuery,
    createRoom_BookingTableQuery,
    createGuest_BookingTableQuery,
    createBookingRequest_BookingTableQuery,
    'DROP PROCEDURE IF EXISTS insertRoom;',
    createProcedureinsertRoomQuery,
    'CALL insertRoom();'
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
