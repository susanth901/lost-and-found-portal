import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";

function MyItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState("");

    const navigate = useNavigate();

    const API =
        "http://localhost:5000";

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

    const extractItems = (data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data.items)) {
            return data.items;
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        if (
            Array.isArray(
                data.data?.items
            )
        ) {
            return data.data.items;
        }

        return [];
    };

    const fetchMyItems = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API}/api/items/mine`,
                {
                    credentials: "include",
                }
            );

            const data =
                await response.json();

            console.log(
                "My items response:",
                data
            );

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to load your items"
                );
            }

            setItems(
                extractItems(data)
            );
        } catch (error) {
            console.error(
                "My items error:",
                error
            );

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyItems();
    }, []);

    const handleDelete = async (
        itemId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this item?"
            );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/api/items/${itemId}`,
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

            setItems((currentItems) =>
                currentItems.filter(
                    (item) =>
                        item.id !== itemId
                )
            );
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <div className="my-items-header">
                    <div>
                        <h1>My Items</h1>

                        <p>
                            Manage everything you
                            have reported.
                        </p>
                    </div>

                    <Link
                        to="/report"
                        className="btn btn-primary"
                    >
                        Report Item
                    </Link>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="my-items-grid">
                        <div className="my-item-loading">
                            Loading items...
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <h3>
                            You haven't reported
                            anything yet
                        </h3>

                        <p>
                            Report a lost or found
                            item to see it here.
                        </p>

                        <Link
                            to="/report"
                            className="btn btn-primary"
                            style={{
                                marginTop:
                                    "18px",
                            }}
                        >
                            Report Item
                        </Link>
                    </div>
                ) : (
                    <div className="my-items-grid">
                        {items.map((item) => {
                            const image =
                                getImageUrl(
                                    item.primary_image ||
                                        item.primary_image_url ||
                                        item.image_url
                                );

                            return (
                                <article
                                    className="my-item-card"
                                    key={item.id}
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={
                                                item.title
                                            }
                                            className="my-item-image"
                                        />
                                    ) : (
                                        <div className="my-item-no-image">
                                            No image
                                        </div>
                                    )}

                                    <div className="my-item-body">
                                        <div className="my-item-badges">
                                            <span
                                                className={`badge ${
                                                    item.type ===
                                                    "FOUND"
                                                        ? "badge-found"
                                                        : "badge-lost"
                                                }`}
                                            >
                                                {item.type}
                                            </span>

                                            <span
                                                className={`badge badge-${item.status?.toLowerCase()}`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>

                                        <h3>
                                            {item.title}
                                        </h3>

                                        <p className="my-item-description">
                                            {item.description}
                                        </p>

                                        <p className="my-item-location">
                                            {item.location_name ||
                                                "Location not specified"}
                                        </p>

                                        <div className="my-item-actions">
                                            <Link
                                                to={`/items/${item.id}`}
                                                className="btn btn-secondary"
                                            >
                                                View
                                            </Link>

                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={() =>
                                                    navigate(
                                                        `/items/${item.id}/edit`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() =>
                                                    handleDelete(
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
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyItems;