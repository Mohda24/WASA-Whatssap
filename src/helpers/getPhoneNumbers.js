function getPhoneNumbers(page, limit, db, filters = {}) {
    try {
        let query = 'SELECT * FROM users WHERE 1=1'
        const params = []

        const { startDate, endDate, month } = filters

        if (startDate && endDate) {
            query += ' AND DATE(created_at) >= DATE(?) AND DATE(created_at) <= DATE(?)'
            params.push(startDate, endDate)
        } else if (month) {
            const [year, monthNum] = month.split('-')
            const startOfMonth = `${year}-${monthNum}-01`
            const endOfMonth = new Date(year, parseInt(monthNum), 0).toISOString().split('T')[0]
            query += ' AND DATE(created_at) >= DATE(?) AND DATE(created_at) <= DATE(?)'
            params.push(startOfMonth, endOfMonth)
        }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total')
        const totalResult = db.prepare(countQuery).get(...params)
        const total = totalResult.total

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.push(limit, (page - 1) * limit)

        const numbers = db.prepare(query).all(...params)

        return {
            numbers,
            total
        }
    } catch (error) {
        console.error('Error getting phone numbers:', error)
        return {
            numbers: [],
            total: 0
        }
    }
}

export { getPhoneNumbers }
