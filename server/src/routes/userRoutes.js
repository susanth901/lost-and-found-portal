const express = require("express");

const {
    getProfile,
    updateProfile,
} = require("../controllers/userController");

const {
    authenticateUser,
} = require("../middleware/authMiddleware");

const {
    upload,
} = require("../middleware/upload");

const router = express.Router();

router.get(
    "/profile",
    authenticateUser,
    getProfile
);

router.patch(
    "/profile",
    authenticateUser,
    upload.single("profileImage"),
    updateProfile
);

module.exports = router;