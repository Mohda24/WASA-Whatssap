export function checkNumberExists(number,db) {
    try {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE phone = ?')
        const result = stmt.get(number)
        return result.count > 0
    } catch (error) {
        console.error('Error checking phone number:', error)
        return false
    }
}