import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    signInWithPopup,
} from "firebase/auth";

import {
    auth,
    googleProvider,
} from "../firebase";

import API_URL from "../config/api";

function Login() {
    const navigate = useNavigate();

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleGoogleLogin =
        async () => {
            try {
                setLoading(true);
                setError("");

                const result =
                    await signInWithPopup(
                        auth,
                        googleProvider
                    );

                const idToken =
                    await result.user.getIdToken();

                const response =
                    await fetch(
                        `${API_URL}/api/auth/firebase`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            credentials:
                                "include",

                            body: JSON.stringify(
                                {
                                    idToken,
                                }
                            ),
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Google login failed"
                    );
                }

                if (data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );
                }

                navigate(
                    "/dashboard"
                );
            } catch (error) {
                console.error(
                    "Google login error:",
                    error
                );

                setError(
                    error.message ||
                        "Google login failed"
                );
            } finally {
                setLoading(false);
            }
        };

    return (
        <div
            style={{
                maxWidth: "420px",
                margin: "60px auto",
                padding: "24px",
            }}
        >
            <h1>
                Lost & Found Portal
            </h1>

            {error && (
                <p
                    style={{
                        color: "red",
                    }}
                >
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={
                    handleGoogleLogin
                }
                disabled={loading}
                style={{
                    width: "100%",
                    padding: "10px",
                }}
            >
                {loading
                    ? "Please wait..."
                    : "Continue with Google"}
            </button>

            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/email-login"
                    )
                }
                style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "12px",
                }}
            >
                Login with Email
            </button>

            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/register"
                    )
                }
                style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "12px",
                }}
            >
                Create Account
            </button>
        </div>
    );
}

export default Login;