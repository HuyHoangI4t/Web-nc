const sql = require("mssql");

const config = {
  user: "sa",
  password: "123",
  server: "localhost",
  database: "SmartSpending",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let pool; // lưu kết nối toàn cục

async function getPool() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log("Kết nối SQL Server thành công");
    }
    return pool;
  } catch (err) {
    console.error("Lỗi kết nối:", err);
  }
}

module.exports = { sql, getPool };
