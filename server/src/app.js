const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require(
    "express-rate-limit"
);
const {
    verifyRequestOrigin,
} = require(
    "./middleware/csrfMiddleware"
);
const cookieParser = require(
    "cookie-parser"
);

const authRoutes = require(
    "./routes/authRoutes"
);

const categoryRoutes = require(
    "./routes/categoryRoutes"
);

const userRoutes = require(
    "./routes/userRoutes"
);

const itemRoutes = require(
    "./routes/itemRoutes"
);

const claimRoutes = require(
    "./routes/claimRoutes"
);

const adminRoutes = require(
    "./routes/adminRoutes"
);

const {
    errorHandler,
} = require(
    "./middleware/errorMiddleware"
);

const {
    notFoundHandler,
} = require(
    "./middleware/notFoundMiddleware"
);

const app = express();

const CLIENT_URL =
    process.env.CLIENT_URL ||
    "http://localhost:5173";

app.use(
    cors({
        origin:
            CLIENT_URL,

        methods: [
            "GET",
            "POST",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
        ],

        credentials:
            true,
    })
);

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy:
                "cross-origin",
        },
    })
);

app.use(
    express.json({
        limit:
            "100kb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit:
            "100kb",
    })
);

app.use(
    cookieParser()
);

app.use(
    "/api",
    verifyRequestOrigin
);

const apiLimiter =
    rateLimit({
        windowMs:
            15 *
            60 *
            1000,

        limit:
            1000,

        standardHeaders:
            "draft-7",

        legacyHeaders:
            false,

        message: {
            success: false,
            message:
                "Too many requests. Please try again later.",
        },
    });

const authLimiter =
    rateLimit({
        windowMs:
            15 *
            60 *
            1000,

        limit:
            20,

        standardHeaders:
            "draft-7",

        legacyHeaders:
            false,

        message: {
            success: false,
            message:
                "Too many authentication attempts. Please try again later.",
        },
    });

app.use(
    "/api",
    apiLimiter
);

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "../uploads"
        )
    )
);

app.use(
    "/api/auth/register",
    authLimiter
);

app.use(
    "/api/auth/login",
    authLimiter
);

app.use(
    "/api/auth/firebase",
    authLimiter
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/items",
    itemRoutes
);

app.use(
    "/api/claims",
    claimRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;