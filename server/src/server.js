const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env"),
});

const app = require("./app");

const PORT = process.env.PORT || 5000;

if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
) {
    console.error(
        "JWT_SECRET must be at least 32 characters"
    );
    process.exit(1);
}

const hasDatabaseUrl =
    Boolean(process.env.DATABASE_URL);

const hasLocalDatabaseConfig =
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD &&
    process.env.DB_NAME;

if (
    !hasDatabaseUrl &&
    !hasLocalDatabaseConfig
) {
    console.error(
        "Database configuration is missing"
    );
    process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Server running on port ${PORT}`
    );
});