import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalItems: 0,
        activeItems: 0,
        totalClaims: 0,
        pendingClaims: 0,
    });

    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);

    const [tab, setTab] = useState("users");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const currentUser = useMemo(() => {
        try {
            const storedUser =
                localStorage.getItem("user");

            return storedUser
                ? JSON.parse(storedUser)
                : null;
        } catch {
            return null;
        }
    }, []);

    const API = "http://localhost:5000";

    const getImageUrl = (image) => {
        if (!image) {
            return null;
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `${API}${image}`;
    };

    const loadAdminData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                statsResponse,
                usersResponse,
                itemsResponse,
            ] = await Promise.all([
                fetch(
                    `${API}/api/admin/stats`,
                    {
                        credentials:
                            "include",
                    }
                ),

                fetch(
                    `${API}/api/admin/users`,
                    {
                        credentials:
                            "include",
                    }
                ),

                fetch(
                    `${API}/api/admin/items`,
                    {
                        credentials:
                            "include",
                    }
                ),
            ]);

            const statsData =
                await statsResponse.json();

            const usersData =
                await usersResponse.json();

            const itemsData =
                await itemsResponse.json();

            if (!statsResponse.ok) {
                throw new Error(
                    statsData.message ||
                        "Unable to load admin statistics"
                );
            }

            if (!usersResponse.ok) {
                throw new Error(
                    usersData.message ||
                        "Unable to load users"
                );
            }

            if (!itemsResponse.ok) {
                throw new Error(
                    itemsData.message ||
                        "Unable to load items"
                );
            }

            const statsResult =
                statsData.data ||
                statsData.stats ||
                statsData;

            setStats({
                totalUsers: Number(
                    statsResult.totalUsers ??
                        statsResult.total_users ??
                        0
                ),

                activeUsers: Number(
                    statsResult.activeUsers ??
                        statsResult.active_users ??
                        0
                ),

                totalItems: Number(
                    statsResult.totalItems ??
                        statsResult.total_items ??
                        0
                ),

                activeItems: Number(
                    statsResult.activeItems ??
                        statsResult.active_items ??
                        0
                ),

                totalClaims: Number(
                    statsResult.totalClaims ??
                        statsResult.total_claims ??
                        0
                ),

                pendingClaims: Number(
                    statsResult.pendingClaims ??
                        statsResult.pending_claims ??
                        0
                ),
            });

            if (
                Array.isArray(
                    usersData.data
                )
            ) {
                setUsers(usersData.data);
            } else if (
                Array.isArray(
                    usersData.users
                )
            ) {
                setUsers(
                    usersData.users
                );
            } else {
                setUsers([]);
            }

            if (
                Array.isArray(
                    itemsData.data
                )
            ) {
                setItems(itemsData.data);
            } else if (
                Array.isArray(
                    itemsData.items
                )
            ) {
                setItems(
                    itemsData.items
                );
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error(
                "Admin dashboard error:",
                error
            );

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    const handleUserStatus = async (
        userId,
        newStatus
    ) => {
        try {
            setError("");

            const response = await fetch(
                `${API}/api/admin/users/${userId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        isActive:
                            newStatus,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to update user"
                );
            }

            setUsers(
                (currentUsers) =>
                    currentUsers.map(
                        (user) =>
                            user.id ===
                            userId
                                ? {
                                      ...user,
                                      is_active:
                                          newStatus,
                                  }
                                : user
                    )
            );

            setStats(
                (currentStats) => ({
                    ...currentStats,

                    activeUsers:
                        newStatus
                            ? currentStats.activeUsers +
                              1
                            : Math.max(
                                  0,
                                  currentStats.activeUsers -
                                      1
                              ),
                })
            );
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteItem = async (
        itemId
    ) => {
        const confirmed =
            window.confirm(
                "Delete this item permanently?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `${API}/api/admin/items/${itemId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to delete item"
                );
            }

            const deletedItem =
                items.find(
                    (item) =>
                        item.id === itemId
                );

            setItems(
                (currentItems) =>
                    currentItems.filter(
                        (item) =>
                            item.id !==
                            itemId
                    )
            );

            setStats(
                (currentStats) => ({
                    ...currentStats,

                    totalItems:
                        Math.max(
                            0,
                            currentStats.totalItems -
                                1
                        ),

                    activeItems:
                        deletedItem?.status ===
                        "ACTIVE"
                            ? Math.max(
                                  0,
                                  currentStats.activeItems -
                                      1
                              )
                            : currentStats.activeItems,
                })
            );
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <Navbar />

                <main className="page-shell">
                    <div className="admin-loading">
                        Loading admin
                        dashboard...
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Manage users, reports,
                        and platform activity.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <section className="admin-stats">
                    <div className="card admin-stat">
                        <span className="admin-stat-label">
                            Total Users
                        </span>

                        <strong className="admin-stat-value">
                            {stats.totalUsers}
                        </strong>

                        <span className="admin-stat-subtext">
                            {
                                stats.activeUsers
                            }{" "}
                            active
                        </span>
                    </div>

                    <div className="card admin-stat">
                        <span className="admin-stat-label">
                            Total Items
                        </span>

                        <strong className="admin-stat-value">
                            {stats.totalItems}
                        </strong>

                        <span className="admin-stat-subtext">
                            {
                                stats.activeItems
                            }{" "}
                            active
                        </span>
                    </div>

                    <div className="card admin-stat">
                        <span className="admin-stat-label">
                            Total Claims
                        </span>

                        <strong className="admin-stat-value">
                            {stats.totalClaims}
                        </strong>

                        <span className="admin-stat-subtext">
                            {
                                stats.pendingClaims
                            }{" "}
                            pending
                        </span>
                    </div>
                </section>

                <div className="admin-tabs">
                    <button
                        type="button"
                        className={
                            tab === "users"
                                ? "admin-tab admin-tab-active"
                                : "admin-tab"
                        }
                        onClick={() =>
                            setTab("users")
                        }
                    >
                        Users
                    </button>

                    <button
                        type="button"
                        className={
                            tab === "items"
                                ? "admin-tab admin-tab-active"
                                : "admin-tab"
                        }
                        onClick={() =>
                            setTab("items")
                        }
                    >
                        Items
                    </button>
                </div>

                {tab === "users" && (
                    <section className="card admin-table-card">
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>
                                            User
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Joined
                                        </th>

                                        <th>
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map(
                                        (
                                            user
                                        ) => (
                                            <tr
                                                key={
                                                    user.id
                                                }
                                            >
                                                <td>
                                                    <div className="admin-user-info">
                                                        <strong>
                                                            {
                                                                user.name
                                                            }
                                                        </strong>

                                                        <span className="admin-email">
                                                            {
                                                                user.email
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="admin-role">
                                                        {
                                                            user.role
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            user.is_active
                                                                ? "admin-status admin-status-active"
                                                                : "admin-status admin-status-disabled"
                                                        }
                                                    >
                                                        {user.is_active
                                                            ? "ACTIVE"
                                                            : "DISABLED"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {user.created_at
                                                        ? new Date(
                                                              user.created_at
                                                          ).toLocaleDateString()
                                                        : "-"}
                                                </td>

                                                <td>
                                                    {user.id ===
                                                    currentUser?.id ? (
                                                        <span className="admin-current-account">
                                                            Current
                                                            account
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className={
                                                                user.is_active
                                                                    ? "btn btn-danger"
                                                                    : "btn btn-success"
                                                            }
                                                            onClick={() =>
                                                                handleUserStatus(
                                                                    user.id,
                                                                    !user.is_active
                                                                )
                                                            }
                                                        >
                                                            {user.is_active
                                                                ? "Disable"
                                                                : "Enable"}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {tab === "items" && (
                    <>
                        {items.length ===
                        0 ? (
                            <div className="empty-state">
                                <h3>
                                    No items
                                </h3>

                                <p>
                                    No reports
                                    are currently
                                    available.
                                </p>
                            </div>
                        ) : (
                            <div className="admin-items-grid">
                                {items.map(
                                    (
                                        item
                                    ) => {
                                        const image =
                                            getImageUrl(
                                                item.primary_image ||
                                                    item.primary_image_url ||
                                                    item.image_url
                                            );

                                        return (
                                            <article
                                                className="admin-item-card"
                                                key={
                                                    item.id
                                                }
                                            >
                                                {image ? (
                                                    <img
                                                        src={
                                                            image
                                                        }
                                                        alt={
                                                            item.title
                                                        }
                                                        className="admin-item-image"
                                                    />
                                                ) : (
                                                    <div className="admin-item-no-image">
                                                        No
                                                        image
                                                    </div>
                                                )}

                                                <div className="admin-item-body">
                                                    <div className="admin-item-top">
                                                        <span
                                                            className={`badge ${
                                                                item.type ===
                                                                "FOUND"
                                                                    ? "badge-found"
                                                                    : "badge-lost"
                                                            }`}
                                                        >
                                                            {
                                                                item.type
                                                            }
                                                        </span>

                                                        <span
                                                            className={`badge badge-${item.status?.toLowerCase()}`}
                                                        >
                                                            {
                                                                item.status
                                                            }
                                                        </span>
                                                    </div>

                                                    <h3>
                                                        {
                                                            item.title
                                                        }
                                                    </h3>

                                                    <p className="admin-item-description">
                                                        {
                                                            item.description
                                                        }
                                                    </p>

                                                    <div className="admin-item-meta">
                                                        <span>
                                                            {item.location_name ||
                                                                "No location"}
                                                        </span>

                                                        {item.user_name && (
                                                            <span>
                                                                Reported
                                                                by{" "}
                                                                {
                                                                    item.user_name
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="admin-item-actions">
                                                        <Link
                                                            to={`/items/${item.id}`}
                                                            className="btn btn-secondary"
                                                        >
                                                            View
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() =>
                                                                handleDeleteItem(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;