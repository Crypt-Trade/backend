const WalletPoints = require("../models/WalletPoints");
const User = require("../models/User");
const WalletDetails = require("../models/WalletDetails");
// const UserOrders = require("../models/UserOrders");

// Add Personal Points to User
async function addPersonalPoints(user, totalPoints) {
  try {
    // Find BV Points document for user
    let userPoints = await WalletPoints.findOne({ userId: user._id });
    if (!userPoints) {
      // user BVPoints doesn't exists => user- isActive: false  => create userBVPoints
      userPoints = await WalletPoints.create({ userId: user._id });
    }

    userPoints.personalPoints += totalPoints;
    await userPoints.save();
  } catch (error) {
    console.error("Error adding personal BV points:", error);
  }
}

// Check if User is in Left Tree of Ancestor
async function checkIfInLeftTree(ancestor, user) {
  if (ancestor.binaryPosition) {
    // Check if the user's ID matches the left child's ID
    if (
      ancestor.binaryPosition.left &&
      ancestor.binaryPosition.left.toString() === user._id.toString()
    ) {
      return true;
    }
    // Check if the user's ID matches the right child's ID
    else if (
      ancestor.binaryPosition.right &&
      ancestor.binaryPosition.right.toString() === user._id.toString()
    ) {
      return false;
    }
  }

  return false;
}

// Add Points to Ancestors
async function addPointsToAncestors(user, totalPoints) {
  try {
    let currentUser = user;
    let rcvdSponsorId = user.sponsorId;

    while (currentUser.parentSponsorId) {
      // Traverse through the ancestors and update their BV points
      const ancestor = await User.findOne({
        mySponsorId: currentUser.parentSponsorId,
      });
      if (!ancestor) break;

      // Find BV Points document for ancestor
      let ancestorPoints = await WalletPoints.findOne({ userId: ancestor._id });
      if (!ancestorPoints) {
        // If BVPoints document doesn't exist, create a new one
        // Create a new BVPoint Doc only if user is Active.
        ancestorPoints = new WalletPoints({ userId: ancestor._id });
        // if (ancestor.isActive === true) {
        //     ancestorBVPoints = new BVPoints({ userId: ancestor._id });
        // } else if (ancestor.isActive === false) {
        //     currentUser = ancestor;
        //     continue;
        // }
      }

      // Check if current user (purchaser) is in the left or right subtree of ancestor
      const isInLeftTree = await checkIfInLeftTree(ancestor, currentUser);
      if (isInLeftTree) {
        ancestorPoints.totalPoints.leftPoints += totalPoints;
        ancestorPoints.currentWeekPoints.leftPoints += totalPoints;
        ancestorPoints.currentMonthPoints.leftPoints += totalPoints;
        await ancestorPoints.save();
      } else {
        ancestorPoints.totalPoints.rightPoints += totalPoints;
        ancestorPoints.currentWeekPoints.rightPoints += totalPoints;
        ancestorPoints.currentMonthPoints.rightPoints += totalPoints;
        await ancestorPoints.save();
      }

      if (ancestor.mySponsorId === rcvdSponsorId) {
        // This ancestor is the sponsor of buyer.
        // add Direct BV Points to ancestors bvPoints Schema.
        // Check if current user (purchaser) is in the left or right subtree of ancestor
        if (isInLeftTree) {
          ancestorPoints.directPoints.leftPoints += totalPoints;
        } else {
          ancestorPoints.directPoints.rightPoints += totalPoints;
        }
        await ancestorPoints.save();
      }

      // Move to the next ancestor (parent of the current ancestor)
      currentUser = ancestor;
    }

    console.log("BV points successfully added to ancestors.");
  } catch (error) {
    console.error("Error while adding BV points to ancestors:", error);
  }
}

