export function setBotStatus(db, enabled) {
    try {
        const stmt = db.prepare(`
            UPDATE bot_settings 
            SET bot_enabled = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = 1
        `);
        const result = stmt.run(enabled ? 1 : 0);
        console.log('Bot status updated:', result ? 'Enabled' : 'Disabled');
        return { success: true, changes: result.changes };
    } catch (error) {
        console.error('Error setting bot status:', error);
        return { success: false, error: error.message };
    }
}



export function getBotStatus(db) {
    try {
        const stmt = db.prepare('SELECT bot_enabled FROM bot_settings WHERE id = 1');
        const result = stmt.get();
        console.log('Bot status retrieved Ahmed:', result);
        return result ? result.bot_enabled === 1 : true;
    } catch (error) {
        console.error('Error getting bot status:', error);
        return true; // Default to enabled
    }
}