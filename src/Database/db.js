// src/database/db.js
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// Ensure db folder exists
const dbPath = path.join(__dirname, '../appData', 'db')
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath)
}

const db = new Database(path.join(dbPath, 'users.db'))

// Create table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run()

module.exports = db