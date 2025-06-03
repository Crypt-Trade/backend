require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
// const cron = require('node-cron');

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const topupRoutes = require("./routes/topupRoutes");
const contactformRoutes = require("./routes/contactformRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const userRoutes = require("./routes/userroute");
const walletRoutes = require("./routes/walletRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
// const { addMonthlyRewards } = require('./controllers/ordersController');

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

// Schedule the cron to run daily at 12:00 AM
// cron.schedule('50 23 28-31 * *', async () => {
//     const now = new Date();
//     const tomorrow = new Date(now);
//     tomorrow.setDate(now.getDate() + 1);

//     if (tomorrow.getDate() === 1) {
//         console.log("⏳ Running scheduled monthly rewards calculation (end of month)...");
//         try {
//             await addMonthlyRewards();
//             console.log("✅ Monthly rewards updated");
//         } catch (error) {
//             console.error("❌ Error running monthly rewards:", error);
//         }
//     }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));