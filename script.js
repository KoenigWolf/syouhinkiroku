document.addEventListener('DOMContentLoaded', () => {
    const productData = [
        { name: "浄水器", price: 300000 },
        { name: "外壁塗装", price: 500000 },
        { name: "太陽光", price: 1000000 },
        { name: "蓄電池", price: 500000 },
        { name: "エコキュート交換", price: 300000 },
        { name: "カーポート", price: 100000 },
        { name: "ウッドデッキ", price: 200000 },
        { name: "外構", price: 100000 },
        { name: "浄水器（本体）", price: 114350 },
        { name: "浄水器（カバー）", price: 27000 }
    ];

    const loginSection = document.getElementById('login-section');
    const salesSection = document.getElementById('sales-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const newUsernameInput = document.getElementById('new-username');
    const newPasswordInput = document.getElementById('new-password');
    const form = document.getElementById('sales-form');
    const productNameSelect = document.getElementById('product-name');
    const salesTableBody = document.querySelector('#sales-table tbody');
    const exportBtn = document.getElementById('export-btn');
    const logoutBtn = document.getElementById('logout-btn');

    let currentUser = null;
    let salesRecords = [];

    // ローカルストレージからユーザーの販売記録を読み込む
    const loadSalesRecords = () => {
        if (currentUser) {
            salesRecords = JSON.parse(localStorage.getItem(currentUser)) || [];
            displaySalesRecords();
        }
    };

    // 販売記録をテーブルに表示する
    const displaySalesRecords = () => {
        salesTableBody.innerHTML = '';
        salesRecords.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.productName}</td>
                <td>${record.salesAmount}</td>
                <td>${record.timestamp}</td>
                <td>
                    <button onclick="deleteRecord(${index})">削除</button>
                </td>
            `;
            salesTableBody.appendChild(row);
        });
    };

    // ログイン処理
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const storedUser = JSON.parse(localStorage.getItem(`user_${username}`));

        if (storedUser && storedUser.password === password) {
            currentUser = `sales_${username}`;
            loginSection.style.display = 'none';
            salesSection.style.display = 'block';
            loadSalesRecords();
        } else {
            alert('ユーザー名またはパスワードが間違っています。');
        }
    });

    // ユーザー登録処理
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = newUsernameInput.value.trim();
        const password = newPasswordInput.value;

        if (localStorage.getItem(`user_${username}`)) {
            alert('このユーザー名はすでに登録されています。');
        } else {
            localStorage.setItem(`user_${username}`, JSON.stringify({ username, password }));
            alert('ユーザー登録が完了しました。');
            registerForm.reset();
        }
    });

    // ログアウト処理
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        salesRecords = [];
        loginSection.style.display = 'block';
        salesSection.style.display = 'none';
    });

    // 商品リストをドロップダウンに追加する
    productData.forEach(product => {
        const option = document.createElement('option');
        option.value = product.price;
        option.textContent = product.name;
        productNameSelect.appendChild(option);
    });

    // フォーム送信時に販売記録を追加する
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const productName = productNameSelect.options[productNameSelect.selectedIndex].text;
        const salesAmount = productNameSelect.value;
        const timestamp = new Date().toLocaleString();

        const newRecord = { productName, salesAmount, timestamp };
        salesRecords.push(newRecord);

        // ローカルストレージに保存
        localStorage.setItem(currentUser, JSON.stringify(salesRecords));

        // フォームをリセット
        form.reset();

        // 販売記録を再表示
        displaySalesRecords();
    });

    // CSVとしてエクスポートする
    exportBtn.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,商品名,販売金額（円）,記録日時\n";
        salesRecords.forEach(record => {
            csvContent += `${record.productName},${record.salesAmount},${record.timestamp}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'sales_records.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 販売記録の削除
    window.deleteRecord = (index) => {
        salesRecords.splice(index, 1);
        localStorage.setItem(currentUser, JSON.stringify(salesRecords));
        displaySalesRecords();
    };

    // 初期表示
    if (currentUser) {
        loadSalesRecords();
        loginSection.style.display = 'none';
        salesSection.style.display = 'block';
    } else {
        loginSection.style.display = 'block';
        salesSection.style.display = 'none';
    }
});
