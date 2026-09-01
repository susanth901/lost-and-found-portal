const multer = require("multer");

const errorHandler = (
    error,
    req,
    res,
    next
) => {
    console.error(error);

    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message:
                    "Image size must not exceed 5 MB",
            });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message:
                    "Maximum 5 images are allowed",
            });
        }

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "File upload error",
        });
    }

    if (
        error.message ===
        "INVALID_FILE_TYPE"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Only JPEG, PNG and WEBP images are allowed",
        });
    }

    return res.status(
        error.status || 500
    ).json({
        success: false,
        message:
            error.status
                ? error.message
                : "Internal server error",
    });
};

module.exports = {
    errorHandler,
};