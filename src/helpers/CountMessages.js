// Add these to your database module
export function recordMessage(hour, db) {
    const stmt = db.prepare(`
        INSERT INTO message_stats (hour, count) 
        VALUES (?, 1)
        ON CONFLICT(hour) DO UPDATE SET 
        count = count + 1,
        updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(hour);
}

export function getHourlyStats(lastNHours = 24, db) {
    return db.prepare(`
        SELECT hour, count 
        FROM message_stats 
        ORDER BY updated_at DESC 
        LIMIT ?
    `).all(lastNHours);
}


export function resetHourlyStats(db) {
    db.prepare('DELETE FROM message_stats').run();
    console.log('Hourly stats have been reset.');
}