import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../config/api";

function Register() {
    const navigate = useNavigate();

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

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/auth/register`,
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
            <h1>
                Create Account
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
                        Name
                    </label>

                    <br />

                    <input
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(
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
                        ? "Creating account..."
                        : "Register"}
                </button>
            </form>

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
                Already have an
                account? Login
            </button>
        </div>
    );
}

export default Register;