import {
    useMemo,
    useState,
} from "react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import API_URL from "../config/api";

function Navbar() {
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] =
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

    const handleLogout =
        async () => {
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

                navigate("/", {
                    replace: true,
                });
            }
        };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <NavLink
                    to="/dashboard"
                    className="navbar-brand"
                    onClick={
                        closeMenu
                    }
                >
                    Lost & Found
                </NavLink>

                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() =>
                        setMenuOpen(
                            (current) =>
                                !current
                        )
                    }
                    aria-label="Toggle navigation menu"
                    aria-expanded={
                        menuOpen
                    }
                >
                    ☰
                </button>

                <div
                    className={`navbar-content ${
                        menuOpen
                            ? "navbar-open"
                            : ""
                    }`}
                >
                    <nav className="navbar-links">
                        <NavLink
                            to="/dashboard"
                            className="btn btn-ghost"
                            onClick={
                                closeMenu
                            }
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/my-items"
                            className="btn btn-ghost"
                            onClick={
                                closeMenu
                            }
                        >
                            My Items
                        </NavLink>

                        <NavLink
                            to="/my-claims"
                            className="btn btn-ghost"
                            onClick={
                                closeMenu
                            }
                        >
                            My Claims
                        </NavLink>

                        <NavLink
                            to="/claims-received"
                            className="btn btn-ghost"
                            onClick={
                                closeMenu
                            }
                        >
                            Claims Received
                        </NavLink>

                        <NavLink
                            to="/profile"
                            className="btn btn-ghost"
                            onClick={
                                closeMenu
                            }
                        >
                            Profile
                        </NavLink>

                        {user?.role ===
                            "ADMIN" && (
                            <NavLink
                                to="/admin"
                                className="btn btn-ghost"
                                onClick={
                                    closeMenu
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
                            onClick={
                                closeMenu
                            }
                        >
                            Report Item
                        </NavLink>

                        <button
                            type="button"
                            className="btn navbar-logout-btn"
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