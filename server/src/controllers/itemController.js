const pool = require("../config/db");
const fs = require("fs");
const path = require("path");


// ======================================================
// CREATE ITEM
// ======================================================

const createItem = async (req, res) => {
    const client = await pool.connect();

    const cleanupUploadedFiles = () => {
        if (!req.files) return;

        for (const file of req.files) {
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } catch (fileError) {
                console.error(
                    "Failed to clean uploaded file:",
                    fileError
                );
            }
        }
    };

    try {
        const userId = req.user.userId;

        const {
            categoryId,
            type,
            title,
            description,
            locationName,
            latitude,
            longitude,
            dateOccurred,
            contactPreference,
        } = req.body;

        if (
            !categoryId ||
            !type ||
            !title ||
            !description
        ) {
            cleanupUploadedFiles();

            return res.status(400).json({
                success: false,
                message:
                    "Category, type, title and description are required",
            });
        }

        if (!["LOST", "FOUND"].includes(type)) {
            cleanupUploadedFiles();

            return res.status(400).json({
                success: false,
                message:
                    "Type must be LOST or FOUND",
            });
        }

        if (
            contactPreference &&
            !["IN_APP", "EMAIL"].includes(
                contactPreference
            )
        ) {
            cleanupUploadedFiles();

            return res.status(400).json({
                success: false,
                message:
                    "Invalid contact preference",
            });
        }

        if (
            latitude !== undefined &&
            latitude !== null &&
            latitude !== "" &&
            (
                Number.isNaN(Number(latitude)) ||
                Number(latitude) < -90 ||
                Number(latitude) > 90
            )
        ) {
            cleanupUploadedFiles();

            return res.status(400).json({
                success: false,
                message: "Invalid latitude",
            });
        }

        if (
            longitude !== undefined &&
            longitude !== null &&
            longitude !== "" &&
            (
                Number.isNaN(Number(longitude)) ||
                Number(longitude) < -180 ||
                Number(longitude) > 180
            )
        ) {
            cleanupUploadedFiles();

            return res.status(400).json({
                success: false,
                message: "Invalid longitude",
            });
        }

        await client.query("BEGIN");

        const itemResult = await client.query(
            `
            INSERT INTO items (
                user_id,
                category_id,
                type,
                title,
                description,
                location_name,
                latitude,
                longitude,
                date_occurred,
                contact_preference
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10
            )
            RETURNING *
            `,
            [
                userId,
                categoryId,
                type,
                title.trim(),
                description.trim(),
                locationName
                    ? locationName.trim()
                    : null,
                latitude === "" ||
                latitude === undefined
                    ? null
                    : latitude,
                longitude === "" ||
                longitude === undefined
                    ? null
                    : longitude,
                dateOccurred || null,
                contactPreference || "IN_APP",
            ]
        );

        const item = itemResult.rows[0];
        const images = [];

        if (req.files && req.files.length > 0) {
            for (
                let i = 0;
                i < req.files.length;
                i++
            ) {
                const file = req.files[i];

                const imageResult =
                    await client.query(
                        `
                        INSERT INTO item_images (
                            item_id,
                            image_url,
                            sort_order
                        )
                        VALUES ($1, $2, $3)
                        RETURNING *
                        `,
                        [
                            item.id,
                            `/uploads/${file.filename}`,
                            i,
                        ]
                    );

                images.push(
                    imageResult.rows[0]
                );
            }
        }

        await client.query("COMMIT");

        item.images = images;

        return res.status(201).json({
            success: true,
            message:
                "Item created successfully",
            data: item,
        });

    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Rollback error:",
                rollbackError
            );
        }

        cleanupUploadedFiles();

        console.error(
            "Create item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });

    } finally {
        client.release();
    }
};


// ======================================================
// GET ALL ITEMS
// SEARCH + FILTER + PAGINATION
// ======================================================

