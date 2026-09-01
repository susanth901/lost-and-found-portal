const {
    initializeApp,
    cert,
    getApps,
} = require("firebase-admin/app");

const {
    getAuth,
} = require("firebase-admin/auth");

const projectId =
    process.env.FIREBASE_PROJECT_ID;

const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL;

const privateKey =
    process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
    );

if (
    !projectId ||
    !clientEmail ||
    !privateKey
) {
    throw new Error(
        "Firebase Admin environment variables are missing"
    );
}

if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

const firebaseAuth = getAuth();

module.exports = firebaseAuth;