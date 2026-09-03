import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import API_URL from "../config/api";

function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        categoryId: "",
        type: "LOST",
        title: "",
        description: "",
        locationName: "",
        latitude: "",
        longitude: "",
        dateOccurred: "",
        status: "ACTIVE",
        contactPreference: "IN_APP",
    });

    const [categories, setCategories] =
        useState([]);

    const [images, setImages] =
        useState([]);

    const [newImages, setNewImages] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const getImageUrl = (image) => {
        if (!image) return "";

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `${API_URL}${image}`;
    };

    useEffect(() => {
        const loadPage = async () => {
            try {
                setLoading(true);

                const [
                    itemResponse,
                    categoryResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_URL}/api/items/${id}`,
                        {
                            credentials:
                                "include",
                        }
                    ),

                    fetch(
                        `${API_URL}/api/categories`,
                        {
                            credentials:
                                "include",
                        }
                    ),
                ]);

                const itemData =
                    await itemResponse.json();

                const categoryData =
                    await categoryResponse.json();

                if (!itemResponse.ok) {
                    throw new Error(
                        itemData.message ||
                            "Unable to load item"
                    );
                }

                const item =
                    itemData.data?.item ||
                    itemData.item ||
                    itemData.data ||
                    itemData;

                setForm({
                    categoryId:
                        item.category_id ||
                        item.categoryId ||
                        "",
                    type:
                        item.type ||
                        "LOST",
                    title:
                        item.title ||
                        "",
                    description:
                        item.description ||
                        "",
                    locationName:
                        item.location_name ||
                        item.locationName ||
                        "",
                    latitude:
                        item.latitude ??
                        "",
                    longitude:
                        item.longitude ??
                        "",
                    dateOccurred:
                        item.date_occurred
                            ? String(
                                  item.date_occurred
                              ).slice(0, 10)
                            : "",
                    status:
                        item.status ||
                        "ACTIVE",
                    contactPreference:
                        item.contact_preference ||
                        "IN_APP",
                });

                setImages(
                    item.images ||
                        itemData.images ||
                        itemData.data
                            ?.images ||
                        []
                );

                const categoryList =
                    Array.isArray(
                        categoryData
                    )
                        ? categoryData
                        : categoryData.data ||
                          categoryData.categories ||
                          [];

                setCategories(
                    Array.isArray(
                        categoryList
                    )
                        ? categoryList
                        : []
                );
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [id]);

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

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/items/${id}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials:
                            "include",

                        body: JSON.stringify(
                            {
                                categoryId:
                                    Number(
                                        form.categoryId
                                    ),
                                type:
                                    form.type,
                                title:
                                    form.title,
                                description:
                                    form.description,
                                locationName:
                                    form.locationName,
                                latitude:
                                    form.latitude
                                        ? Number(
                                              form.latitude
                                          )
                                        : null,
                                longitude:
                                    form.longitude
                                        ? Number(
                                              form.longitude
                                          )
                                        : null,
                                dateOccurred:
                                    form.dateOccurred,
                                status:
                                    form.status,
                                contactPreference:
                                    form.contactPreference,
                            }
                        ),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to update item"
                );
            }

            if (
                newImages.length >
                0
            ) {
                const imageData =
                    new FormData();

                newImages.forEach(
                    (file) => {
                        imageData.append(
                            "images",
                            file
                        );
                    }
                );

                const imageResponse =
                    await fetch(
                        `${API_URL}/api/items/${id}/images`,
                        {
                            method: "POST",
                            credentials:
                                "include",
                            body: imageData,
                        }
                    );

                const imageResult =
                    await imageResponse.json();

                if (
                    !imageResponse.ok
                ) {
                    throw new Error(
                        imageResult.message ||
                            "Item updated, but images could not be uploaded"
                    );
                }
            }

            navigate(
                `/items/${id}`
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteImage = async (
        imageId
    ) => {
        const confirmed =
            window.confirm(
                "Delete this image?"
            );

        if (!confirmed) return;

        try {
            const response =
                await fetch(
                    `${API_URL}/api/items/images/${imageId}`,
                    {
                        method: "DELETE",
                        credentials:
                            "include",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to delete image"
                );
            }

            setImages((current) =>
                current.filter(
                    (image) =>
                        image.id !==
                        imageId
                )
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
                    Loading item...
                </main>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <h1>Edit Item</h1>

                    <p>
                        Update the details of your
                        report.
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
                    <div className="form-group">
                        <label className="form-label">
                            Title
                        </label>

                        <input
                            name="title"
                            className="form-control"
                            value={form.title}
                            onChange={updateField}
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
                            required
                        />
                    </div>

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
                                value={form.type}
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
                            >
                                {categories.map(
                                    (
                                        category
                                    ) => (
                                        <option
                                            key={
                                                category.id
                                            }
                                            value={
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
                            Location
                        </label>

                        <input
                            name="locationName"
                            className="form-control"
                            value={
                                form.locationName
                            }
                            onChange={updateField}
                        />
                    </div>

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
                                Latitude
                            </label>

                            <input
                                name="latitude"
                                type="number"
                                step="any"
                                className="form-control"
                                value={
                                    form.latitude
                                }
                                onChange={
                                    updateField
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Longitude
                            </label>

                            <input
                                name="longitude"
                                type="number"
                                step="any"
                                className="form-control"
                                value={
                                    form.longitude
                                }
                                onChange={
                                    updateField
                                }
                            />
                        </div>
                    </div>

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
                                Date
                            </label>

                            <input
                                name="dateOccurred"
                                type="date"
                                className="form-control"
                                value={
                                    form.dateOccurred
                                }
                                onChange={
                                    updateField
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Status
                            </label>

                            <select
                                name="status"
                                className="form-control"
                                value={
                                    form.status
                                }
                                onChange={
                                    updateField
                                }
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

                    {images.length >
                        0 && (
                        <div className="form-group">
                            <label className="form-label">
                                Current Images
                            </label>

                            <div className="gallery">
                                {images.map(
                                    (image) => (
                                        <div
                                            key={
                                                image.id
                                            }
                                        >
                                            <img
                                                src={getImageUrl(
                                                    image.image_url
                                                )}
                                                alt=""
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                style={{
                                                    marginTop:
                                                        "6px",
                                                    width:
                                                        "100%",
                                                }}
                                                onClick={() =>
                                                    deleteImage(
                                                        image.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            Add Images
                        </label>

                        <input
                            className="form-control"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(event) =>
                                setNewImages(
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
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <button
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate(
                                    `/items/${id}`
                                )
                            }
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default EditItem;