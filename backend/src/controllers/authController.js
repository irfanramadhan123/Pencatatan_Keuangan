const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// REGISTER
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // cek email sudah ada atau belum
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user
    const result = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "User berhasil dibuat",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal membuat user",
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // cari user berdasarkan email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const user = result.rows[0];

    // cek password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    // buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login gagal",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, savings_target, currency, timezone FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal mengambil profil",
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const { username, email, savings_target, currency, timezone } = req.body;

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id <> $2",
      [email, req.user.id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET username = $1,
          email = $2,
          savings_target = COALESCE($3, savings_target),
          currency = COALESCE($4, currency),
          timezone = COALESCE($5, timezone)
      WHERE id = $6
      RETURNING id, username, email, savings_target, currency, timezone
      `,
      [username, email, savings_target, currency, timezone, req.user.id]
    );

    res.json({
      message: "Profil berhasil diperbarui",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal memperbarui profil",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email dan password baru harus diisi" });
    }

    const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, result.rows[0].id]);

    res.json({ message: "Password berhasil direset. Silakan login." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mereset password" });
  }
};

// GOOGLE AUTH - mulai flow (redirect ke Google)
const googleAuth = async (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
  });
  res.redirect(url);
};

// GOOGLE AUTH - callback dari Google
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect("http://localhost:5173/login?error=google_no_code");
    }

    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      return res.redirect("http://localhost:5173/login?error=google_unverified");
    }

    const email = payload.email;
    const name = payload.name || email.split("@")[0];

    // Cari user by email (menyambungkan akun existing)
    let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    let user;
    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
      // tandai sebagai akun Google bila belum
      if (!user.google_id) {
        await pool.query("UPDATE users SET google_id = $1 WHERE id = $2", [
          payload.sub,
          user.id,
        ]);
      }
    } else {
      const insert = await pool.query(
        `INSERT INTO users (username, email, google_id)
         VALUES ($1, $2, $3)
         RETURNING id, username, email`,
        [name, email, payload.sub]
      );
      user = insert.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Redirect balik ke frontend bawa token (frontend akan simpan & hapus dari URL)
    return res.redirect(`http://localhost:5173/login?token=${token}`);
  } catch (error) {
    console.error("Google callback error:", error.message);
    return res.redirect("http://localhost:5173/login?error=google_failed");
  }
};

// DELETE akun + semua data terkait (cascade)
const deleteAccount = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);
    res.json({ message: "Akun berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus akun" });
  }
};

module.exports = {
  getMe,
  updateMe,
  googleAuth,
  googleCallback,
  deleteAccount,
};
