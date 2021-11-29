const { query } = require('express');
const mysqlConnection = require('../mysqlQueries/mysqlConnection.js');

var queryObj = {};

//================================================
//                  Queries
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

queryObj.openFoodBookings = function() {
    const mysqlQuery = 
        `
            SELECT * FROM FoodOrders
            WHERE Status="Open";
        `
    return mysqlQuery;
}

queryObj.closeFoodBooking = function(param) {
    const mysqlQuery = 
        `
            UPDATE FoodOrders 
            SET Status="Closed"
            WHERE OrdersID=${param.OrdersID};
        `
    return mysqlQuery;
}

queryObj.findOrderUsingOrdersID = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM FoodOrders 
            WHERE OrdersID=${params.OrdersID} and Status="Open";
        `
    return mysqlQuery;
}

queryObj.pendingFoodBookings = function() {
    const mysqlQuery = 
        `
            SELECT * FROM FoodBooking
            NATURAL JOIN User_FoodBooking
            NATURAL JOIN FoodOrders_FoodBooking
            INNER JOIN FoodOrders ON FoodOrders_FoodBooking.OrdersID=FoodOrders.OrdersID
            WHERE FoodBooking.Status="Pending";
        `
    return mysqlQuery;
}

queryObj.updateFoodBookingStatus = function(params) {
    const mysqlQuery = 
        `
            UPDATE FoodBooking
            SET Status="${params.status}"
            WHERE BookingID=${params.bookingId};
        `
    return mysqlQuery;
}

queryObj.updateFoodOrdersBookedQuantity = function(params) {
    const mysqlQuery = 
        `
            UPDATE FoodOrders
            SET BookedQuantity=BookedQuantity+${params.Quantity}
            WHERE OrdersID=${params.OrdersID};
        `
    return mysqlQuery;
}

queryObj.selectFoodOrder = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM FoodOrders
            WHERE OrdersID=${params.OrdersID};
        `
    return mysqlQuery;
}

queryObj.selectRoomFromRoomBookingID = function(params) {
    const mysqlQuery = 
        `
            SELECT Room.* From Room_Booking 
            NATURAL JOIN Room
            WHERE Room_Booking.BookingID=${params.bookingId};
        `
    return mysqlQuery;
}

queryObj.selectRoomBookingByUser = function(CollegeID) {
    const mysqlQuery = 
        `
            SELECT Booking.* From User_Booking
            NATURAL JOIN Booking
            WHERE User_Booking.CollegeID="${CollegeID}";
        `
    return mysqlQuery;
}

queryObj.selectFoodBookingByUser = function(CollegeID) {
    const mysqlQuery = 
        `
            SELECT FoodBooking.* From User_FoodBooking
            NATURAL JOIN FoodBooking
            WHERE User_FoodBooking.CollegeID="${CollegeID}";
        `
    return mysqlQuery;
}

queryObj.selectBillUsingRoomBookingID = function(params) {
    const mysqlQuery = 
        `
            SELECT Bill.* FROM RoomBooking_Bill
            NATURAL JOIN Bill
            WHERE RoomBooking_Bill.BookingID=${params.BookingID};
        `
    return mysqlQuery;
}

queryObj.selectBillUsingFoodBookingID = function(params) {
    const mysqlQuery = 
        `
            SELECT Bill.* FROM FoodBooking_Bill
            NATURAL JOIN Bill
            WHERE FoodBooking_Bill.BookingID=${params.BookingID};
        `
    return mysqlQuery;
}

queryObj.selectUser_Booking = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM User_Booking
            WHERE CollegeID="${params.CollegeID}" and BookingID=${params.BookingID};
        `
    return mysqlQuery;
}

queryObj.selectUser_FoodBooking = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM User_FoodBooking
            WHERE CollegeID="${params.CollegeID}" and BookingID=${params.BookingID};
        `
    return mysqlQuery;
}

queryObj.selectExpenditure = function() {
    const mysqlQuery = 
        `
            SELECT * FROM Expenditure;
        `
    return mysqlQuery;
}

