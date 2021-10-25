const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};

//================================================
//             Create Table Queries
//================================================

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
//              Database Configuration
//================================================

function createRoomTable() {
    mysqlConnection.query(createRoomTableQuery, function(err,results){
        if(err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

function createBookingRequestTable() {
    mysqlConnection.query(createBookingRequestTableQuery, function(err,results){
        if(err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

function createBookingTable() {
    mysqlConnection.query(createBookingTableQuery, function(err,results){
        if(err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

function createGuestTable() {
    mysqlConnection.query(createGuestTableQuery, function(err,results){
        if(err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

function createRoom_BookingTable() {
    mysqlConnection.query(createRoom_BookingTableQuery, function(err,results){
        if(err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

function createGuest_BookingTable() {
    mysqlConnection.query(createGuest_BookingTableQuery, function(err,results){
        if(err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

function createBookingRequest_BookingTable() {
    mysqlConnection.query(createBookingRequest_BookingTableQuery, function(err,results){
        if(err) {
            console.log(err);
        } else {
            console.log(results);
        }
    });
}

queryObj.configDB = function() {
    createRoomTable();
    createBookingRequestTable();
    createBookingTable();
    createGuestTable();
    createRoom_BookingTable();
    createGuest_BookingTable();
    createBookingRequest_BookingTable();
}

module.exports = queryObj;
