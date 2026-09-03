import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import ItemSkeleton from "../components/ItemSkeleton";
import API_URL from "../config/api";

function Dashboard() {
    const [items, setItems] =
        useState([]);

    const [
        categories,
        setCategories,
    ] = useState([]);

    const [search, setSearch] =
        useState("");

    const [type, setType] =
        useState("");

    const [
        category,
        setCategory,
    ] = useState("");

    const [status, setStatus] =
        useState("ACTIVE");

    const [page, setPage] =
        useState(1);

    const [
        totalPages,
        setTotalPages,
    ] = useState(1);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const getImageUrl = (
        image
    ) => {
        if (!image) {
            return null;
        }

        if (
            image.startsWith(
                "http://"
            ) ||
            image.startsWith(
                "https://"
            )
        ) {
            return image;
        }

        return `${API_URL}${image}`;
    };

    const extractItems = (
        data
    ) => {
        if (Array.isArray(data))
            return data;

        if (
            Array.isArray(
                data.items
            )
        )
            return data.items;

        if (
            Array.isArray(
                data.data
            )
        )
            return data.data;

        if (
            Array.isArray(
                data.data?.items
            )
        )
            return data.data.items;

        return [];
    };

    const fetchCategories =
        async () => {
            try {
                const response =
                    await fetch(
                        `${API_URL}/api/categories`,
                        {
                            credentials:
                                "include",
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok)
                    return;

                if (
                    Array.isArray(
                        data
                    )
                ) {
                    setCategories(
                        data
                    );
                } else if (
                    Array.isArray(
                        data.data
                    )
                ) {
                    setCategories(
                        data.data
                    );
                } else if (
                    Array.isArray(
                        data.categories
                    )
                ) {
                    setCategories(
                        data.categories
                    );
                }
            } catch (error) {
                console.error(
                    error
                );
            }
        };

    const fetchItems = async (
        requestedPage = page,
        overrides = {}
    ) => {
        try {
            setLoading(true);
            setError("");

            const params =
                new URLSearchParams();

            const currentSearch =
                overrides.search ??
                search;

            const currentType =
                overrides.type ??
                type;

            const currentCategory =
                overrides.category ??
                category;

            const currentStatus =
                overrides.status ??
                status;

            if (
                currentSearch.trim()
            ) {
                params.set(
                    "search",
                    currentSearch.trim()
                );
            }

            if (currentType)
                params.set(
                    "type",
                    currentType
                );

            if (currentCategory)
                params.set(
                    "category",
                    currentCategory
                );

            if (currentStatus)
                params.set(
                    "status",
                    currentStatus
                );

            params.set(
                "page",
                requestedPage
            );

            params.set(
                "limit",
                "9"
            );

            const response =
                await fetch(
                    `${API_URL}/api/items?${params.toString()}`,
                    {
                        credentials:
                            "include",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to load items"
                );
            }

            setItems(
                extractItems(data)
            );

            setTotalPages(
                Number(
                    data.totalPages ||
                        data.total_pages ||
                        data.pagination
                            ?.totalPages ||
                        data.data
                            ?.totalPages ||
                        data.data
                            ?.pagination
                            ?.totalPages ||
                        1
                )
            );
        } catch (error) {
            setError(
                error.message
            );

            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchItems(page);
    }, [
        page,
        type,
        category,
        status,
    ]);

    const handleSearch = (
        event
    ) => {
        event.preventDefault();

        if (page !== 1) {
            setPage(1);
        } else {
            fetchItems(1);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setType("");
        setCategory("");
        setStatus("ACTIVE");
        setPage(1);

        fetchItems(1, {
            search: "",
            type: "",
            category: "",
            status: "ACTIVE",
        });
    };

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <section className="dashboard-hero">
                    <h1>
                        Find what was
                        lost.
                    </h1>

                    <p>
                        Browse reported
                        lost and found
                        items and help
                        return belongings
                        to their owners.
                    </p>

                    <div className="dashboard-actions">
                        <Link
                            to="/report"
                            className="btn btn-primary"
                        >
                            Report an
                            Item
                        </Link>

                        <Link
                            to="/my-items"
                            className="btn btn-secondary"
                        >
                            My Items
                        </Link>
                    </div>
                </section>

                <form
                    className="toolbar"
                    onSubmit={
                        handleSearch
                    }
                >
                    <input
                        className="form-control"
                        value={search}
                        placeholder="Search items..."
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event
                                    .target
                                    .value
                            )
                        }
                    />

                    <select
                        className="form-control"
                        value={type}
                        onChange={(
                            event
                        ) => {
                            setType(
                                event
                                    .target
                                    .value
                            );
                            setPage(1);
                        }}
                    >
                        <option value="">
                            All Types
                        </option>
                        <option value="LOST">
                            Lost
                        </option>
                        <option value="FOUND">
                            Found
                        </option>
                    </select>

                    <select
                        className="form-control"
                        value={
                            category
                        }
                        onChange={(
                            event
                        ) => {
                            setCategory(
                                event
                                    .target
                                    .value
                            );
                            setPage(1);
                        }}
                    >
                        <option value="">
                            All
                            Categories
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={
                                        item.id
                                    }
                                    value={
                                        item.id
                                    }
                                >
                                    {
                                        item.name
                                    }
                                </option>
                            )
                        )}
                    </select>

                    <select
                        className="form-control"
                        value={status}
                        onChange={(
                            event
                        ) => {
                            setStatus(
                                event
                                    .target
                                    .value
                            );
                            setPage(1);
                        }}
                    >
                        <option value="">
                            All Status
                        </option>
                        <option value="ACTIVE">
                            Active
                        </option>
                        <option value="CLAIMED">
                            Claimed
                        </option>
                        <option value="RESOLVED">
                            Resolved
                        </option>
                        <option value="CLOSED">
                            Closed
                        </option>
                    </select>

                    <button className="btn btn-primary">
                        Search
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={
                            clearFilters
                        }
                    >
                        Clear
                    </button>
                </form>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="items-grid">
                        {Array.from({
                            length: 6,
                        }).map(
                            (
                                _,
                                index
                            ) => (
                                <ItemSkeleton
                                    key={
                                        index
                                    }
                                />
                            )
                        )}
                    </div>
                ) : items.length ===
                  0 ? (
                    <div className="empty-state">
                        <h3>
                            No items
                            found
                        </h3>
                    </div>
                ) : (
                    <div className="items-grid">
                        {items.map(
                            (item) => {
                                const image =
                                    getImageUrl(
                                        item.primary_image ||
                                            item.primary_image_url ||
                                            item.image_url
                                    );

                                return (
                                    <Link
                                        key={
                                            item.id
                                        }
                                        to={`/items/${item.id}`}
                                        className="item-card"
                                    >
                                        {image ? (
                                            <img
                                                src={
                                                    image
                                                }
                                                alt={
                                                    item.title
                                                }
                                                className="item-card-image"
                                            />
                                        ) : (
                                            <div className="item-card-no-image">
                                                No
                                                image
                                            </div>
                                        )}

                                        <div className="item-card-content">
                                            <div className="item-card-top">
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

                                            <p>
                                                {
                                                    item.description
                                                }
                                            </p>

                                            <div className="item-card-footer">
                                                <span>
                                                    {item.location_name ||
                                                        "No location"}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }
                        )}
                    </div>
                )}

                {totalPages >
                    1 && (
                    <div className="pagination">
                        <button
                            disabled={
                                page <=
                                1
                            }
                            onClick={() =>
                                setPage(
                                    page -
                                        1
                                )
                            }
                        >
                            Previous
                        </button>

                        <span>
                            {page} /{" "}
                            {
                                totalPages
                            }
                        </span>

                        <button
                            disabled={
                                page >=
                                totalPages
                            }
                            onClick={() =>
                                setPage(
                                    page +
                                        1
                                )
                            }
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;