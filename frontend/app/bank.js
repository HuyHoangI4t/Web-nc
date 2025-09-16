const popularBanks = [
    "VCB",      // Vietcombank
    "BIDV",     // BIDV
    "VBA",      // Agribank
    "TCB",      // Techcombank
    "ACB",      // ACB
    "ICB",      // VietinBank
    "MB",       // MB Bank
    "VPB",      // VPBank
    "STB",      // Sacombank
    "SHB",      // SHB
    "HDB",      // HDBank
    "TPB",      // TPBank
    "VIB",      // VIB
    "LPB",      // LienVietPostBank
    "MSB"       // Maritime Bank
];

// Lấy toàn bộ danh sách ngân hàng từ VietQR
fetch("https://api.vietqr.io/v2/banks")
    .then(res => res.json())
    .then(result => {
        const banks = result.data.filter(b => popularBanks.includes(b.code));
        const grid = document.getElementById("bankGrid");

        banks.forEach(bank => {
            const div = document.createElement("div");
            div.className = "bank-option";
            div.title = bank.name;
            div.onclick = () => connectBank(bank);

            const img = document.createElement("img");
            img.src = bank.logo || "https://via.placeholder.com/100?text=No+Logo";
            img.alt = bank.shortName;
    


            div.appendChild(img);
            
            grid.appendChild(div);
        });
    })
    .catch(err => console.error("Error fetching banks:", err));

// State: các ngân hàng đã liên kết
let linkedAccounts = [];

// Thêm ngân hàng
function connectBank(bank) {
    if (linkedAccounts.find((acc) => acc.id === bank.code)) {
        alert(`${bank.name} đã được liên kết rồi.`);
        return;
    }

    const newAcc = {
        id: bank.code,
        name: bank.name,
        shortName: bank.shortName,
        logo: bank.logo,
        accountNumber:
            "**** **** **** " + Math.floor(1000 + Math.random() * 9000),
        balance: Math.floor(Math.random() * 10000000),
    };

    linkedAccounts.push(newAcc);
    renderLinkedAccounts();
}

// Hiển thị thẻ ngân hàng
function renderLinkedAccounts() {
    const list = document.querySelector(".bank-list");
    list.innerHTML = "";

    linkedAccounts.forEach((acc) => {
        const div = document.createElement("div");
        div.className = `bank-card ${acc.id}`; // acc.id = bank.code


        div.innerHTML = `
      <div class="card-top">
        <div class="balance">
          Số dư<br><span class="balance-amount">
            ${acc.balance.toLocaleString("vi-VN")} ₫
          </span>
        </div>
        <img src="${acc.logo}" alt="${acc.shortName}" class="bank-logo">
      </div>
      <div class="card-middle">
        <div><strong></strong><br>${acc.shortName}</div>
        <div><strong>Ngày hết hạn</strong><br>12/29</div>
      </div>
      <div class="card-bottom">
        ${acc.accountNumber}
        <button class="btn-unlink" onclick="disconnectBank('${acc.id}')">
          <i class="fas fa-unlink"></i>
        </button>
      </div>
    `;

        list.appendChild(div);
    });
}

// Ngắt kết nối
function disconnectBank(id) {
    linkedAccounts = linkedAccounts.filter((acc) => acc.id !== id);
    renderLinkedAccounts();
}
