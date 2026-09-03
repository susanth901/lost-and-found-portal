const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const uploadDirectory = path.join(
    __dirname,
    "../../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (
        req,
        file,
        cb
    ) => {
        cb(null, uploadDirectory);
    },

    filename: (
        req,
        file,
        cb
    ) => {
        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const filename =
            `${Date.now()}-${crypto.randomUUID()}${extension}`;

        cb(null, filename);
    },
});

const fileFilter = (
    req,
    file,
    cb
) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {
        return cb(null, true);
    }

    return cb(
        new Error(
            "Only JPEG, PNG and WEBP images are allowed"
        ),
        false
    );
};

const upload = multer({
    storage,

    fileFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024,

        files: 5,
    },
});

module.exports = {
    upload,
};