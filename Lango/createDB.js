// Globals
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system

const dbFileName = "Flashcards.db";
// makes the object that represents the database in our code
const db = new sqlite3.Database(dbFileName);  // object, not database.

// Initialize table.
// If the table already exists, causes an error.
// Fix the error by removing or renaming Flashcards.db
const cmdStr = 		'CREATE TABLE flashcard (userId varchar(255), english varchar(255), translation varchar(255), timesOfShown INT, timesOfCorrect INT, UNIQUE(userId, english))';
db.run(cmdStr,tableCreationCallback);
const createUserTable = 'CREATE TABLE user (userId varchar(255), givenName varchar(255), familyName varchar(255), PRIMARY KEY (userId))';
db.run(createUserTable);

// Always use the callback for database operations and print out any
// error messages you get.
// This database stuff is hard to debug, give yourself a fighting chance.
function tableCreationCallback(err) {
    if (err) {
	console.log("Table creation error",err);
    } else {
	console.log("Database created");
	db.close();
    }
}
