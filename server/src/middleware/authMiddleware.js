const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const authenticateUser = async (
    req,
    res,
    next
) => {
    try {
        const token =
            req.cookies?.token;

        if (!token) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Authentication required",
                });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET,
                {
                    algorithms: [
                        "HS256",
                    ],
                }
            );

        if (!decoded.userId) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Invalid authentication token",
                });
        }

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    role,
                    is_active
                FROM users
                WHERE id = $1
                `,
                [
                    decoded.userId,
                ]
            );

        if (
            result.rows.length ===
            0
        ) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "User account not found",
                });
        }

        const user =
            result.rows[0];

        if (!user.is_active) {
            return res
                .status(403)
                .json({
                    success: false,
                    message:
                        "Your account has been disabled",
                });
        }

        req.user = {
            userId:
                user.id,
            role:
                user.role,
        };

        next();

    } catch (error) {
        if (
            error.name ===
            "TokenExpiredError"
        ) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Session expired. Please log in again.",
                });
        }

        if (
            error.name ===
            "JsonWebTokenError"
        ) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Invalid authentication token",
                });
        }

        console.error(
            "Authentication error:",
            error
        );

        return res
            .status(500)
            .json({
                success: false,
                message:
                    "Internal server error",
            });
    }
};

module.exports = {
    authenticateUser,
};