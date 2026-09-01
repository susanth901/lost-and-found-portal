const express = require("express");

const {
    getProfile,
    updateProfile,
} = require("../controllers/userController");

const {
    authenticateUser,
} = require("../middleware/authMiddleware");

const {
    validateRequest,
} = require("../middleware/validationMiddleware");

const {
    profileValidator,
} = require("../middleware/requestValidators");

const router = express.Router();

router.get(
    "/profile",
    authenticateUser,
    getProfile
);

router.patch(
    "/profile",
    authenticateUser,
    profileValidator,
    validateRequest,
    updateProfile
);

module.exports = router;