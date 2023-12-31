const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const dbPath = './data/expenses.db';
const db = new sqlite3.Database(dbPath);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('static'));

// Create the expenses table if it doesn't exist
db.run("CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, amount REAL, label TEXT, datetime TEXT, active INTEGER DEFAULT 1)");

function formatChileanPeso(amount) {
    return "$" + parseInt(amount).toLocaleString('es-CL');
}

function formatDateToDDMMYYYY(datetime) {
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


app.get('/', (req, res) => {
    db.all("SELECT DISTINCT label FROM expenses", [], (err, labels) => {
        if (err) {
            throw err;
        }
        db.all("SELECT * FROM expenses WHERE active = 1", [], (err, expenses) => {
            if (err) {
                throw err;
            }
            const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
            res.render('index', { 
                expenses: expenses, 
                totalExpense: totalExpense, 
                labels: labels,
                formatChileanPeso: formatChileanPeso,
                formatDateToDDMMYYYY: formatDateToDDMMYYYY
            });
        });
    });
});

app.get('/all-entries', (req, res) => {
    const query = `
        WITH MonthlySums AS (
            SELECT strftime('%Y-%m', datetime) as year_month, 
                   SUM(amount) as totalAmount,
                   NULL as id, NULL as amount, NULL as label, NULL as datetime, NULL as active
            FROM expenses 
            WHERE active = 1 
            GROUP BY year_month
        )
        SELECT year_month, totalAmount, id, amount, label, datetime, active 
        FROM (
            SELECT strftime('%Y-%m', datetime) as year_month, 
                   NULL as totalAmount, 
                   id, amount, label, datetime, active
            FROM expenses 
            WHERE active = 1
            UNION ALL
            SELECT * FROM MonthlySums
        )
        ORDER BY year_month DESC, datetime DESC, id DESC;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render('allEntries.ejs', {
            expenses: rows,
            formatDateToDDMMYYYY: formatDateToDDMMYYYY
        });
    });
});




app.post('/add', (req, res) => {
    let { amount, label } = req.body;
    amount = parseFloat(amount.replace(/[^\d]/g, ""));
    const datetime = new Date().toISOString();
    db.run("INSERT INTO expenses (amount, label, datetime, active) VALUES (?, ?, ?, 1)", [amount, label, datetime], (err) => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect('/');
    });
});

app.delete('/delete/:id', (req, res) => {
    const expenseId = req.params.id;
    db.run("UPDATE expenses SET active = 0 WHERE id = ?", [expenseId], (err) => {
        if (err) {
            return console.error(err.message);
        }
        res.sendStatus(200);
    });
});


app.get('/quick-stats', (req, res) => {
    // SQL queries to fetch Largest Expense and Average Daily Spending grouped by Year-Month
    const largestExpenseQuery = `
        SELECT strftime('%Y-%m', datetime) as year_month, 
               MAX(amount) as largest 
        FROM expenses 
        WHERE active = 1 
        GROUP BY year_month 
        ORDER BY year_month DESC`;

    const avgDailyExpenseQuery = `
        SELECT strftime('%Y-%m', datetime) as year_month, 
               AVG(amount) as average 
        FROM expenses 
        WHERE active = 1 
        GROUP BY year_month 
        ORDER BY year_month DESC`;

    db.all(largestExpenseQuery, [], (err, largestData) => {
        if (err) {
            throw err;
        }
        db.all(avgDailyExpenseQuery, [], (err, avgData) => {
            if (err) {
                throw err;
            }
            res.render('quickStats.ejs', {
                largestExpenses: largestData,
                avgDailyExpenses: avgData
            });
        });
    });
});


app.get('/data-visualization', (req, res) => {
    // SQL query for Monthly Trends
    const query = `
        SELECT strftime('%Y-%m', datetime) as year_month, 
               SUM(amount) as totalAmount
        FROM expenses 
        GROUP BY year_month 
        ORDER BY year_month ASC
    `;

    // SQL query for Category Breakdown
    const categoryBreakdownQuery = `
        SELECT label, SUM(amount) as total 
        FROM expenses 
        WHERE active = 1 
        GROUP BY label`;

    // Execute the Monthly Trends query
    db.all(query, [], (err, trends) => {
        if (err) {
            throw err;
        }

        // Inside the callback, execute the Category Breakdown query
        db.all(categoryBreakdownQuery, [], (err, categoriesData) => {
            if (err) {
                throw err;
            }

            // Render the visualizacionDatos.ejs with both datasets
            res.render('data-visualization.ejs', {
                trends: trends,
                categoriesData: categoriesData
            });
        });
    });
});




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
