const express = require("express");

const {
    getAdminStats,
    getUsers,
    getAdminItems,
    deleteAnyItem,
    updateUserStatus,
} = require("../controllers/adminController");

const {
    authenticateUser,
} = require("../middleware/authMiddleware");

const {
    authorizeRoles,
} = require("../middleware/roleMiddleware");

const {
    validateRequest,
} = require("../middleware/validationMiddleware");

const {
    itemIdValidator,
    adminUserStatusValidator,
} = require("../middleware/requestValidators");

const router = express.Router();

router.use(
    authenticateUser,
    authorizeRoles("ADMIN")
);

router.get(
    "/stats",
    getAdminStats
);

router.get(
    "/users",
    getUsers
);

router.get(
    "/items",
    getAdminItems
);

router.delete(
    "/items/:id",
    itemIdValidator,
    validateRequest,
    deleteAnyItem
);

router.patch(
    "/users/:userId/status",
    adminUserStatusValidator,
    validateRequest,
    updateUserStatus
);

module.exports = router;