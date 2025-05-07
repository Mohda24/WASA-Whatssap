// Add these to your database module
export function recordMessage(hour, db) {
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const stmt = db.prepare(`
        INSERT INTO message_stats (date, hour, count) 
        VALUES (?, ?, 1)
        ON CONFLICT(date, hour) DO UPDATE SET 
        count = count + 1,
        updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(date, hour);
}

export function getHourlyStats(lastNHours = 24, db) {
    const date = new Date().toISOString().split('T')[0]; // Get current date
    return db.prepare(`
        SELECT hour, count 
        FROM message_stats 
        WHERE date = ?
        ORDER BY hour ASC 
        LIMIT ?
    `).all(date, lastNHours);
}

export function resetHourlyStats(db) {
    db.prepare('DELETE FROM message_stats').run();
    console.log('Hourly stats have been reset.');
}