const sqlite3 = require('sqlite3').verbose();
const dbPath = './data/expenses.db';
const db = new sqlite3.Database(dbPath);

function getRandomAmount(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

const labels = ["Groceries", "Transport", "Entertainment", "Utilities", "Rent", "Dining Out", "Electronics", "Health", "Travel"];

function getRandomLabel() {
    return labels[Math.floor(Math.random() * labels.length)];
}

function getRandomDate(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    return new Date(year, month - 1, day).toISOString();
}

// Seed the database with sample data
for (let i = 0; i < 500; i++) {
    const year = 2023 - Math.floor(Math.random() * 3); // Random year between 2021 and 2023
    const month = Math.floor(Math.random() * 12) + 1; // Random month between 1 and 12
    const amount = getRandomAmount(500, 10000); // Random amount between 500 and 10,000
    const label = getRandomLabel();
    const date = getRandomDate(year, month);
    
    db.run("INSERT INTO expenses (amount, label, datetime, active) VALUES (?, ?, ?, 1)", [amount, label, date], (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

console.log("Sample data has been inserted into the database.");
db.close();
