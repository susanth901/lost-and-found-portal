import { useState } from "react";
import { signInWithPopup } from "firebase/auth";

import {
    auth,
    googleProvider,
} from "../firebase";

function Auth() {
    const [mode, setMode] = useState("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] =
        useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] =
        useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password,
                    }),
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
                    JSON.stringify(data.user)
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

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                const validationMessage =
                    data.errors
                        ?.map(
                            (item) =>
                                item.message
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
                    JSON.stringify(data.user)
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

    const handleGoogleLogin = async () => {
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

            const response = await fetch(
                "http://localhost:5000/api/auth/firebase",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        idToken,
                    }),
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
                    JSON.stringify(data.user)
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

    const switchMode = (newMode) => {
        setMode(newMode);
        setError("");
        setPassword("");
    };

    return (
        <main className="auth-page-original">
            <div className="auth-box-original">
                <div className="auth-brand-original">
                    <h1>Lost & Found</h1>

                    <p>
                        Find lost items. Help others
                        find theirs.
                    </p>
                </div>

                <div className="auth-card-original">
                    <div className="auth-tabs-original">
                        <button
                            type="button"
                            className={
                                mode === "login"
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
                            mode === "login"
                                ? handleLogin
                                : handleRegister
                        }
                    >
                        {mode === "register" && (
                            <div className="auth-field-original">
                                <label>
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    placeholder="Enter your name"
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
                                value={email}
                                placeholder="you@example.com"
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
                                value={password}
                                placeholder="Enter your password"
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
                            disabled={loading}
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
    onClick={handleGoogleLogin}
    disabled={loading}
>
    <svg
        width="19"
        height="19"
        viewBox="0 0 48 48"
        aria-hidden="true"
    >
        <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303C33.665 32.657 29.234 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />

        <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.349 4.337-17.694 10.691z"
        />

        <path
            fill="#4CAF50"
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.213 0-9.63-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />

        <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
    </svg>

    Continue with Google
</button>

                    <p className="auth-bottom-original">
                        {mode === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}

                        <button
                            type="button"
                            onClick={() =>
                                switchMode(
                                    mode ===
                                        "login"
                                        ? "register"
                                        : "login"
                                )
                            }
                        >
                            {mode === "login"
                                ? "Create account"
                                : "Login"}
                        </button>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Auth;