async function handleSubmitWalletDetails(req, res) {
  try {
    const { userId, name, telegramId, Walletaddress } = req.body;

    const existingWallet = await WalletDetails.findOne({ userId });

    if (existingWallet) {
      // Update the existing wallet details
      existingWallet.walletApproved = "pending"; // Reset approval status to pending
      existingWallet.name = name;
      existingWallet.telegramId = telegramId;
      existingWallet.Walletaddress = Walletaddress;

      await existingWallet.save();
      return res
        .status(200)
        .json({
          message: "Wallet details updated successfully",
          wallet: existingWallet,
        });
    } else {
      // Create a new wallet entry
      const wallet = new WalletDetails({
        userId,
        name,
        telegramId,
        Walletaddress,
        walletApproved: "pending",
      });

      await wallet.save();
      return res
        .status(201)
        .json({ message: "Wallet details submitted successfully", wallet });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}
/2/; //wallet status by user id
const handleGetwalletCStatus = async (req, res) => {
  try {
    // Extract sponsorId from the request parameters
    const { mySponsorId } = req.params;

    // Search for KYC details
    const wallet = await WalletDetails.findOne({ userId: mySponsorId });
    if (!wallet) {
      return res.json({ walletStatus: "not_submitted" });
    }

    return res.status(200).json({ walletStatus: wallet.walletApproved });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// 3. Admin will Verify KYC user
const handleVerifyWalletDetails = async (req, res) => {
  try {
    const { mySponsorId } = req.body;
    if (!mySponsorId) {
      return res.status(400).json({ message: "mySponsorId is missing." });
    }

    // Find KYC user
    const wallet = await WalletDetails.findOne({ userId: mySponsorId });
    if (!wallet) {
      return res
        .status(404)
        .json({ message: "WalletDetails details not found." });
    }

    wallet.walletApproved = "verified";
    await wallet.save();

    return res
      .status(200)
      .json({ message: "Wallet details verified successfully.", wallet });
  } catch (error) {
    console.error("Error verifying wallet user:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// 4. Admin will Reject KYC user
const handleRejectKYCDetails = async (req, res) => {
  try {
    const { mySponsorId } = req.body;
    if (!mySponsorId) {
      return res.status(400).json({ message: "mySponsorId is missing." });
    }

    // Find KYC user
    const wallet = await WalletDetails.findOne({ userId: mySponsorId });
    if (!wallet) {
      return res.status(404).json({ message: "KYC details not found." });
    }

    wallet.walletApproved = "rejected";
    await wallet.save();

    return res
      .status(200)
      .json({ message: "Wallet details rejected successfully.", wallet });
  } catch (error) {
    console.error("Error verifying Wallet user:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// 5. Admin will Get All the non-verified KYC users
const handleGetAllNonVerifiedKycUsers = async (req, res) => {
  try {
    const users = await WalletDetails.find({ walletApproved: "pending" });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching non-verified  users:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

async function getRejectedWalletUsers(req, res) {
  try {
    const rejectedUsers = await WalletDetails.find({ walletApproved: "rejected" });

    if (rejectedUsers.length === 0) {
      return res.status(404).json({ message: "No users found with rejected wallet status." });
    }

    res.status(200).json({
      message: "Rejected wallet users fetched successfully.",
      rejectedUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getApprovedWalletUsers(req, res) {
  try {
    const approvedUsers = await WalletDetails.find({ walletApproved: "verified" });

    if (approvedUsers.length === 0) {
      return res.status(404).json({ message: "No users found with approved wallet status." });
    }

    res.status(200).json({
      message: "Approved wallet users fetched successfully.",
      approvedUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
  addPersonalPoints,
  checkIfInLeftTree,
  addPointsToAncestors,
  handleSubmitWalletDetails,
  handleGetwalletCStatus,
  handleVerifyWalletDetails,
  handleRejectKYCDetails,
  handleGetAllNonVerifiedKycUsers,
  getRejectedWalletUsers,
  getApprovedWalletUsers
};