queryObj.getMonthlyRoomBookings = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM Booking
            NATURAL JOIN Room_Booking
            NATURAL JOIN Room
            NATURAL JOIN User_Booking
            WHERE Booking.Status="Approved" and EXTRACT(MONTH FROM BookingTime)="${params.Month}" and EXTRACT(YEAR FROM BookingTime)="${params.Year}"; 
        `
    return mysqlQuery;
}

queryObj.getMonthlyFoodBookings = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM FoodBooking
            NATURAL JOIN User_FoodBooking
            NATURAL JOIN FoodOrders_FoodBooking
            INNER JOIN FoodOrders ON FoodOrders.OrdersID=FoodOrders_FoodBooking.OrdersID
            WHERE FoodBooking.Status="Approved" and EXTRACT(MONTH FROM BookingTime)="${params.Month}" and EXTRACT(YEAR FROM BookingTime)="${params.Year}"; 
        `
    return mysqlQuery;
}

queryObj.selectScheduledStaff = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM Duty
            NATURAL JOIN Staff_Duty
            NATURAL JOIN Staff
            WHERE Duty.Day=${params.Day} and Duty.TimeSlot="${params.TimeSlot}";
        `
    return mysqlQuery;
}

queryObj.selectAvailableStaff = function(params) {
    const mysqlQuery = 
        `
            SELECT * FROM Staff
            WHERE Staff.StaffID NOT IN (SELECT StaffID FROM Staff_Duty WHERE Staff_Duty.DutyID="${params.DutyID}");
        `
    return mysqlQuery;
}

queryObj.selectPendingLeaveRequests = function(params) {
    const mysqlQuery = 
        `
            SELECT * From LeaveRequests
            NATURAL JOIN Staff
            NATURAL JOIN Duty
            WHERE Status="Pending";
        `
    return mysqlQuery;
}

queryObj.updateLeaveRequestStatus = function(params) {
    const mysqlQuery = 
        `
            UPDATE LeaveRequests
            SET Status="${params.Status}"
            WHERE RequestID="${params.RequestID}";
        `
    return mysqlQuery;
}

queryObj.updateStaffReplacement = function(params) {
    const mysqlQuery = 
        `
            UPDATE LeaveRequests
            SET AssignedStaffID="${params.AssignedStaffID}"
            WHERE RequestID="${params.RequestID}";
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

queryObj.insertFoodOrders = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO FoodOrders
            VALUES (${params.OrdersID}, "${params.OrderDate}", "${params.Type}", "${params.Menu}", ${params.Cost}, "${params.BookedQuantity}", "${params.Status}");
        `
    return mysqlQuery;
}

queryObj.insertFoodBooking = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO FoodBooking
            VALUES (${params.BookingID}, "${params.BookingTime}", "${params.Status}", ${params.Quantity}, "${params.PaymentMethod}", "${params.Mobile}", "${params.Address}");
        `
    return mysqlQuery;
}

queryObj.insertUser_FoodBooking = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO User_FoodBooking
            VALUES ("${params.CollegeID}", ${params.BookingID});
        `
    return mysqlQuery;
}

queryObj.insertFoodOrders_FoodBooking = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO FoodOrders_FoodBooking
            VALUES (${params.OrdersID}, ${params.BookingID});
        `
    return mysqlQuery;
}

queryObj.insertBill = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO Bill
            VALUES (${params.InvoiceNumber}, "${params.InvoiceDate}", "${params.Product}", ${params.Quantity}, ${params.Cost});
        `
    return mysqlQuery;
}

queryObj.insertUser_Bill = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO User_Bill
            VALUES ("${params.CollegeID}", ${params.InvoiceNumber});
        `
    return mysqlQuery;
}

queryObj.insertRoomBooking_Bill = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO RoomBooking_Bill
            VALUES (${params.BookingID}, ${params.InvoiceNumber});
        `
    return mysqlQuery;
}

queryObj.insertFoodBooking_Bill = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO FoodBooking_Bill
            VALUES (${params.BookingID}, ${params.InvoiceNumber});
        `
    return mysqlQuery;
}

queryObj.insertExpenditure = function(params) {
    const mysqlQuery =
        `
            INSERT INTO Expenditure
            VALUES ("${params.ExpenditureID}", "${params.Description}", "${params.Amount}", "${params.Date}")
        `
    return mysqlQuery;
}