const getItems = async (req, res) => {
    try {
        const {
            type,
            categoryId,
            status,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const pageNumber = Math.max(
            parseInt(page) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(
                parseInt(limit) || 10,
                1
            ),
            50
        );

        const offset =
            (pageNumber - 1) *
            limitNumber;

        let whereClause = `
            WHERE 1 = 1
        `;

        const values = [];

        if (type) {
            if (
                !["LOST", "FOUND"].includes(type)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid item type",
                });
            }

            values.push(type);

            whereClause += `
                AND items.type = $${values.length}
            `;
        }

        if (categoryId) {
            values.push(categoryId);

            whereClause += `
                AND items.category_id = $${values.length}
            `;
        }

        if (status) {
            if (
                ![
                    "ACTIVE",
                    "CLAIMED",
                    "RESOLVED",
                    "CLOSED",
                ].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid item status",
                });
            }

            values.push(status);

            whereClause += `
                AND items.status = $${values.length}
            `;
        }

        if (search) {
            values.push(
                `%${search.trim()}%`
            );

            whereClause += `
                AND (
                    items.title
                        ILIKE $${values.length}

                    OR items.description
                        ILIKE $${values.length}

                    OR items.location_name
                        ILIKE $${values.length}
                )
            `;
        }

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM items
            ${whereClause}
        `;

        const countResult =
            await pool.query(
                countQuery,
                values
            );

        const totalItems =
            parseInt(
                countResult.rows[0].total
            );

        const totalPages =
            Math.ceil(
                totalItems /
                limitNumber
            );

        const dataValues = [
            ...values,
        ];

        dataValues.push(
            limitNumber
        );

        const limitPosition =
            dataValues.length;

        dataValues.push(offset);

        const offsetPosition =
            dataValues.length;

        const dataQuery = `
            SELECT
                items.id,
                items.type,
                items.title,
                items.description,
                items.location_name,
                items.latitude,
                items.longitude,
                items.date_occurred,
                items.status,
                items.contact_preference,
                items.created_at,

                categories.id
                    AS category_id,

                categories.name
                    AS category_name,

                users.id
                    AS user_id,

                users.name
                    AS user_name,

                (
                    SELECT image_url
                    FROM item_images
                    WHERE
                        item_images.item_id =
                        items.id
                    ORDER BY
                        sort_order ASC
                    LIMIT 1
                ) AS primary_image

            FROM items

            JOIN categories
                ON items.category_id =
                   categories.id

            JOIN users
                ON items.user_id =
                   users.id

            ${whereClause}

            ORDER BY
                items.created_at DESC

            LIMIT $${limitPosition}
            OFFSET $${offsetPosition}
        `;

        const result =
            await pool.query(
                dataQuery,
                dataValues
            );

        return res.status(200).json({
            success: true,

            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalItems,
                totalPages,
            },

            data: result.rows,
        });

    } catch (error) {
        console.error(
            "Get items error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};


// ======================================================
// GET SINGLE ITEM
// ======================================================

const getItemById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const itemResult =
            await pool.query(
                `
                SELECT
                    items.id,
                    items.type,
                    items.title,
                    items.description,
                    items.location_name,
                    items.latitude,
                    items.longitude,
                    items.date_occurred,
                    items.status,
                    items.contact_preference,
                    items.created_at,
                    items.updated_at,

                    categories.id
                        AS category_id,

                    categories.name
                        AS category_name,

                    users.id
                        AS user_id,

                    users.name
                        AS user_name

                FROM items

                JOIN categories
                    ON items.category_id =
                       categories.id

                JOIN users
                    ON items.user_id =
                       users.id

                WHERE items.id = $1
                `,
                [id]
            );

        if (
            itemResult.rows.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Item not found",
            });
        }

        const imageResult =
            await pool.query(
                `
                SELECT
                    id,
                    image_url,
                    sort_order
                FROM item_images
                WHERE item_id = $1
                ORDER BY sort_order ASC
                `,
                [id]
            );

        const item =
            itemResult.rows[0];

        item.images =
            imageResult.rows;

        return res.status(200).json({
            success: true,
            data: item,
        });

    } catch (error) {
        console.error(
            "Get item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};


// ======================================================
// UPDATE ITEM
// ======================================================

const updateItem = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const userId =
            req.user.userId;

        const {
            categoryId,
            type,
            title,
            description,
            locationName,
            latitude,
            longitude,
            dateOccurred,
            contactPreference,
            status,
        } = req.body;

        // ----------------------------
        // Security validation
        // ----------------------------

        if (
            type &&
            ![
                "LOST",
                "FOUND",
            ].includes(type)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid item type",
            });
        }

        if (
            status &&
            ![
                "ACTIVE",
                "CLAIMED",
                "RESOLVED",
                "CLOSED",
            ].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid item status",
            });
        }

        if (
            contactPreference &&
            ![
                "IN_APP",
                "EMAIL",
            ].includes(
                contactPreference
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid contact preference",
            });
        }

        if (
            latitude !== undefined &&
            latitude !== null &&
            latitude !== "" &&
            (
                Number.isNaN(
                    Number(latitude)
                ) ||
                Number(latitude) < -90 ||
                Number(latitude) > 90
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid latitude",
            });
        }

        if (
            longitude !== undefined &&
            longitude !== null &&
            longitude !== "" &&
            (
                Number.isNaN(
                    Number(longitude)
                ) ||
                Number(longitude) < -180 ||
                Number(longitude) > 180
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid longitude",
            });
        }

        if (
            title !== undefined &&
            !title.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title cannot be empty",
            });
        }

        if (
            description !== undefined &&
            !description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Description cannot be empty",
            });
        }

        // ----------------------------
        // Ownership check
        // ----------------------------

        const existingItem =
            await pool.query(
                `
                SELECT
                    id,
                    user_id
                FROM items
                WHERE id = $1
                `,
                [id]
            );

        if (
            existingItem.rows.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Item not found",
            });
        }

        if (
            existingItem.rows[0]
                .user_id !== userId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to edit this item",
            });
        }

        // ----------------------------
        // Update
        // ----------------------------

        const result =
            await pool.query(
                `
                UPDATE items
                SET
                    category_id =
                        COALESCE(
                            $1,
                            category_id
                        ),

                    type =
                        COALESCE(
                            $2,
                            type
                        ),

                    title =
                        COALESCE(
                            $3,
                            title
                        ),

                    description =
                        COALESCE(
                            $4,
                            description
                        ),

                    location_name =
                        COALESCE(
                            $5,
                            location_name
                        ),

                    latitude =
                        COALESCE(
                            $6,
                            latitude
                        ),

                    longitude =
                        COALESCE(
                            $7,
                            longitude
                        ),

                    date_occurred =
                        COALESCE(
                            $8,
                            date_occurred
                        ),

                    contact_preference =
                        COALESCE(
                            $9,
                            contact_preference
                        ),

                    status =
                        COALESCE(
                            $10,
                            status
                        )

                WHERE id = $11

                RETURNING *
                `,
                [
                    categoryId ||
                        null,

                    type || null,

                    title !== undefined
                        ? title.trim()
                        : null,

                    description !==
                    undefined
                        ? description.trim()
                        : null,

                    locationName !==
                    undefined
                        ? locationName
                        : null,

                    latitude === ""
                        ? null
                        : latitude,

                    longitude === ""
                        ? null
                        : longitude,

                    dateOccurred ||
                        null,

                    contactPreference ||
                        null,

                    status || null,

                    id,
                ]
            );

        return res.status(200).json({
            success: true,
            message:
                "Item updated successfully",
            data: result.rows[0],
        });

    } catch (error) {
        console.error(
            "Update item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};


// ======================================================
// DELETE ITEM
// ======================================================

const deleteItem = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const userId =
            req.user.userId;

        const existingItem =
            await pool.query(
                `
                SELECT
                    id,
                    user_id
                FROM items
                WHERE id = $1
                `,
                [id]
            );

        if (
            existingItem.rows.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Item not found",
            });
        }

        if (
            existingItem.rows[0]
                .user_id !== userId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to delete this item",
            });
        }

        const imageResult =
            await pool.query(
                `
                SELECT image_url
                FROM item_images
                WHERE item_id = $1
                `,
                [id]
            );

        await pool.query(
            `
            DELETE FROM items
            WHERE id = $1
            `,
            [id]
        );

        // DB cascade deletes image rows.
        // We must manually delete files.

        for (
            const image
            of imageResult.rows
        ) {
            try {
                const fileName =
                    path.basename(
                        image.image_url
                    );

                const filePath =
                    path.join(
                        __dirname,
                        "../../uploads",
                        fileName
                    );

                if (
                    fs.existsSync(
                        filePath
                    )
                ) {
                    fs.unlinkSync(
                        filePath
                    );
                }

            } catch (fileError) {
                console.error(
                    "Failed to delete image file:",
                    fileError
                );
            }
        }

        return res.status(200).json({
            success: true,
            message:
                "Item deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};


// ======================================================
// GET CURRENT USER'S ITEMS
// ======================================================

const getMyItems = async (
    req,
    res
) => {
    try {
        const userId =
            req.user.userId;

        const result =
            await pool.query(
                `
                SELECT
                    items.id,
                    items.type,
                    items.title,
                    items.description,
                    items.location_name,
                    items.latitude,
                    items.longitude,
                    items.date_occurred,
                    items.status,
                    items.contact_preference,
                    items.created_at,

                    categories.id
                        AS category_id,

                    categories.name
                        AS category_name,

                    (
                        SELECT image_url
                        FROM item_images
                        WHERE
                            item_images.item_id =
                            items.id
                        ORDER BY
                            sort_order ASC
                        LIMIT 1
                    ) AS primary_image

                FROM items

                JOIN categories
                    ON items.category_id =
                       categories.id

                WHERE
                    items.user_id = $1

                ORDER BY
                    items.created_at DESC
                `,
                [userId]
            );

        return res.status(200).json({
            success: true,
            data: result.rows,
        });

    } catch (error) {
        console.error(
            "Get my items error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};


// ======================================================
// DELETE SINGLE ITEM IMAGE
// ======================================================

const deleteItemImage = async (
    req,
    res
) => {
    try {
        const { imageId } =
            req.params;

        const userId =
            req.user.userId;

        const imageResult =
            await pool.query(
                `
                SELECT
                    item_images.id,
                    item_images.item_id,
                    item_images.image_url,
                    items.user_id

                FROM item_images

                JOIN items
                    ON item_images.item_id =
                       items.id

                WHERE
                    item_images.id = $1
                `,
                [imageId]
            );

        if (
            imageResult.rows.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Image not found",
            });
        }

        const image =
            imageResult.rows[0];

        if (
            image.user_id !== userId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to delete this image",
            });
        }

        await pool.query(
            `
            DELETE FROM item_images
            WHERE id = $1
            `,
            [imageId]
        );

        const fileName =
            path.basename(
                image.image_url
            );

        const filePath =
            path.join(
                __dirname,
                "../../uploads",
                fileName
            );

        if (
            fs.existsSync(
                filePath
            )
        ) {
            fs.unlinkSync(
                filePath
            );
        }

        return res.status(200).json({
            success: true,
            message:
                "Image deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete item image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};


// ======================================================
// ADD IMAGES TO EXISTING ITEM
// ======================================================

const addItemImages = async (
    req,
    res
) => {
    const cleanupUploadedFiles = () => {
        if (!req.files) return;

        for (
            const file
            of req.files
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
            } catch (
                cleanupError
            ) {
                console.error(
                    "File cleanup error:",
                    cleanupError
                );
            }
        }
    };

    try {
        const { id } =
            req.params;

        const userId =
            req.user.userId;

        const itemResult =
            await pool.query(
                `
                SELECT
                    id,
                    user_id
                FROM items
                WHERE id = $1
                `,
                [id]
            );

        if (
            itemResult.rows.length === 0
        ) {
            cleanupUploadedFiles();

            return res.status(404).json({
                success: false,
                message:
                    "Item not found",
            });
        }

        if (
            itemResult.rows[0]
                .user_id !== userId
        ) {
            cleanupUploadedFiles();

            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to add images to this item",
            });
        }

        if (
            !req.files ||
            req.files.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one image is required",
            });
        }

        const countResult =
            await pool.query(
                `
                SELECT
                    COUNT(*) AS total
                FROM item_images
                WHERE item_id = $1
                `,
                [id]
            );

        const currentImageCount =
            parseInt(
                countResult
                    .rows[0]
                    .total
            );

        if (
            currentImageCount +
                req.files.length >
            5
        ) {
            cleanupUploadedFiles();

            return res.status(400).json({
                success: false,
                message:
                    "An item can have a maximum of 5 images",
            });
        }

        const addedImages = [];

        for (
            let i = 0;
            i < req.files.length;
            i++
        ) {
            const file =
                req.files[i];

            const result =
                await pool.query(
                    `
                    INSERT INTO item_images (
                        item_id,
                        image_url,
                        sort_order
                    )
                    VALUES (
                        $1,
                        $2,
                        $3
                    )
                    RETURNING *
                    `,
                    [
                        id,

                        `/uploads/${file.filename}`,

                        currentImageCount +
                            i,
                    ]
                );

            addedImages.push(
                result.rows[0]
            );
        }

        return res.status(201).json({
            success: true,
            message:
                "Images added successfully",
            data: addedImages,
        });

    } catch (error) {
        cleanupUploadedFiles();

        console.error(
            "Add item images error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
    getMyItems,
    deleteItemImage,
    addItemImages,
};