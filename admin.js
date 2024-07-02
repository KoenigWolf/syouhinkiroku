document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminUsernameInput = document.getElementById('admin-username');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminSection = document.getElementById('admin-section');
    const adminDataSection = document.getElementById('admin-data-section');
    const adminSalesTableBody = document.querySelector('#admin-sales-table tbody');
    const userSalesSummaryTableBody = document.querySelector('#user-sales-summary-table tbody');
    const salesRankingTableBody = document.querySelector('#sales-ranking-table tbody');
    const expensesTableBody = document.querySelector('#expenses-table tbody');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const salaryForm = document.getElementById('salary-form');
    const salaryUsernameInput = document.getElementById('salary-username');
    const salaryAmountInput = document.getElementById('salary-amount');
    const expenseForm = document.getElementById('expense-form');
    const expenseUsernameInput = document.getElementById('expense-username');
    const expenseTypeInput = document.getElementById('expense-type');
    const expenseAmountInput = document.getElementById('expense-amount');

    // ユーザーごとの給料情報
    let userSalaries = JSON.parse(localStorage.getItem('userSalaries')) || {};
    // ユーザーごとの経費情報
    let userExpenses = JSON.parse(localStorage.getItem('userExpenses')) || {};

    // 数値をカンマ区切りにフォーマットする関数
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 管理者ログイン処理
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const adminUsername = adminUsernameInput.value.trim();
        const adminPassword = adminPasswordInput.value;

        // シンプルな認証（本番環境ではより強力な認証方法を使用することを推奨）
        if (adminUsername === 'admin' && adminPassword === 'admin123') {
            localStorage.setItem('loggedInAdmin', adminUsername);
            adminLoginForm.style.display = 'none';
            adminDataSection.style.display = 'block';
            loadAllUserSalesRecords();
            displayUserSalesSummary();
            displaySalesRanking();
            displayExpenses();
        } else {
            alert('管理者名またはパスワードが間違っています。');
        }
    });

    // ログアウト処理
    adminLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInAdmin');
        adminLoginForm.style.display = 'block';
        adminDataSection.style.display = 'none';
        adminLoginForm.reset();
    });

    // 給料設定処理
    salaryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = salaryUsernameInput.value.trim();
        const salary = parseInt(salaryAmountInput.value);

        userSalaries[username] = salary;
        localStorage.setItem('userSalaries', JSON.stringify(userSalaries));
        alert(`ユーザー ${username} の給料を ${formatNumber(salary)} 円に設定しました。`);

        salaryForm.reset();
        displayExpenses();
    });

    // 経費登録処理
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = expenseUsernameInput.value.trim();
        const expenseType = expenseTypeInput.value;
        const expenseAmount = parseInt(expenseAmountInput.value);

        if (!userExpenses[username]) {
            userExpenses[username] = [];
        }

        userExpenses[username].push({ type: expenseType, amount: expenseAmount });
        localStorage.setItem('userExpenses', JSON.stringify(userExpenses));
        alert(`ユーザー ${username} に ${expenseType} の経費 ${formatNumber(expenseAmount)} 円を追加しました。`);

        expenseForm.reset();
        displayExpenses();
    });

    // 全ユーザーの販売記録を表示
    const loadAllUserSalesRecords = () => {
        adminSalesTableBody.innerHTML = '';
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sales_')) {
                const username = key.replace('sales_', '');
                const userSalesRecords = JSON.parse(localStorage.getItem(key)) || [];
                userSalesRecords.forEach((record, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${username}</td>
                        <td>${record.productName}</td>
                        <td>${formatNumber(record.salesAmount)}</td>
                        <td>${record.timestamp}</td>
                        <td>
                            <button onclick="deleteAdminRecord('${username}', ${index})">削除</button>
                        </td>
                    `;
                    adminSalesTableBody.appendChild(row);
                });
            }
        });
    };

    // 販売記録の削除
    window.deleteAdminRecord = (username, index) => {
        const userSalesKey = `sales_${username}`;
        let userSalesRecords = JSON.parse(localStorage.getItem(userSalesKey)) || [];
        userSalesRecords.splice(index, 1);
        localStorage.setItem(userSalesKey, JSON.stringify(userSalesRecords));
        loadAllUserSalesRecords();
        displayUserSalesSummary();
        displaySalesRanking();
        displayExpenses();
    };

    // ユーザーごとの月次売上金額を表示
    const displayUserSalesSummary = () => {
        userSalesSummaryTableBody.innerHTML = '';
        const userMonthlySales = {};

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sales_')) {
                const username = key.replace('sales_', '');
                const userSalesRecords = JSON.parse(localStorage.getItem(key)) || [];
                userSalesRecords.forEach(record => {
                    const date = new Date(record.timestamp);
                    const month = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2); // YYYY-MM形式

                    if (!userMonthlySales[username]) {
                        userMonthlySales[username] = {};
                    }
                    if (!userMonthlySales[username][month]) {
                        userMonthlySales[username][month] = 0;
                    }

                    userMonthlySales[username][month] += parseInt(record.salesAmount);
                });
            }
        });

        for (const [username, monthlySales] of Object.entries(userMonthlySales)) {
            for (const [month, totalSales] of Object.entries(monthlySales)) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${username}</td>
                    <td>${month}</td>
                    <td>${formatNumber(totalSales)}</td>
                `;
                userSalesSummaryTableBody.appendChild(row);
            }
        }
    };

    // 売上ランキングを表示
    const displaySalesRanking = () => {
        salesRankingTableBody.innerHTML = '';
        const userTotalSales = {};

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sales_')) {
                const username = key.replace('sales_', '');
                const userSalesRecords = JSON.parse(localStorage.getItem(key)) || [];
                const totalSales = userSalesRecords.reduce((sum, record) => sum + parseInt(record.salesAmount), 0);
                userTotalSales[username] = totalSales;
            }
        });

        const sortedUsers = Object.entries(userTotalSales).sort((a, b) => b[1] - a[1]);

        sortedUsers.forEach(([username, totalSales], index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${username}</td>
                <td>${formatNumber(totalSales)}</td>
            `;
            salesRankingTableBody.appendChild(row);
        });
    };

    // 経費と損益分岐点を表示
    const displayExpenses = () => {
        expensesTableBody.innerHTML = '';
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sales_')) {
                const username = key.replace('sales_', '');
                const userSalesRecords = JSON.parse(localStorage.getItem(key)) || [];
                const totalSales = userSalesRecords.reduce((sum, record) => sum + parseInt(record.salesAmount), 0);
                const salary = userSalaries[username] || 0;
                const expenses = (userExpenses[username] || []).reduce((sum, expense) => sum + expense.amount, 0) + salary;
                const breakEvenPoint = totalSales - expenses;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${username}</td>
                    <td>${formatNumber(salary)}</td>
                    <td>${formatNumber(expenses)}</td>
                    <td>${formatNumber(breakEvenPoint)}</td>
                `;
                expensesTableBody.appendChild(row);
            }
        });
    };

    // 初期表示時にログイン状態をチェック
    const loggedInAdmin = localStorage.getItem('loggedInAdmin');
    if (loggedInAdmin === 'admin') {
        adminLoginForm.style.display = 'none';
        adminDataSection.style.display = 'block';
        loadAllUserSalesRecords();
        displayUserSalesSummary();
        displaySalesRanking();
        displayExpenses();
    } else {
        adminLoginForm.style.display = 'block';
        adminDataSection.style.display = 'none';
    }
});
