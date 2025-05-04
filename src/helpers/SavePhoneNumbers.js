


function savePhoneNumbers(numbers = [], db) {
    const insert = db.prepare('INSERT OR IGNORE INTO users (phone) VALUES (?)');
    const insertMany = db.transaction((list) => {
        for (const number of list) {
            insert.run(number);
        }
    });

    try {
        insertMany(numbers);
        return { success: true, count: numbers.length };
    } catch (err) {
        console.error('DB Insert Error:', err);
        return { success: false, error: err.message };
    }
}


function savePhoneNumber(number, db) {
    try {
        const stmt = db.prepare('INSERT INTO users (phone, created_at) VALUES (?, ?)')
        const now = new Date().toISOString()
        stmt.run(number, now)
        return true
    } catch (error) {
        console.error('Error saving phone number:', error)
        return false
    }
    throw error;
}

// Reset phone numbers in the database
function resetPhoneNumbers(db) {
    try {
        db.exec('DELETE FROM users')
        console.log('Phone numbers reset successfully')
        
    } catch (error) {
        console.error('Error resetting phone numbers:', error)
        
    }
}
// Reset Phone Number By ID
function resetPhoneNumberById(db, id) {
    try {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?')
        stmt.run(id)
        console.log(`Phone number with ID ${id} reset successfully`)
    } catch (error) {
        console.error(`Error resetting phone number with ID ${id}:`, error)
    }
}

export { savePhoneNumbers, savePhoneNumber, resetPhoneNumbers, resetPhoneNumberById };
