const {
    initializeApp,
    applicationDefault,
    getApps,
} = require("firebase-admin/app");

const {
    getAuth,
} = require("firebase-admin/auth");

if (getApps().length === 0) {
    initializeApp({
        credential: applicationDefault(),
        projectId: "lostandfound-82a6f",
    });
}

const firebaseAuth = getAuth();

module.exports = firebaseAuth;