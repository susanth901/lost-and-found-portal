const express = require("express");

const {
    createClaim,
    getClaimsForItem,
    updateClaimStatus,
    getMyClaims,
    cancelClaim,
} = require("../controllers/claimController");

const {
    authenticateUser,
} = require("../middleware/authMiddleware");

const {
    validateRequest,
} = require("../middleware/validationMiddleware");

const {
    createClaimValidator,
    updateClaimValidator,
    claimIdValidator,
} = require("../middleware/requestValidators");

const {
    param,
} = require("express-validator");

const router = express.Router();

router.post(
    "/",
    authenticateUser,
    createClaimValidator,
    validateRequest,
    createClaim
);

router.get(
    "/mine",
    authenticateUser,
    getMyClaims
);

router.get(
    "/item/:itemId",
    authenticateUser,
    param("itemId")
        .isUUID()
        .withMessage(
            "Invalid item ID"
        ),
    validateRequest,
    getClaimsForItem
);

router.patch(
    "/:claimId/status",
    authenticateUser,
    updateClaimValidator,
    validateRequest,
    updateClaimStatus
);

router.patch(
    "/:claimId/cancel",
    authenticateUser,
    claimIdValidator,
    validateRequest,
    cancelClaim
);

module.exports = router;