import { useState } from "react";

import {
    signInWithPopup,
} from "firebase/auth";

import {
    auth,
    googleProvider,
} from "../firebase";

import API_URL from "../config/api";

function Auth() {
    const [mode, setMode] =
        useState("login");

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleLogin = async (
        event
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials:
                            "include",

                        body: JSON.stringify(
                            {
                                email,
                                password,
                            }
                        ),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Login failed"
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

            window.location.href =
                "/dashboard";
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (
        event
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/auth/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials:
                            "include",

                        body: JSON.stringify(
                            {
                                name,
                                email,
                                password,
                            }
                        ),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                const validationMessage =
                    data.errors
                        ?.map(
                            (item) =>
                                item.message ||
                                item.msg
                        )
                        .join(", ");

                throw new Error(
                    validationMessage ||
                        data.message ||
                        "Registration failed"
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

            window.location.href =
                "/dashboard";
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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

                window.location.href =
                    "/dashboard";
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

    const switchMode = (
        newMode
    ) => {
        setMode(newMode);
        setError("");
        setPassword("");
    };

    return (
        <main className="auth-page-original">
            <div className="auth-box-original">
                <div className="auth-brand-original">
                    <h1>
                        Lost & Found
                    </h1>

                    <p>
                        Find lost items.
                        Help others find
                        theirs.
                    </p>
                </div>

                <div className="auth-card-original">
                    <div className="auth-tabs-original">
                        <button
                            type="button"
                            className={
                                mode ===
                                "login"
                                    ? "auth-tab-original auth-tab-original-active"
                                    : "auth-tab-original"
                            }
                            onClick={() =>
                                switchMode(
                                    "login"
                                )
                            }
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className={
                                mode ===
                                "register"
                                    ? "auth-tab-original auth-tab-original-active"
                                    : "auth-tab-original"
                            }
                            onClick={() =>
                                switchMode(
                                    "register"
                                )
                            }
                        >
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="auth-error-original">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={
                            mode ===
                            "login"
                                ? handleLogin
                                : handleRegister
                        }
                    >
                        {mode ===
                            "register" && (
                            <div className="auth-field-original">
                                <label>
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    required
                                />
                            </div>
                        )}

                        <div className="auth-field-original">
                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                value={
                                    email
                                }
                                onChange={(
                                    event
                                ) =>
                                    setEmail(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="auth-field-original">
                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                value={
                                    password
                                }
                                onChange={(
                                    event
                                ) =>
                                    setPassword(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-main-button-original"
                            disabled={
                                loading
                            }
                        >
                            {loading
                                ? "Please wait..."
                                : mode ===
                                    "login"
                                  ? "Login"
                                  : "Create Account"}
                        </button>
                    </form>

                    <div className="auth-divider-original">
                        <span />
                        <p>or</p>
                        <span />
                    </div>

                    <button
                        type="button"
                        className="google-button-original"
                        onClick={
                            handleGoogleLogin
                        }
                        disabled={
                            loading
                        }
                    >
                        Continue with
                        Google
                    </button>
                </div>
            </div>
        </main>
    );
}

export default Auth;