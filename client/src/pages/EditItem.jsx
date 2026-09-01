import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";

function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        categoryId: "",
        type: "LOST",
        title: "",
        description: "",
        locationName: "",
        latitude: "",
        longitude: "",
        dateOccurred: "",
        contactPreference: "IN_APP",
        status: "ACTIVE",
    });

    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const categories = [
        { id: 1, name: "Electronics" },
        { id: 2, name: "Wallets & Bags" },
        { id: 3, name: "ID Cards & Documents" },
        { id: 4, name: "Keys" },
        { id: 5, name: "Clothing" },
        { id: 6, name: "Books" },
        { id: 7, name: "Accessories" },
        { id: 8, name: "Other" },
    ];

    const fetchItem = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/items/${id}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load item"
                );
            }

            const item = data.data;

            setFormData({
                categoryId: String(item.category_id || ""),
                type: item.type || "LOST",
                title: item.title || "",
                description: item.description || "",
                locationName: item.location_name || "",
                latitude: item.latitude ?? "",
                longitude: item.longitude ?? "",
                dateOccurred: item.date_occurred
                    ? item.date_occurred.slice(0, 10)
                    : "",
                contactPreference:
                    item.contact_preference || "IN_APP",
                status: item.status || "ACTIVE",
            });

            setImages(item.images || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItem();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/items/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update item"
                );
            }

            navigate(`/items/${id}`);
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleNewImages = (e) => {
        const selected = Array.from(e.target.files || []);

        if (images.length + selected.length > 5) {
            setError(
                `You can only upload ${
                    5 - images.length
                } more image(s)`
            );
            return;
        }

        setNewImages(selected);
        setError("");
    };

    const handleAddImages = async () => {
        if (newImages.length === 0) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            const uploadData = new FormData();

            newImages.forEach((image) => {
                uploadData.append("images", image);
            });

            const response = await fetch(
                `http://localhost:5000/api/items/${id}/images`,
                {
                    method: "POST",
                    credentials: "include",
                    body: uploadData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to upload images"
                );
            }

            setImages((current) => [
                ...current,
                ...(data.data || []),
            ]);

            setNewImages([]);
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm("Delete this image?")) {
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/items/images/${imageId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete image"
                );
            }

            setImages((current) =>
                current.filter(
                    (image) => image.id !== imageId
                )
            );
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="page-shell">
                    <div className="empty-state">
                        Loading item...
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main
                className="page-shell"
                style={{
                    maxWidth: "850px",
                }}
            >
                <div className="page-header">
                    <h1 className="page-title">
                        Edit Item
                    </h1>

                    <p className="page-subtitle">
                        Update details, status, and images for
                        this report.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="card"
                >
                    <div className="card-body">
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">
                                    Category
                                </label>

                                <select
                                    className="form-control"
                                    name="categoryId"
                                    value={
                                        formData.categoryId
                                    }
                                    onChange={handleChange}
                                >
                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Type
                                </label>

                                <select
                                    className="form-control"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="LOST">
                                        Lost
                                    </option>

                                    <option value="FOUND">
                                        Found
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Title
                            </label>

                            <input
                                className="form-control"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Description
                            </label>

                            <textarea
                                className="form-control"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                required
                            />
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">
                                    Location
                                </label>

                                <input
                                    className="form-control"
                                    name="locationName"
                                    value={
                                        formData.locationName
                                    }
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Date
                                </label>

                                <input
                                    className="form-control"
                                    type="date"
                                    name="dateOccurred"
                                    value={
                                        formData.dateOccurred
                                    }
                                    onChange={handleChange}
                                    max={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">
                                    Contact Preference
                                </label>

                                <select
                                    className="form-control"
                                    name="contactPreference"
                                    value={
                                        formData.contactPreference
                                    }
                                    onChange={handleChange}
                                >
                                    <option value="IN_APP">
                                        In App
                                    </option>

                                    <option value="EMAIL">
                                        Email
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    className="form-control"
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={handleChange}
                                >
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
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "8px",
                            }}
                        >
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>

                <div
                    className="card"
                    style={{
                        marginTop: "24px",
                    }}
                >
                    <div className="card-body">
                        <h2
                            className="section-title"
                            style={{
                                fontSize: "1.2rem",
                            }}
                        >
                            Images
                        </h2>

                        <p className="muted">
                            Maximum 5 images per item.
                        </p>

                        {images.length === 0 ? (
                            <div className="empty-state">
                                No images uploaded.
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(150px, 1fr))",
                                    gap: "14px",
                                    marginTop: "18px",
                                }}
                            >
                                {images.map((image) => (
                                    <div
                                        key={image.id}
                                        style={{
                                            border:
                                                "1px solid #e5e7eb",
                                            borderRadius: "14px",
                                            overflow: "hidden",
                                            background:
                                                "#ffffff",
                                        }}
                                    >
                                        <img
                                            src={`http://localhost:5000${image.image_url}`}
                                            alt="Item"
                                            style={{
                                                width: "100%",
                                                height: "145px",
                                                objectFit:
                                                    "cover",
                                            }}
                                        />

                                        <div
                                            style={{
                                                padding: "10px",
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                style={{
                                                    width:
                                                        "100%",
                                                }}
                                                onClick={() =>
                                                    handleDeleteImage(
                                                        image.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < 5 && (
                            <>
                                <div className="divider" />

                                <div className="form-group">
                                    <label className="form-label">
                                        Add more images
                                    </label>

                                    <input
                                        className="form-control"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={
                                            handleNewImages
                                        }
                                    />
                                </div>

                                {newImages.length > 0 && (
                                    <p className="muted">
                                        {
                                            newImages.length
                                        }{" "}
                                        new image(s) selected
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleAddImages}
                                    disabled={
                                        saving ||
                                        newImages.length === 0
                                    }
                                >
                                    {saving
                                        ? "Uploading..."
                                        : "Upload Images"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

export default EditItem;