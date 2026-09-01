import { useState } from "react";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import LocationPicker from "../components/LocationPicker";

function ReportItem() {
    const navigate =
        useNavigate();

    const [searchParams] =
        useSearchParams();

    const initialType =
        searchParams.get(
            "type"
        ) === "FOUND"
            ? "FOUND"
            : "LOST";

    const [
        categoryId,
        setCategoryId,
    ] = useState("1");

    const [type, setType] =
        useState(initialType);

    const [title, setTitle] =
        useState("");

    const [
        description,
        setDescription,
    ] = useState("");

    const [
        locationName,
        setLocationName,
    ] = useState("");

    const [
        latitude,
        setLatitude,
    ] = useState("");

    const [
        longitude,
        setLongitude,
    ] = useState("");

    const [
        dateOccurred,
        setDateOccurred,
    ] = useState("");

    const [
        contactPreference,
        setContactPreference,
    ] = useState("IN_APP");

    const [images, setImages] =
        useState([]);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const categories = [
        { id: 1, name: "Electronics" },
        { id: 2, name: "Wallets & Bags" },
        {
            id: 3,
            name:
                "ID Cards & Documents",
        },
        { id: 4, name: "Keys" },
        { id: 5, name: "Clothing" },
        { id: 6, name: "Books" },
        { id: 7, name: "Accessories" },
        { id: 8, name: "Other" },
    ];

    const handleImageChange = (
        e
    ) => {
        const selected =
            Array.from(
                e.target.files ||
                    []
            );

        if (
            selected.length > 5
        ) {
            setError(
                "Maximum 5 images are allowed"
            );
            return;
        }

        setImages(selected);
        setError("");
    };

    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const form =
                new FormData();

            form.append(
                "categoryId",
                categoryId
            );

            form.append(
                "type",
                type
            );

            form.append(
                "title",
                title.trim()
            );

            form.append(
                "description",
                description.trim()
            );

            if (
                locationName.trim()
            ) {
                form.append(
                    "locationName",
                    locationName.trim()
                );
            }

            if (
                latitude !== ""
            ) {
                form.append(
                    "latitude",
                    latitude
                );
            }

            if (
                longitude !== ""
            ) {
                form.append(
                    "longitude",
                    longitude
                );
            }

            if (dateOccurred) {
                form.append(
                    "dateOccurred",
                    dateOccurred
                );
            }

            form.append(
                "contactPreference",
                contactPreference
            );

            images.forEach(
                (image) =>
                    form.append(
                        "images",
                        image
                    )
            );

            const response =
                await fetch(
                    "http://localhost:5000/api/items",
                    {
                        method:
                            "POST",
                        credentials:
                            "include",
                        body: form,
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to report item"
                );
            }

            navigate(
                `/items/${data.data.id}`
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main
                className="page-shell"
                style={{
                    maxWidth:
                        "820px",
                }}
            >
                <div className="page-header">
                    <h1 className="page-title">
                        Report an item
                    </h1>

                    <p className="page-subtitle">
                        Add clear details
                        so the right person
                        can identify it
                        quickly.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="card"
                >
                    <div className="card-body">
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">
                                    Type
                                </label>

                                <select
                                    className="form-control"
                                    value={
                                        type
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setType(
                                            e
                                                .target
                                                .value
                                        )
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
                                    className="form-control"
                                    value={
                                        categoryId
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCategoryId(
                                            e
                                                .target
                                                .value
                                        )
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
                                Title
                            </label>

                            <input
                                className="form-control"
                                type="text"
                                placeholder="Black AirPods Pro"
                                value={
                                    title
                                }
                                onChange={(
                                    e
                                ) =>
                                    setTitle(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Description
                            </label>

                            <textarea
                                className="form-control"
                                placeholder="Mention identifying details, where you last saw it, scratches, stickers, color, etc."
                                value={
                                    description
                                }
                                onChange={(
                                    e
                                ) =>
                                    setDescription(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">
                                    Location
                                    Name
                                </label>

                                <input
                                    className="form-control"
                                    value={
                                        locationName
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setLocationName(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Library, Block 3..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Date
                                </label>

                                <input
                                    className="form-control"
                                    type="date"
                                    value={
                                        dateOccurred
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setDateOccurred(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    max={
                                        new Date()
                                            .toISOString()
                                            .split(
                                                "T"
                                            )[0]
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Pin location
                            </label>

                            <LocationPicker
                                latitude={
                                    latitude
                                }
                                longitude={
                                    longitude
                                }
                                onLocationChange={(
                                    lat,
                                    lng
                                ) => {
                                    setLatitude(
                                        String(
                                            lat
                                        )
                                    );
                                    setLongitude(
                                        String(
                                            lng
                                        )
                                    );
                                }}
                                onLocationNameChange={
                                    setLocationName
                                }
                            />
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">
                                    Contact
                                    preference
                                </label>

                                <select
                                    className="form-control"
                                    value={
                                        contactPreference
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setContactPreference(
                                            e
                                                .target
                                                .value
                                        )
                                    }
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
                                    Images
                                </label>

                                <input
                                    className="form-control"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={
                                        handleImageChange
                                    }
                                />
                            </div>
                        </div>

                        {images.length >
                            0 && (
                            <p className="muted">
                                {
                                    images.length
                                }{" "}
                                image(s)
                                selected
                            </p>
                        )}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                                marginTop:
                                    "8px",
                            }}
                        >
                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Publishing..."
                                    : "Publish Report"}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </>
    );
}

export default ReportItem;