const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");
const firebaseAuth = require("../config/firebaseAdmin");

const createToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
            algorithm: "HS256",
        }
    );
};

const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure:
            process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
        maxAge: 60 * 60 * 1000,
        path: "/",
    });
};

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE LOWER(email) = LOWER($1)
                `,
                [normalizedEmail]
            );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists",
            });
        }

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );

        const result =
            await pool.query(
                `
                INSERT INTO users
                (
                    name,
                    email,
                    password_hash
                )
                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                RETURNING
                    id,
                    name,
                    email,
                    profile_image_url,
                    role,
                    is_active,
                    created_at
                `,
                [
                    name.trim(),
                    normalizedEmail,
                    passwordHash,
                ]
            );

        const user =
            result.rows[0];

        const token =
            createToken(user);

        setAuthCookie(
            res,
            token
        );

        return res.status(201).json({
            success: true,
            message:
                "Account created successfully",
            user,
        });
    } catch (error) {
        console.error(
            "Register error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        const normalizedEmail =
            email.trim().toLowerCase();

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    email,
                    password_hash,
                    profile_image_url,
                    role,
                    is_active,
                    created_at
                FROM users
                WHERE LOWER(email) = LOWER($1)
                `,
                [normalizedEmail]
            );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        const user =
            result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been disabled",
            });
        }

        if (!user.password_hash) {
            return res.status(400).json({
                success: false,
                message:
                    "This account uses Google Sign-In",
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        delete user.password_hash;

        const token =
            createToken(user);

        setAuthCookie(
            res,
            token
        );

        return res.status(200).json({
            success: true,
            message:
                "Login successful",
            user,
        });
    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};

const firebaseLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message:
                    "Firebase ID token is required",
            });
        }

        const decodedToken =
            await firebaseAuth.verifyIdToken(
                idToken
            );

        const firebaseUid =
            decodedToken.uid;

        const email =
            decodedToken.email
                ?.trim()
                .toLowerCase();

        const name =
            decodedToken.name ||
            email?.split("@")[0] ||
            "User";

        const picture =
            decodedToken.picture ||
            null;

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Google account email is required",
            });
        }

        let result =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    email,
                    google_id,
                    profile_image_url,
                    role,
                    is_active,
                    created_at
                FROM users
                WHERE google_id = $1
                `,
                [firebaseUid]
            );

        let user;

        if (result.rows.length > 0) {
            user =
                result.rows[0];
        } else {
            const emailResult =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        google_id,
                        profile_image_url,
                        role,
                        is_active,
                        created_at
                    FROM users
                    WHERE LOWER(email) = LOWER($1)
                    `,
                    [email]
                );

            if (
                emailResult.rows.length >
                0
            ) {
                const existingUser =
                    emailResult.rows[0];

                const updateResult =
                    await pool.query(
                        `
                        UPDATE users
                        SET
                            google_id = $1,
                            profile_image_url =
                                COALESCE(
                                    profile_image_url,
                                    $2
                                ),
                            updated_at =
                                CURRENT_TIMESTAMP
                        WHERE id = $3
                        RETURNING
                            id,
                            name,
                            email,
                            google_id,
                            profile_image_url,
                            role,
                            is_active,
                            created_at
                        `,
                        [
                            firebaseUid,
                            picture,
                            existingUser.id,
                        ]
                    );

                user =
                    updateResult.rows[0];
            } else {
                const insertResult =
                    await pool.query(
                        `
                        INSERT INTO users
                        (
                            name,
                            email,
                            google_id,
                            profile_image_url
                        )
                        VALUES
                        (
                            $1,
                            $2,
                            $3,
                            $4
                        )
                        RETURNING
                            id,
                            name,
                            email,
                            google_id,
                            profile_image_url,
                            role,
                            is_active,
                            created_at
                        `,
                        [
                            name,
                            email,
                            firebaseUid,
                            picture,
                        ]
                    );

                user =
                    insertResult.rows[0];
            }
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been disabled",
            });
        }

        const token =
            createToken(user);

        setAuthCookie(
            res,
            token
        );

        return res.status(200).json({
            success: true,
            message:
                "Google login successful",
            user,
        });
    } catch (error) {
        console.error(
            "Firebase login error:",
            error
        );

        return res.status(401).json({
            success: false,
            message:
                "Google authentication failed",
        });
    }
};

const getCurrentUser = async (
    req,
    res
) => {
    try {
        const result =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    email,
                    profile_image_url,
                    role,
                    is_active,
                    created_at
                FROM users
                WHERE id = $1
                `,
                [
                    req.user.userId,
                ]
            );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        const user =
            result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been disabled",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(
            "Get current user error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};

const logoutUser = async (
    req,
    res
) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure:
                process.env.NODE_ENV ===
                "production",
            sameSite:
                process.env.NODE_ENV ===
                "production"
                    ? "none"
                    : "lax",
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message:
                "Logged out successfully",
        });
    } catch (error) {
        console.error(
            "Logout error:",
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
    registerUser,
    loginUser,
    firebaseLogin,
    getCurrentUser,
    logoutUser,
};