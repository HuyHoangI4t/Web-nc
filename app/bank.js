// Danh sách ngân hàng & ví (logo mock)
const logos = [
    { id: "acb", name: "ACB", file: "ACB.png" },
    { id: "agribank", name: "Agribank", file: "Argibank.png" },
    { id: "bidv", name: "BIDV", file: "Bidv.png" },
    { id: "mbbank", name: "MB Bank", file: "MB Bank.png" },
    { id: "techcombank", name: "Techcombank", file: "Techcombank.png" },
    { id: "tpbank", name: "TPBank", file: "TPBank.png" },
    { id: "vietcombank", name: "Vietcombank", file: "Vietcombank.png" },
    { id: "vietinbank", name: "VietinBank", file: "VietinBank.png" }
];

// State: các ngân hàng đã liên kết
let linkedAccounts = [];

// Load grid logo
const grid = document.getElementById("bankGrid");
logos.forEach(bank => {
    const div = document.createElement("div");
    div.className = "bank-option";
    div.title = bank.name;
    div.onclick = () => connectBank(bank);

    const img = document.createElement("img");
    img.src = "Vietnam Bank & Mobile Wallet Logos/" + bank.file;
    img.alt = bank.name;

    div.appendChild(img);
    grid.appendChild(div);
});

// Thêm ngân hàng
function connectBank(bank) {
    if (linkedAccounts.find(acc => acc.id === bank.id)) {
        alert(`${bank.name} đã được liên kết rồi.`);
        return;
    }

    const newAcc = {
        ...bank,
        accountNumber: "**** **** **** " + Math.floor(1000 + Math.random() * 9000),
        balance: Math.floor(Math.random() * 100000)
    };

    linkedAccounts.push(newAcc);
    renderLinkedAccounts();
}

// Render danh sách đã liên kết
function renderLinkedAccounts() {
    const list = document.querySelector(".bank-list");
    list.innerHTML = "";

    linkedAccounts.forEach(acc => {
        const div = document.createElement("div");
        div.className = "bank-item connected";

        div.innerHTML = `
            <div class="bank-info">
                <div class="bank-logo">
                    <img src="Vietnam Bank & Mobile Wallet Logos/${acc.file}" alt="${acc.name}">
                </div>
                <div class="bank-details">
                    <div class="bank-name">${acc.name}</div>
                    <div class="account-number">${acc.accountNumber}</div>
                    <div class="account-balance">${acc.balance.toLocaleString("vi-VN")} ₫</div>
                </div>
            </div>
            <div class="bank-actions">
                <button class="btn btn-sm btn-outline" onclick="syncBank('${acc.id}')">
                    <i class="fas fa-sync"></i> Đồng bộ
                </button>
                <button class="btn btn-sm btn-danger" onclick="disconnectBank('${acc.id}')">
                    <i class="fas fa-unlink"></i> Ngắt kết nối
                </button>
            </div>
        `;

        list.appendChild(div);
    });
}

// Ngắt kết nối
function disconnectBank(id) {
    linkedAccounts = linkedAccounts.filter(acc => acc.id !== id);
    renderLinkedAccounts();
}

// Đồng bộ số dư (giả lập)
function syncBank(id) {
    const acc = linkedAccounts.find(a => a.id === id);
    if (acc) {
        acc.balance = Math.floor(Math.random() * 100000);
        renderLinkedAccounts();
    }
}
