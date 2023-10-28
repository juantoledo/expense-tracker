const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./expenses.db');

// Create the expenses table
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, label TEXT, amount INTEGER, datetime TEXT, active INTEGER)");

    // Insert test data
    const stmt = db.prepare("INSERT INTO expenses (label, amount, datetime, active) VALUES (?, ?, ?, ?)");

    stmt.run('Food', 5000, '2023-09-01 12:00:00', 1);
    stmt.run('Transport', 2000, '2023-09-02 14:00:00', 1);
    stmt.run('Entertainment', 10000, '2023-09-05 16:00:00', 1);
    stmt.run('Food', 3000, '2023-09-06 13:00:00', 1);
    stmt.run('Utilities', 15000, '2023-10-01 12:00:00', 1);
    stmt.run('Rent', 500000, '2023-10-01 09:00:00', 1);
    stmt.run('Food', 4500, '2023-10-02 13:30:00', 1);
    stmt.run('Transport', 2100, '2023-10-02 15:00:00', 1);

    stmt.finalize();
});

db.close();