queryObj.insertNewLeaveRequest = function(params) {
    const mysqlQuery = 
        `
            INSERT INTO LeaveRequests(RequestID, StaffID, DutyID, Date, RequestTime, Reason, Status)
            VALUES ("${params.RequestID}", "${params.StaffID}", "${params.DutyID}", "${params.Date}", "${params.RequestTime}", "${params.Reason}", "${params.Status}");
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
            UserType varchar(10) NOT NULL CHECK (UserType IN ("Admin", "Staff", "Student", "Gardener")),
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

const createFoodBookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS FoodBooking(
            BookingID int Primary KEY,
            BookingTime datetime NOT NULL,
            Status varchar(10) NOT NULL CHECK (Status IN ("Approved", "Rejected", "Pending")),
            Quantity int,
            PaymentMethod varchar(20) NOT NULL,
            Mobile char(10) NOT NULL,
            Address varchar(100) NOT NULL
        );
    `

const createFoodOrdersTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS FoodOrders(
            OrdersID int Primary Key,
            OrderDate date,
            Type varchar(10) CHECK (Type IN ("Breakfast", "Lunch", "Dinner")),
            Menu varchar(100),
            Cost int,
            BookedQuantity int,
            Status varchar(10) CHECK (Status IN ("Open", "Closed"))
        );
    `

const createBillTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Bill(
            InvoiceNumber int Primary Key,
            InvoiceDate date,
            Product varchar(50),
            Quantity int,
            Cost int
        );
    `

const createExpenditureTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Expenditure(
            ExpenditureID int Primary Key,
            Description varchar(200) NOT NULL,
            Amount int NOT NULL,
            Date date NOT NULL
        );
    `

const createStaffTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Staff(
            StaffID int Primary Key,
            Name varchar(30) NOT NULL,
            Age int NOT NULL,
            Email varchar(30) NOT NULL,
            Mobile char(10) NOT NULL,
            StaffType varchar(10) CHECK (StaffType IN ('Regular', 'Contract')),
            JobTitle varchar(20) CHECK (JobTitle IN ('HouseKeeper', 'Receptionist', 'Security', 'Cook'))
        );
    `

const createDutyTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Duty(
            DutyID int Primary Key,
            Day int CHECK (Day IN (1,2,3,4,5,6,7)), 
            TimeSlot varchar(10) CHECK (TimeSlot IN ('Morning', 'Evening'))
        );
    `

const createLeaveRequestsTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS LeaveRequests(
            RequestID int Primary Key,
            StaffID int NOT NULL,
            DutyID int NOT NULL,
            Date date NOT NULL,
            RequestTime datetime NOT NULL,
            Reason varchar(100),
            Status varchar(10) CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
            AssignedStaffID int,
            CONSTRAINT LeaveRequests_fk1 FOREIGN KEY (StaffID) references Staff(StaffID),
            CONSTRAINT LeaveRequests_fk2 FOREIGN KEY (DutyID) references Duty(DutyID),
            CONSTRAINT LeaveRequests_fk3 FOREIGN KEY (AssignedStaffID) references Staff(StaffID)
        );
    ` 

const createIDGeneratorTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS IDGenerator(
            TableName varchar(20) Primary Key,
            ID int
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

const createUser_FoodBookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS User_FoodBooking(
            CollegeID varchar(20),
            BookingID int,
            CONSTRAINT User_FoodBooking_fk1 FOREIGN KEY (CollegeID) references User(CollegeID),
            CONSTRAINT User_FoodBooking_fk2 FOREIGN KEY (BookingID) references FoodBooking(BookingID),
            PRIMARY KEY (CollegeID, BookingID)
        );
    `

const createFoodOrders_FoodBookingTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS FoodOrders_FoodBooking(
            OrdersID int,
            BookingID int,
            CONSTRAINT FoodOrders_FoodBooking_fk1 FOREIGN KEY (OrdersID) references FoodOrders(OrdersID),
            CONSTRAINT FoodOrders_FoodBooking_fk2 FOREIGN KEY (BookingID) references FoodBooking(BookingID),
            PRIMARY KEY (OrdersID, BookingID)
        );
    `

const createUser_BillTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS User_Bill(
            CollegeID varchar(20),
            InvoiceNumber int,
            CONSTRAINT User_Bill_fk1 FOREIGN KEY (CollegeID) references User(CollegeID),
            CONSTRAINT User_Bill_fk2 FOREIGN KEY (InvoiceNumber) references Bill(InvoiceNumber),
            PRIMARY KEY (CollegeID, InvoiceNumber)
        );
    `

const createRoomBooking_BillTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS RoomBooking_Bill(
            BookingID int,
            InvoiceNumber int,
            CONSTRAINT RoomBooking_Bill_fk1 FOREIGN KEY (BookingID) references Booking(BookingID),
            CONSTRAINT RoomBooking_Bill_fk2 FOREIGN KEY (InvoiceNumber) references Bill(InvoiceNumber),
            PRIMARY KEY (BookingID, InvoiceNumber)
        );
    `

const createFoodBooking_BillTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS FoodBooking_Bill(
            BookingID int,
            InvoiceNumber int,
            CONSTRAINT FoodBooking_Bill_fk1 FOREIGN KEY (BookingID) references FoodBooking(BookingID),
            CONSTRAINT FoodBooking_Bill_fk2 FOREIGN KEY (InvoiceNumber) references Bill(InvoiceNumber),
            PRIMARY KEY (BookingID, InvoiceNumber)
        );
    `

const createStaff_DutyTableQuery = 
    `
        CREATE TABLE IF NOT EXISTS Staff_Duty(
            StaffID int,
            DutyID int,
            CONSTRAINT Staff_Duty_fk1 FOREIGN KEY (StaffID) references Staff(StaffID),
            CONSTRAINT Staff_Duty_fk2 FOREIGN KEY (DutyID) references Duty(DutyID),
            PRIMARY KEY (StaffID, DutyID)
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
            SET num=0;
            SELECT COUNT(*) INTO num FROM User WHERE UserType="Gardener";
            IF num=0 THEN
                insertionLoop: LOOP
                    IF num>= 30 THEN 
                        LEAVE insertionLoop;
                    END IF;
                    INSERT INTO User VALUES (CONCAT("G", num+1), "Gardener", CONCAT("Gardener_NAME", num+1), CONCAT(CONCAT("Gardener_NAME", num+1), "_", CONCAT("G", num+1), "@iitp.ac.in"), LEFT(MD5(RAND()), 10));
                    SET num = num + 1;
                END LOOP;
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

const createInsertDutiesProcedure = 
    `
        CREATE PROCEDURE InsertDuties()
        BEGIN
            DECLARE num int default 0;
            SELECT COUNT(*) INTO num FROM Duty;
            IF num=0 THEN
                SET num = num + 1;
                insertionLoop: LOOP
                    IF num<=7 THEN 
                        INSERT INTO Duty VALUES (num, num, 'Morning');
                    ELSEIF num<=14 THEN 
                        INSERT INTO Duty VALUES (num, num-7, 'Evening');
                    ELSE
                        LEAVE insertionLoop;
                    END IF;
                    SET num = num + 1;
                END LOOP;
            END IF;
        END
    `

const createInsertStaffsProcedure = 
    `
        CREATE PROCEDURE InsertStaffs()
        BEGIN
            DECLARE num int default 0;
            SELECT COUNT(*) INTO num FROM Staff;
            IF num=0 THEN
                SET num = num + 1;
                insertionLoop: LOOP
                    IF num<=6 THEN
                        INSERT INTO Staff VALUES (num, CONCAT("STAFF_NAME", num), 40, CONCAT("STAFF_NAME", num, "@iitp.ac.in"), "1111111111", "Regular", "HouseKeeper");
                    ELSEIF num<=12 THEN 
                        INSERT INTO Staff VALUES (num, CONCAT("STAFF_NAME", num), 40, CONCAT("STAFF_NAME", num, "@iitp.ac.in"), "1111111111", "Regular", "Receptionist");
                    ELSEIF num<=18 THEN 
                        INSERT INTO Staff VALUES (num, CONCAT("STAFF_NAME", num), 40, CONCAT("STAFF_NAME", num, "@iitp.ac.in"), "1111111111", "Contract", "Security");
                    ELSEIF num<=24 THEN 
                        INSERT INTO Staff VALUES (num, CONCAT("STAFF_NAME", num), 40, CONCAT("STAFF_NAME", num, "@iitp.ac.in"), "1111111111", "Contract", "Cook");
                    ELSE
                        LEAVE insertionLoop;
                    END IF;
                    SET num = num + 1;
                END LOOP;
            END IF;
        END
    `

const createStaffDutyScheduler = 
    `
        CREATE PROCEDURE StaffDutyScheduler()
        BEGIN
            DECLARE num int default 0;
            CALL InsertDuties();
            CALL InsertStaffs();
            SELECT COUNT(*) INTO num FROM Staff_Duty;
            IF num=0 THEN
                SET num=1;
                insertionLoop: LOOP
                    IF num<=5 THEN
                        INSERT INTO Staff_Duty VALUES (1, num);
                        INSERT INTO Staff_Duty VALUES (4, num);
                        INSERT INTO Staff_Duty VALUES (7, num);
                        INSERT INTO Staff_Duty VALUES (10, num);
                        INSERT INTO Staff_Duty VALUES (13, num);
                        INSERT INTO Staff_Duty VALUES (16, num);
                        INSERT INTO Staff_Duty VALUES (19, num);
                        INSERT INTO Staff_Duty VALUES (22, num);
                    ELSEIF num<=10 THEN 
                        INSERT INTO Staff_Duty VALUES (2, num);
                        INSERT INTO Staff_Duty VALUES (5, num);
                        INSERT INTO Staff_Duty VALUES (8, num);
                        INSERT INTO Staff_Duty VALUES (11, num);
                        INSERT INTO Staff_Duty VALUES (14, num);
                        INSERT INTO Staff_Duty VALUES (17, num);
                        INSERT INTO Staff_Duty VALUES (20, num);
                        INSERT INTO Staff_Duty VALUES (23, num);
                    ELSEIF num<=14 THEN
                        INSERT INTO Staff_Duty VALUES (3, num);
                        INSERT INTO Staff_Duty VALUES (6, num);
                        INSERT INTO Staff_Duty VALUES (9, num);
                        INSERT INTO Staff_Duty VALUES (12, num);
                        INSERT INTO Staff_Duty VALUES (15, num);
                        INSERT INTO Staff_Duty VALUES (18, num);
                        INSERT INTO Staff_Duty VALUES (21, num);
                        INSERT INTO Staff_Duty VALUES (24, num);
                    ELSE
                        LEAVE insertionLoop;
                    END IF;
                    SET num = num + 1;
                END LOOP;
            END IF;
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
    createFoodBookingTableQuery,
    createFoodOrdersTableQuery,
    createBillTableQuery,
    createExpenditureTableQuery,
    createStaffTableQuery,
    createDutyTableQuery,
    createLeaveRequestsTableQuery,
    createIDGeneratorTableQuery,
    createUser_BookingTableQuery,
    createRoom_BookingTableQuery,
    createGuest_BookingTableQuery,
    createUser_FoodBookingTableQuery,
    createFoodOrders_FoodBookingTableQuery,
    createUser_BillTableQuery,
    createRoomBooking_BillTableQuery,
    createFoodBooking_BillTableQuery,
    createStaff_DutyTableQuery,
    'DROP PROCEDURE IF EXISTS InsertRoom;',
    createProcedureInsertRoomQuery,
    'CALL InsertRoom();',
    'DROP PROCEDURE IF EXISTS InsertUser;',
    createProcedureInsertUserQuery,
    'CALL InsertUser();',
    'DROP PROCEDURE IF EXISTS InsertBookingRelations',
    createInsertBookingRelationsProcedure,
    'DROP FUNCTION IF EXISTS GetID',
    createGetIDFunction,
    'DROP PROCEDURE IF EXISTS InsertDuties;',
    createInsertDutiesProcedure,
    'DROP PROCEDURE IF EXISTS InsertStaffs;',
    createInsertStaffsProcedure,
    'DROP PROCEDURE IF EXISTS StaffDutyScheduler;',
    createStaffDutyScheduler,
    'CALL StaffDutyScheduler()'
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
