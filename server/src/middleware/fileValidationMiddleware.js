const fs = require("fs");

const validateImageFiles = async (
    req,
    res,
    next
) => {
    try {
        if (
            !req.files ||
            req.files.length === 0
        ) {
            return next();
        }

        const {
            fileTypeFromFile,
        } = await import("file-type");

        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        for (const file of req.files) {
            const detectedType =
                await fileTypeFromFile(
                    file.path
                );

            if (
                !detectedType ||
                !allowedMimeTypes.includes(
                    detectedType.mime
                )
            ) {
                for (
                    const uploadedFile
                    of req.files
                ) {
                    try {
                        if (
                            fs.existsSync(
                                uploadedFile.path
                            )
                        ) {
                            fs.unlinkSync(
                                uploadedFile.path
                            );
                        }
                    } catch {
                        // cleanup failure ignored
                    }
                }

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Only JPEG, PNG and WEBP images are allowed",
                    });
            }
        }

        next();
    } catch (error) {
        for (
            const file
            of req.files || []
        ) {
            try {
                if (
                    fs.existsSync(
                        file.path
                    )
                ) {
                    fs.unlinkSync(
                        file.path
                    );
                }
            } catch {
                // cleanup failure ignored
            }
        }

        next(error);
    }
};

module.exports = {
    validateImageFiles,
};