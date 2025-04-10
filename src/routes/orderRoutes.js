const express = require("express");
const { createOrder, updateOrderStatus, getAllOrders, getAprrovedOrders, createApprovedOrderAndActivateUser } = require("../controllers/ordersController");
const { upload } = require("../middleware/multer");

const router = express.Router();

// Create a new order with image upload
router.post("/create", upload.single("image"), createOrder);

// Update order status
router.post("/update-status", updateOrderStatus);
router.get("/all-orders", getAllOrders);
router.get("/approved-orders", getAprrovedOrders);
router.post("/update-status-without-orderno", createApprovedOrderAndActivateUser);

module.exports = router;