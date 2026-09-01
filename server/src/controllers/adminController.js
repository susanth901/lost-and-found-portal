const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const getAdminStats = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM users WHERE is_active = true) AS active_users,
                (SELECT COUNT(*) FROM items) AS total_items,
                (SELECT COUNT(*) FROM items WHERE status = 'ACTIVE') AS active_items,
                (SELECT COUNT(*) FROM claims) AS total_claims,
                (SELECT COUNT(*) FROM claims WHERE status = 'PENDING') AS pending_claims
        `);

        return res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Admin stats error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                name,
                email,
                role,
                is_active,
                profile_image_url,
                created_at
            FROM users
            ORDER BY created_at DESC
        `);

        return res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Admin users error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getAdminItems = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                i.id,
                i.title,
                i.type,
                i.status,
                i.location_name,
                i.created_at,

                c.name AS category_name,

                u.id AS user_id,
                u.name AS user_name,
                u.email AS user_email,

                (
                    SELECT image_url
                    FROM item_images
                    WHERE item_id = i.id
                    ORDER BY sort_order ASC, created_at ASC
                    LIMIT 1
                ) AS primary_image

            FROM items i

            JOIN users u
                ON u.id = i.user_id

            LEFT JOIN categories c
                ON c.id = i.category_id

            ORDER BY i.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Admin items error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const deleteAnyItem = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        const itemResult = await client.query(
            `
            SELECT id
            FROM items
            WHERE id = $1
            `,
            [id]
        );

        if (itemResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        const imageResult = await client.query(
            `
            SELECT image_url
            FROM item_images
            WHERE item_id = $1
            `,
            [id]
        );

        await client.query(
            `
            DELETE FROM items
            WHERE id = $1
            `,
            [id]
        );

        await client.query("COMMIT");

        for (const image of imageResult.rows) {
            try {
                const relativePath =
                    image.image_url.replace(/^\/+/, "");

                const filePath = path.join(
                    __dirname,
                    "../../",
                    relativePath
                );

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.error(
                    "Admin image cleanup failed:",
                    error
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Item deleted successfully",
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Admin delete item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        client.release();
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot disable your own admin account",
            });
        }

        const result = await pool.query(
            `
            UPDATE users
            SET
                is_active = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING
                id,
                name,
                email,
                role,
                is_active,
                created_at
            `,
            [isActive, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: isActive
                ? "User enabled successfully"
                : "User disabled successfully",
            data: result.rows[0],
        });
    } catch (error) {
        console.error(
            "Update user status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    getAdminStats,
    getUsers,
    getAdminItems,
    deleteAnyItem,
    updateUserStatus,
};