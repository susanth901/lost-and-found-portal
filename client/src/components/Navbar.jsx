import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
    const [open, setOpen] = useState(false);

    const user = useMemo(() => {
        try {
            return JSON.parse(
                localStorage.getItem("user") || "null"
            );
        } catch {
            return null;
        }
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(
                "http://localhost:5000/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );
        } catch (error) {
            console.error(
                "Logout failed:",
                error
            );
        } finally {
            localStorage.removeItem("user");
            window.location.href = "/auth";
        }
    };

    const navStyle = ({ isActive }) => ({
        padding: "9px 11px",
        borderRadius: "10px",
        fontSize: "0.92rem",
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
                            (current) =>
                                !current
                        )
                    }
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>

                <div
                    className={`navbar-content ${
                        open
                            ? "navbar-open"
                            : ""
                    }`}
                >
                    <nav className="navbar-links">
                        <NavLink
                            to="/dashboard"
                            style={navStyle}
                            onClick={() =>
                                setOpen(false)
                            }
                        >
                            Explore
                        </NavLink>

                        <NavLink
                            to="/my-items"
                            style={navStyle}
                            onClick={() =>
                                setOpen(false)
                            }
                        >
                            My Items
                        </NavLink>

                        <NavLink
                            to="/my-claims"
                            style={navStyle}
                            onClick={() =>
                                setOpen(false)
                            }
                        >
                            My Claims
                        </NavLink>

                        <NavLink
                            to="/claims-received"
                            style={navStyle}
                            onClick={() =>
                                setOpen(false)
                            }
                        >
                            Claims
                        </NavLink>

                        <NavLink
                            to="/profile"
                            style={navStyle}
                            onClick={() =>
                                setOpen(false)
                            }
                        >
                            Profile
                        </NavLink>

                        {user?.role ===
                            "ADMIN" && (
                            <NavLink
                                to="/admin"
                                style={navStyle}
                                onClick={() =>
                                    setOpen(
                                        false
                                    )
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
                            onClick={() =>
                                setOpen(false)
                            }
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