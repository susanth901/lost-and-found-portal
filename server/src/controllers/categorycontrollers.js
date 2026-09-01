const pool = require("../config/db");

const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name FROM categories ORDER BY name ASC"
        );

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    getCategories,
};