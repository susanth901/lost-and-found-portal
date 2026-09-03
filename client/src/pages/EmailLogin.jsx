import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../config/api";

function EmailLogin() {
    const navigate = useNavigate();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/auth/login`,
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
                    JSON.stringify(
                        data.user
                    )
                );
            }

            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
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
            <h1>Login</h1>

            {error && (
                <p
                    style={{
                        color: "red",
                    }}
                >
                    {error}
                </p>
            )}

            <form
                onSubmit={handleSubmit}
            >
                <div
                    style={{
                        marginBottom:
                            "16px",
                    }}
                >
                    <label>
                        Email
                    </label>

                    <br />

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target
                                    .value
                            )
                        }
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop:
                                "6px",
                        }}
                    />
                </div>

                <div
                    style={{
                        marginBottom:
                            "16px",
                    }}
                >
                    <label>
                        Password
                    </label>

                    <br />

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target
                                    .value
                            )
                        }
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop:
                                "6px",
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "10px",
                    }}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>
            </form>
        </div>
    );
}

export default EmailLogin;