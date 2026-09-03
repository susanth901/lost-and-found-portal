import {
    useMemo,
    useState,
} from "react";

import {
    NavLink,
} from "react-router-dom";

import API_URL from "../config/api";

function Navbar() {
    const [open, setOpen] =
        useState(false);

    const user = useMemo(() => {
        try {
            return JSON.parse(
                localStorage.getItem(
                    "user"
                ) || "null"
            );
        } catch {
            return null;
        }
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(
                `${API_URL}/api/auth/logout`,
                {
                    method: "POST",
                    credentials:
                        "include",
                }
            );
        } catch (error) {
            console.error(
                "Logout error:",
                error
            );
        } finally {
            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "/auth";
        }
    };

    const navStyle = ({
        isActive,
    }) => ({
        padding: "9px 11px",
        borderRadius: "10px",
        fontSize: ".92rem",
        fontWeight: 600,
        color: isActive
            ? "#111827"
            : "#6b7280",
        background: isActive
            ? "#f3f4f6"
            : "transparent",
    });

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <NavLink
                    to="/dashboard"
                    className="navbar-brand"
                >
                    Lost & Found
                </NavLink>

                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() =>
                        setOpen(
                            (value) =>
                                !value
                        )
                    }
                >
                    ☰
                </button>

                <div
                    className={
                        open
                            ? "navbar-content navbar-open"
                            : "navbar-content"
                    }
                >
                    <nav className="navbar-links">
                        <NavLink
                            to="/dashboard"
                            style={
                                navStyle
                            }
                        >
                            Explore
                        </NavLink>

                        <NavLink
                            to="/my-items"
                            style={
                                navStyle
                            }
                        >
                            My Items
                        </NavLink>

                        <NavLink
                            to="/my-claims"
                            style={
                                navStyle
                            }
                        >
                            My Claims
                        </NavLink>

                        <NavLink
                            to="/claims"
                            style={
                                navStyle
                            }
                        >
                            Claims
                        </NavLink>

                        <NavLink
                            to="/profile"
                            style={
                                navStyle
                            }
                        >
                            Profile
                        </NavLink>

                        {user?.role ===
                            "ADMIN" && (
                            <NavLink
                                to="/admin"
                                style={
                                    navStyle
                                }
                            >
                                Admin
                            </NavLink>
                        )}
                    </nav>

                    <div className="navbar-actions">
                        <NavLink
                            to="/report"
                            className="btn btn-primary"
                        >
                            Report Item
                        </NavLink>

                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={
                                handleLogout
                            }
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;