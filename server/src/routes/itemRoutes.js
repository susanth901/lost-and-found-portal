const express = require("express");

const {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
    getMyItems,
    deleteItemImage,
    addItemImages,
} = require("../controllers/itemController");

const {
    authenticateUser,
} = require("../middleware/authMiddleware");

const {
    upload,
} = require("../middleware/uploadMiddleware");

const {
    validateImageFiles,
} = require("../middleware/fileValidationMiddleware");

const {
    validateRequest,
} = require("../middleware/validationMiddleware");

const {
    itemIdValidator,
    imageIdValidator,
    createItemValidator,
    updateItemValidator,
    itemQueryValidator,
} = require("../middleware/requestValidators");

const router = express.Router();

const checkHandler = (name, handler) => {
    if (Array.isArray(handler)) {
        const invalid = handler.some(
            (item) => typeof item !== "function"
        );

        if (invalid) {
            throw new Error(
                `${name} contains a non-function middleware`
            );
        }

        console.log(`${name}: OK`);
        return;
    }

    if (typeof handler !== "function") {
        throw new Error(
            `${name} is ${typeof handler}, expected function`
        );
    }

    console.log(`${name}: OK`);
};

checkHandler(
    "authenticateUser",
    authenticateUser
);

checkHandler(
    "validateImageFiles",
    validateImageFiles
);

checkHandler(
    "createItemValidator",
    createItemValidator
);

checkHandler(
    "updateItemValidator",
    updateItemValidator
);

checkHandler(
    "itemQueryValidator",
    itemQueryValidator
);

checkHandler(
    "itemIdValidator",
    itemIdValidator
);

checkHandler(
    "imageIdValidator",
    imageIdValidator
);

checkHandler(
    "validateRequest",
    validateRequest
);

checkHandler(
    "createItem",
    createItem
);

checkHandler(
    "getItems",
    getItems
);

checkHandler(
    "getItemById",
    getItemById
);

checkHandler(
    "updateItem",
    updateItem
);

checkHandler(
    "deleteItem",
    deleteItem
);

checkHandler(
    "getMyItems",
    getMyItems
);

checkHandler(
    "deleteItemImage",
    deleteItemImage
);

checkHandler(
    "addItemImages",
    addItemImages
);

if (
    !upload ||
    typeof upload.array !== "function"
) {
    throw new Error(
        "upload.array is not available"
    );
}

console.log(
    "upload.array: OK"
);

router.get(
    "/",
    itemQueryValidator,
    validateRequest,
    getItems
);

router.get(
    "/mine",
    authenticateUser,
    getMyItems
);

router.get(
    "/:id",
    itemIdValidator,
    validateRequest,
    getItemById
);

router.post(
    "/",
    authenticateUser,
    upload.array("images", 5),
    validateImageFiles,
    createItemValidator,
    validateRequest,
    createItem
);

router.patch(
    "/:id",
    authenticateUser,
    updateItemValidator,
    validateRequest,
    updateItem
);

router.delete(
    "/:id",
    authenticateUser,
    itemIdValidator,
    validateRequest,
    deleteItem
);

router.post(
    "/:id/images",
    authenticateUser,
    itemIdValidator,
    validateRequest,
    upload.array("images", 5),
    validateImageFiles,
    addItemImages
);

router.delete(
    "/images/:imageId",
    authenticateUser,
    imageIdValidator,
    validateRequest,
    deleteItemImage
);

module.exports = router;