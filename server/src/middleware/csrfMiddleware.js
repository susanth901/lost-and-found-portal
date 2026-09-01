const allowedOrigins = new Set([
    process.env.CLIENT_URL ||
        "http://localhost:5173",
]);

const verifyRequestOrigin = (
    req,
    res,
    next
) => {
    const safeMethods = [
        "GET",
        "HEAD",
        "OPTIONS",
    ];

    if (
        safeMethods.includes(
            req.method
        )
    ) {
        return next();
    }

    const origin =
        req.get("origin");

    if (
        !origin ||
        !allowedOrigins.has(
            origin
        )
    ) {
        return res
            .status(403)
            .json({
                success: false,
                message:
                    "Invalid request origin",
            });
    }

    next();
};

module.exports = {
    verifyRequestOrigin,
};