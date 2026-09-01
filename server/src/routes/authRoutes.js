const express = require("express");
const { body } = require("express-validator");

const {
    registerUser,
    loginUser,
    firebaseLogin,
    getCurrentUser,
    logoutUser,
} = require("../controllers/authController");

const {
    authenticateUser,
} = require("../middleware/authMiddleware");

const {
    validateRequest,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
    "/register",
    [
        body("name")
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage(
                "Name must be between 2 and 100 characters"
            ),

        body("email")
            .isEmail()
            .withMessage(
                "Enter a valid email address"
            )
            .normalizeEmail(),

        body("password")
            .isLength({ min: 8, max: 128 })
            .withMessage(
                "Password must be at least 8 characters"
            ),
    ],
    validateRequest,
    registerUser
);

router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage(
                "Enter a valid email address"
            )
            .normalizeEmail(),

        body("password")
            .notEmpty()
            .withMessage(
                "Password is required"
            ),
    ],
    validateRequest,
    loginUser
);

router.post(
    "/firebase",
    [
        body("idToken")
            .isString()
            .notEmpty()
            .withMessage(
                "Firebase token is required"
            ),
    ],
    validateRequest,
    firebaseLogin
);

router.get(
    "/me",
    authenticateUser,
    getCurrentUser
);

router.post(
    "/logout",
    logoutUser
);

module.exports = router;