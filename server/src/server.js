const path = require("path");

require("dotenv").config({
    path: path.join(
        __dirname,
        "../.env"
    ),
});

const app = require("./app");

const PORT =
    process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.error(
        "JWT_SECRET is missing"
    );

    process.exit(1);
}

if (
    process.env.JWT_SECRET.length <
    32
) {
    console.error(
        "JWT_SECRET must be at least 32 characters long"
    );

    process.exit(1);
}

if (!process.env.DB_USER) {
    console.error(
        "Database configuration is missing"
    );

    process.exit(1);
}

app.listen(
    PORT,
    () => {
        console.log(
            `Server running on port ${PORT}`
        );
    }
);