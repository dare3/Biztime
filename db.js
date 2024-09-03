const { Client } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL || "postgresql:///biztime";

const client = new Client({
  connectionString,
});

client.connect((err) => {
  if (err) {
    console.error("Failed to connect to the database:", err.stack);
  } else {
    console.log("Connected to the database.");
  }
});

process.on("exit", () => {
  client.end(() => {
    console.log("Disconnected from the database.");
  });
});

module.exports = client;
