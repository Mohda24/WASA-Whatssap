export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

export const ensureTodayStats = (db) => {
    const today = getTodayDate();
    const exists = db.prepare('SELECT id FROM daily_stats WHERE date = ?').get(today);
    
    if (!exists) {
        db.prepare('INSERT INTO daily_stats (date, total_messages, conversion_count) VALUES (?, 0, 0)').run(today);
    }
};

export const incrementTotalMessages = (db) => {
    const today = getTodayDate();
    ensureTodayStats(db);
    
    db.prepare(`
        UPDATE daily_stats 
        SET total_messages = total_messages + 1 
        WHERE date = ?
    `).run(today);
};

export const incrementConversionCount = (db) => {
    const today = getTodayDate();
    ensureTodayStats(db);
    
    db.prepare(`
        UPDATE daily_stats 
        SET conversion_count = conversion_count + 1 
        WHERE date = ?
    `).run(today);
};

export const getDailyStats = (db, days = 7) => {
    return db.prepare(`
        SELECT 
            date,
            total_messages,
            conversion_count,
            CASE 
                WHEN total_messages > 0 
                THEN ROUND(CAST(conversion_count AS FLOAT) / total_messages * 100) 
                ELSE 0 
            END as conversion_rate
        FROM daily_stats 
        ORDER BY date DESC 
        LIMIT ?
    `).all(days);
};

export const resetStats = (db) => {
    db.prepare('DELETE FROM daily_stats').run();
    console.log('Daily stats have been reset.');
}