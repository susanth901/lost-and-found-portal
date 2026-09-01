import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import ItemSkeleton from "../components/ItemSkeleton";

function Dashboard() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("ACTIVE");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

        if (Array.isArray(data.data?.items)) {
            return data.data.items;
        }

        if (Array.isArray(data.results)) {
            return data.results;
        }

        return [];
    };

    const extractTotalPages = (data) => {
        return Number(
            data.totalPages ||
                data.total_pages ||
                data.pagination?.totalPages ||
                data.pagination?.total_pages ||
                data.data?.totalPages ||
                data.data?.total_pages ||
                data.data?.pagination?.totalPages ||
                1
        );
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(
                `${API}/api/categories`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return;
            }

            let categoryList = [];

            if (Array.isArray(data)) {
                categoryList = data;
            } else if (Array.isArray(data.data)) {
                categoryList = data.data;
            } else if (
                Array.isArray(data.categories)
            ) {
                categoryList = data.categories;
            } else if (
                Array.isArray(
                    data.data?.categories
                )
            ) {
                categoryList =
                    data.data.categories;
            }

            setCategories(categoryList);
        } catch (error) {
            console.error(
                "Failed to load categories:",
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

            const currentSearch =
                overrides.search !== undefined
                    ? overrides.search
                    : search;

            const currentType =
                overrides.type !== undefined
                    ? overrides.type
                    : type;

            const currentCategory =
                overrides.category !== undefined
                    ? overrides.category
                    : category;

            const currentStatus =
                overrides.status !== undefined
                    ? overrides.status
                    : status;

            const params =
                new URLSearchParams();

            if (currentSearch.trim()) {
                params.set(
                    "search",
                    currentSearch.trim()
                );
            }

            if (currentType) {
                params.set(
                    "type",
                    currentType
                );
            }

            if (currentCategory) {
                params.set(
                    "category",
                    currentCategory
                );
            }

            if (currentStatus) {
                params.set(
                    "status",
                    currentStatus
                );
            }

            params.set(
                "page",
                String(requestedPage)
            );

            params.set("limit", "9");

            const response = await fetch(
                `${API}/api/items?${params.toString()}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            console.log(
                "Dashboard items response:",
                data
            );

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to load items"
                );
            }

            const itemList =
                extractItems(data);

            console.log(
                "Dashboard extracted items:",
                itemList
            );

            setItems(itemList);

            setTotalPages(
                extractTotalPages(data)
            );
        } catch (error) {
            console.error(
                "Dashboard error:",
                error
            );

            setError(error.message);
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

    const handleSearch = (event) => {
        event.preventDefault();

        if (page !== 1) {
            setPage(1);
            return;
        }

        fetchItems(1);
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
                        Find what was lost.
                    </h1>

                    <p>
                        Browse reported lost and
                        found items, search by
                        category or location, and
                        help return belongings to
                        their owners.
                    </p>

                    <div className="dashboard-actions">
                        <Link
                            to="/report"
                            className="btn btn-primary"
                        >
                            Report an Item
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
                    onSubmit={handleSearch}
                >
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search items..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    <select
                        className="form-control"
                        value={type}
                        onChange={(event) => {
                            setType(
                                event.target.value
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
                        value={category}
                        onChange={(event) => {
                            setCategory(
                                event.target.value
                            );

                            setPage(1);
                        }}
                    >
                        <option value="">
                            All Categories
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        className="form-control"
                        value={status}
                        onChange={(event) => {
                            setStatus(
                                event.target.value
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

                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={clearFilters}
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
                            (_, index) => (
                                <ItemSkeleton
                                    key={index}
                                />
                            )
                        )}
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <h3>
                            No items found
                        </h3>

                        <p>
                            Try changing your
                            search or filters.
                        </p>
                    </div>
                ) : (
                    <div className="items-grid">
                        {items.map((item) => {
                            const image =
                                getImageUrl(
                                    item.primary_image ||
                                        item.primary_image_url ||
                                        item.image_url
                                );

                            return (
                                <Link
                                    to={`/items/${item.id}`}
                                    className="item-card"
                                    key={item.id}
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={
                                                item.title
                                            }
                                            className="item-card-image"
                                        />
                                    ) : (
                                        <div className="item-card-no-image">
                                            No image
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

                                        <p>
                                            {item.description}
                                        </p>

                                        <div className="item-card-footer">
                                            <span>
                                                {item.location_name ||
                                                    "No location"}
                                            </span>

                                            <span>
                                                {item.date_occurred
                                                    ? new Date(
                                                          item.date_occurred
                                                      ).toLocaleDateString()
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {!loading &&
                    totalPages > 1 && (
                        <div className="pagination">
                            <button
                                type="button"
                                disabled={
                                    page === 1
                                }
                                onClick={() =>
                                    setPage(
                                        page - 1
                                    )
                                }
                            >
                                Previous
                            </button>

                            {Array.from(
                                {
                                    length:
                                        totalPages,
                                },
                                (_, index) =>
                                    index + 1
                            ).map(
                                (pageNumber) => (
                                    <button
                                        type="button"
                                        key={
                                            pageNumber
                                        }
                                        className={
                                            pageNumber ===
                                            page
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setPage(
                                                pageNumber
                                            )
                                        }
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                disabled={
                                    page ===
                                    totalPages
                                }
                                onClick={() =>
                                    setPage(
                                        page + 1
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