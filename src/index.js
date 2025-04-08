require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const topupRoutes = require("./routes/topupRoutes");
const contactformRoutes = require("./routes/contactformRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const userRoutes = require("./routes/userroute");
const walletRoutes = require("./routes/walletRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

connectDB();
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/order', orderRoutes);
app.use('/topup', topupRoutes);
app.use('/contact', contactformRoutes);
app.use('/payout', payoutRoutes);
app.use('/user', userRoutes);
app.use('/wallet', walletRoutes);
app.use('/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));