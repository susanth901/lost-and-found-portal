import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import LocationPicker from "../components/LocationPicker";
import API_URL from "../config/api";

function ReportItem() {
    const navigate = useNavigate();

    const [categories, setCategories] =
        useState([]);

    const [form, setForm] =
        useState({
            categoryId: "",
            type: "LOST",
            title: "",
            description: "",
            locationName: "",
            latitude: "",
            longitude: "",
            dateOccurred: "",
            contactPreference:
                "IN_APP",
        });

    const [files, setFiles] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadCategories =
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

                    const list =
                        Array.isArray(
                            data
                        )
                            ? data
                            : data.data ||
                              data.categories ||
                              [];

                    setCategories(
                        Array.isArray(
                            list
                        )
                            ? list
                            : []
                    );

                    if (
                        list.length >
                        0
                    ) {
                        setForm(
                            (current) => ({
                                ...current,
                                categoryId:
                                    String(
                                        list[0]
                                            .id
                                    ),
                            })
                        );
                    }
                } catch (error) {
                    console.error(
                        "Category load error:",
                        error
                    );
                }
            };

        loadCategories();
    }, []);

    const updateField = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleLocationChange = (
        location
    ) => {
        setForm((current) => ({
            ...current,
            locationName:
                location.locationName ??
                location.name ??
                current.locationName,
            latitude:
                location.latitude ??
                location.lat ??
                "",
            longitude:
                location.longitude ??
                location.lng ??
                "",
        }));
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const body =
                new FormData();

            body.append(
                "categoryId",
                form.categoryId
            );

            body.append(
                "type",
                form.type
            );

            body.append(
                "title",
                form.title
            );

            body.append(
                "description",
                form.description
            );

            body.append(
                "locationName",
                form.locationName
            );

            if (form.latitude) {
                body.append(
                    "latitude",
                    form.latitude
                );
            }

            if (form.longitude) {
                body.append(
                    "longitude",
                    form.longitude
                );
            }

            body.append(
                "dateOccurred",
                form.dateOccurred
            );

            body.append(
                "contactPreference",
                form.contactPreference
            );

            files.forEach((file) => {
                body.append(
                    "images",
                    file
                );
            });

            const response =
                await fetch(
                    `${API_URL}/api/items`,
                    {
                        method: "POST",
                        credentials:
                            "include",
                        body,
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                const validation =
                    data.errors
                        ?.map(
                            (item) =>
                                item.msg ||
                                item.message
                        )
                        .join(", ");

                throw new Error(
                    validation ||
                        data.message ||
                        "Unable to create item"
                );
            }

            const createdItem =
                data.data ||
                data.item;

            if (
                createdItem?.id
            ) {
                navigate(
                    `/items/${createdItem.id}`
                );
            } else {
                navigate(
                    "/my-items"
                );
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <h1>
                        Report an Item
                    </h1>

                    <p>
                        Add details about a lost
                        or found item.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form
                    className="card card-body"
                    onSubmit={handleSubmit}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                            gap: "14px",
                        }}
                    >
                        <div className="form-group">
                            <label className="form-label">
                                Type
                            </label>

                            <select
                                name="type"
                                className="form-control"
                                value={
                                    form.type
                                }
                                onChange={
                                    updateField
                                }
                            >
                                <option value="LOST">
                                    Lost
                                </option>

                                <option value="FOUND">
                                    Found
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Category
                            </label>

                            <select
                                name="categoryId"
                                className="form-control"
                                value={
                                    form.categoryId
                                }
                                onChange={
                                    updateField
                                }
                                required
                            >
                                {categories.map(
                                    (
                                        category
                                    ) => (
                                        <option
                                            value={
                                                category.id
                                            }
                                            key={
                                                category.id
                                            }
                                        >
                                            {
                                                category.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Title
                        </label>

                        <input
                            name="title"
                            className="form-control"
                            value={form.title}
                            onChange={updateField}
                            placeholder="e.g. Black wallet"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Description
                        </label>

                        <textarea
                            name="description"
                            className="form-control"
                            value={
                                form.description
                            }
                            onChange={updateField}
                            placeholder="Describe the item..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Date
                        </label>

                        <input
                            type="date"
                            name="dateOccurred"
                            className="form-control"
                            value={
                                form.dateOccurred
                            }
                            max={new Date()
                                .toISOString()
                                .slice(0, 10)}
                            onChange={updateField}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Location
                        </label>

                        <LocationPicker
                            value={{
                                locationName:
                                    form.locationName,
                                latitude:
                                    form.latitude,
                                longitude:
                                    form.longitude,
                            }}
                            onChange={
                                handleLocationChange
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Images
                        </label>

                        <input
                            type="file"
                            className="form-control"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(event) =>
                                setFiles(
                                    Array.from(
                                        event.target
                                            .files
                                    ).slice(
                                        0,
                                        5
                                    )
                                )
                            }
                        />

                        <small
                            style={{
                                color:
                                    "#6b7280",
                            }}
                        >
                            Maximum 5 images.
                            JPEG, PNG or WEBP.
                        </small>
                    </div>

                    <button
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Submitting..."
                            : "Report Item"}
                    </button>
                </form>
            </main>
        </div>
    );
}

export default ReportItem;