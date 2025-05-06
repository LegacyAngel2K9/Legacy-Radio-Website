const mysql = require('mysql2/promise');
require('dotenv').config();

async function initialize() {
  try {
    // Create connection to MySQL server
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log("Database created or already exists!");
    
    // Close the connection
    await connection.end();
    
    console.log("Database initialization completed!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Run initialization
initialize();
