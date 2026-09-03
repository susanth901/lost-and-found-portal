const pool = require("../config/db");

const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                profile_image_url,
                created_at
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name } = req.body;

        let profileImageUrl = null;

        if (req.file) {
            profileImageUrl =
                `/uploads/${req.file.filename}`;
        }

        if (!name && !profileImageUrl) {
            return res.status(400).json({
                success: false,
                message:
                    "Provide a name or profile picture to update",
            });
        }

        const result = await pool.query(
            `
            UPDATE users
            SET
                name = COALESCE($1, name),
                profile_image_url = COALESCE($2, profile_image_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING
                id,
                name,
                email,
                profile_image_url,
                updated_at
            `,
            [
                name || null,
                profileImageUrl,
                userId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Profile updated successfully",
            data: result.rows[0],
        });
    } catch (error) {
        console.error(
            "Update profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
};