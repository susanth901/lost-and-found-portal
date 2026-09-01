const {
    body,
    param,
    query,
} = require("express-validator");

const uuidParam = (field = "id") =>
    param(field)
        .isUUID()
        .withMessage(
            `${field} must be a valid UUID`
        );

const itemIdValidator =
    uuidParam("id");

const imageIdValidator =
    uuidParam("imageId");

const claimIdValidator =
    uuidParam("claimId");

const userIdValidator =
    uuidParam("userId");

const createItemValidator = [
    body("categoryId")
        .isInt({ min: 1 })
        .withMessage(
            "Invalid category"
        ),

    body("type")
        .isIn([
            "LOST",
            "FOUND",
        ])
        .withMessage(
            "Type must be LOST or FOUND"
        ),

    body("title")
        .trim()
        .isLength({
            min: 3,
            max: 200,
        })
        .withMessage(
            "Title must be between 3 and 200 characters"
        ),

    body("description")
        .trim()
        .isLength({
            min: 5,
            max: 2000,
        })
        .withMessage(
            "Description must be between 5 and 2000 characters"
        ),

    body("locationName")
        .optional({
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 255,
        })
        .withMessage(
            "Location is too long"
        ),

    body("latitude")
        .optional({
            checkFalsy: true,
        })
        .isFloat({
            min: -90,
            max: 90,
        })
        .withMessage(
            "Invalid latitude"
        ),

    body("longitude")
        .optional({
            checkFalsy: true,
        })
        .isFloat({
            min: -180,
            max: 180,
        })
        .withMessage(
            "Invalid longitude"
        ),

    body("dateOccurred")
        .optional({
            checkFalsy: true,
        })
        .isISO8601()
        .withMessage(
            "Invalid date"
        )
        .custom((value) => {
            const selected =
                new Date(value);

            const today =
                new Date();

            today.setHours(
                23,
                59,
                59,
                999
            );

            if (
                selected > today
            ) {
                throw new Error(
                    "Date cannot be in the future"
                );
            }

            return true;
        }),

    body("contactPreference")
        .optional()
        .isIn([
            "IN_APP",
            "EMAIL",
        ])
        .withMessage(
            "Invalid contact preference"
        ),
];

const updateItemValidator = [
    itemIdValidator,

    body("categoryId")
        .optional()
        .isInt({ min: 1 })
        .withMessage(
            "Invalid category"
        ),

    body("type")
        .optional()
        .isIn([
            "LOST",
            "FOUND",
        ])
        .withMessage(
            "Invalid item type"
        ),

    body("title")
        .optional()
        .trim()
        .isLength({
            min: 3,
            max: 200,
        })
        .withMessage(
            "Title must be between 3 and 200 characters"
        ),

    body("description")
        .optional()
        .trim()
        .isLength({
            min: 5,
            max: 2000,
        })
        .withMessage(
            "Description must be between 5 and 2000 characters"
        ),

    body("locationName")
        .optional({
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 255,
        })
        .withMessage(
            "Location is too long"
        ),

    body("latitude")
        .optional({
            checkFalsy: true,
        })
        .isFloat({
            min: -90,
            max: 90,
        })
        .withMessage(
            "Invalid latitude"
        ),

    body("longitude")
        .optional({
            checkFalsy: true,
        })
        .isFloat({
            min: -180,
            max: 180,
        })
        .withMessage(
            "Invalid longitude"
        ),

    body("dateOccurred")
        .optional({
            checkFalsy: true,
        })
        .isISO8601()
        .withMessage(
            "Invalid date"
        ),

    body("contactPreference")
        .optional()
        .isIn([
            "IN_APP",
            "EMAIL",
        ])
        .withMessage(
            "Invalid contact preference"
        ),

    body("status")
        .optional()
        .isIn([
            "ACTIVE",
            "CLAIMED",
            "RESOLVED",
            "CLOSED",
        ])
        .withMessage(
            "Invalid item status"
        ),
];

const itemQueryValidator = [
    query("type")
        .optional()
        .isIn([
            "LOST",
            "FOUND",
        ])
        .withMessage(
            "Invalid type filter"
        ),

    query("status")
        .optional()
        .isIn([
            "ACTIVE",
            "CLAIMED",
            "RESOLVED",
            "CLOSED",
        ])
        .withMessage(
            "Invalid status filter"
        ),

    query("categoryId")
        .optional()
        .isInt({ min: 1 })
        .withMessage(
            "Invalid category filter"
        ),

    query("search")
        .optional()
        .trim()
        .isLength({
            max: 100,
        })
        .withMessage(
            "Search text is too long"
        ),

    query("page")
        .optional()
        .isInt({
            min: 1,
        })
        .withMessage(
            "Invalid page"
        ),

    query("limit")
        .optional()
        .isInt({
            min: 1,
            max: 50,
        })
        .withMessage(
            "Limit must be between 1 and 50"
        ),
];

const createClaimValidator = [
    body("itemId")
        .isUUID()
        .withMessage(
            "Invalid item ID"
        ),

    body("message")
        .trim()
        .isLength({
            min: 5,
            max: 2000,
        })
        .withMessage(
            "Claim message must be between 5 and 2000 characters"
        ),
];

const updateClaimValidator = [
    claimIdValidator,

    body("status")
        .isIn([
            "ACCEPTED",
            "REJECTED",
        ])
        .withMessage(
            "Status must be ACCEPTED or REJECTED"
        ),

    body("ownerResponse")
        .optional({
            checkFalsy: true,
        })
        .trim()
        .isLength({
            max: 2000,
        })
        .withMessage(
            "Owner response is too long"
        ),
];

const profileValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({
            min: 2,
            max: 100,
        })
        .withMessage(
            "Name must be between 2 and 100 characters"
        ),

    body("profileImageUrl")
        .optional({
            checkFalsy: true,
        })
        .isURL({
            protocols: [
                "http",
                "https",
            ],
            require_protocol:
                true,
        })
        .withMessage(
            "Profile image must be a valid URL"
        )
        .isLength({
            max: 2048,
        })
        .withMessage(
            "Profile image URL is too long"
        ),
];

const adminUserStatusValidator = [
    userIdValidator,

    body("isActive")
        .isBoolean()
        .withMessage(
            "isActive must be true or false"
        ),
];

module.exports = {
    uuidParam,
    itemIdValidator,
    imageIdValidator,
    claimIdValidator,
    userIdValidator,
    createItemValidator,
    updateItemValidator,
    itemQueryValidator,
    createClaimValidator,
    updateClaimValidator,
    profileValidator,
    adminUserStatusValidator,
};