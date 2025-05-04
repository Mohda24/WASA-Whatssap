import path from 'path'
import fs from 'fs'
import { app } from 'electron'
const Database = require('better-sqlite3')

let db

export function initDatabase() {
    const userDataPath = app.getPath('userData')
    const dbFolderPath = path.join(userDataPath, 'db')

    if (!fs.existsSync(dbFolderPath)) {
        fs.mkdirSync(dbFolderPath, { recursive: true })
    }

    const dbPath = path.join(dbFolderPath, 'users.db')
    db = new Database(dbPath)

    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run()
    // Add this alongside your existing table creation
    db.prepare(`
        CREATE TABLE IF NOT EXISTS message_stats (
            hour TEXT PRIMARY KEY,  -- e.g. "14H" for 2 PM
            count INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
  // stats table for daily statistics 
    db.prepare(`
        CREATE TABLE IF NOT EXISTS daily_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            total_messages INTEGER DEFAULT 0,
            conversion_count INTEGER DEFAULT 0,
            UNIQUE(date)
        )
    `).run();

    return db
}

export function getDb() {
    if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
    return db
}
