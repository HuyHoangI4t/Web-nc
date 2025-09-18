const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('./db');   

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const cors = require("cors");
app.use(cors());
app.use(express.json());

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client("908594978339-3dphku6que1ds8q9s6ml4lb3d3ojcs18.apps.googleusercontent.com");

// ---------------- REGISTER ----------------
app.post('/register', async (req, res) => {
  const { ten, email, password, anh } = req.body;
  if (!ten || !email || !password) {
    return res.status(400).json({ message: 'Thiếu ten, email hoặc password' });
  }
  try {
    const pool = await getPool();  

    // Kiểm tra email đã tồn tại
    const check = await pool.request()
      .input('email', sql.NVarChar(200), email)
      .query('SELECT TOP 1 MaNguoiDung FROM NguoiDung WHERE Email = @email');
    if (check.recordset.length > 0) {
      return res.status(409).json({ message: 'Email đã được đăng ký' });
    }

    // Băm mật khẩu
    const hash = await bcrypt.hash(password, 10);

    // Thêm user mới
    const insert = await pool.request()
      .input('ten', sql.NVarChar(200), ten)
      .input('email', sql.NVarChar(200), email)
      .input('matkhau', sql.NVarChar(500), hash)
      .input('anh', sql.NVarChar(500), anh || defaultAvatar)
      .query(`
        INSERT INTO NguoiDung (Ten, Email, MatKhau, AnhDaiDien)
        OUTPUT INSERTED.MaNguoiDung, INSERTED.Ten, INSERTED.Email, INSERTED.AnhDaiDien
        VALUES (@ten, @email, @matkhau, @anh)
      `);

    const user = insert.recordset[0];

    // Tạo JWT
    const token = jwt.sign(
      { id: user.MaNguoiDung, email: user.Email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: { id: user.MaNguoiDung, ten: user.Ten, email: user.Email, anh: user.AnhDaiDien }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ---------------- LOGIN ----------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Thiếu email hoặc password' });

  try {
    const pool = await getPool();   // ✅ dùng connectDB
    const result = await pool.request()
      .input('email', sql.NVarChar(200), email)
      .query('SELECT TOP 1 * FROM NguoiDung WHERE Email = @email');

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

    const ok = await bcrypt.compare(password, user.MatKhau);
    if (!ok) return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

    const token = jwt.sign(
      { id: user.MaNguoiDung, email: user.Email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: { id: user.MaNguoiDung, ten: user.Ten, email: user.Email, anh: user.AnhDaiDien }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

// // ---------------- GOOGLE LOGIN ----------------
// app.post("/google-login", async (req, res) => {
//   const { credential } = req.body;
//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: "908594978339-3dphku6que1ds8q9s6ml4lb3d3ojcs18.apps.googleusercontent.com"
//     });
//     const payload = ticket.getPayload();
//     const email = payload.email;
//     const name = payload.name;
//     const picture = payload.picture;

//     const pool = await connectDB();

//     // Kiểm tra user đã tồn tại chưa
//     const check = await pool.request()
//       .input("email", sql.NVarChar(200), email)
//       .query("SELECT TOP 1 * FROM NguoiDung WHERE Email = @email");

//     let user;
//     if (check.recordset.length > 0) {
//       // User đã có trong DB
//       user = check.recordset[0];
//     } else {
//       // Nếu chưa có thì thêm mới
//       const insert = await pool.request()
//         .input("ten", sql.NVarChar(200), name)
//         .input("email", sql.NVarChar(200), email)
//         .input("matkhau", sql.NVarChar(500), null) // Google login không cần mật khẩu
//         .input("anh", sql.NVarChar(500), picture)
//         .query(`
//           INSERT INTO NguoiDung (Ten, Email, MatKhau, AnhDaiDien)
//           OUTPUT INSERTED.MaNguoiDung, INSERTED.Ten, INSERTED.Email, INSERTED.AnhDaiDien
//           VALUES (@ten, @email, @matkhau, @anh)
//         `);

//       user = insert.recordset[0];
//     }

//     // Tạo JWT
//     const token = jwt.sign(
//       { id: user.MaNguoiDung, email: user.Email },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       message: "Google login thành công",
//       token,
//       user: {
//         id: user.MaNguoiDung,
//         ten: user.Ten,
//         email: user.Email,
//         anh: user.AnhDaiDien
//       }
//     });
//   } catch (e) {
//     console.error("Google login error:", e);
//     res.status(401).json({ message: "Xác thực Google thất bại" });
//   }
// });


// ---------------- AUTH MIDDLEWARE ----------------
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Thiếu token' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer')
    return res.status(401).json({ message: 'Header Authorization không hợp lệ' });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}

// ---------------- ME ----------------
app.get('/me', authMiddleware, async (req, res) => {
  try {
    const pool = await getPool();   // ✅ dùng connectDB
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT MaNguoiDung, Ten, Email, AnhDaiDien FROM NguoiDung WHERE MaNguoiDung = @id');
    res.json(result.recordset[0] || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => console.log(`Server chạy: http://localhost:${PORT}`));

// Middleware log request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.method === "POST" || req.method === "PUT") {
    console.log("Body:", req.body);
  }

  next();
});
