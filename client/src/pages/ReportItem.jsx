import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import LocationPicker from "../components/LocationPicker";
import API_URL from "../config/api";

function ReportItem() {
    const navigate = useNavigate();

    const [
        categories,
        setCategories,
    ] = useState([]);

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

    const [
        selectedImages,
        setSelectedImages,
    ] = useState([]);

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

                    if (!response.ok) {
                        return;
                    }

                    const list =
                        Array.isArray(
                            data
                        )
                            ? data
                            : data.data ||
                              data.categories ||
                              [];

                    if (
                        Array.isArray(
                            list
                        )
                    ) {
                        setCategories(
                            list
                        );

                        if (
                            list.length >
                            0
                        ) {
                            setForm(
                                (
                                    current
                                ) => ({
                                    ...current,

                                    categoryId:
                                        String(
                                            list[0]
                                                .id
                                        ),
                                })
                            );
                        }
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

    useEffect(() => {
        return () => {
            selectedImages.forEach(
                (image) => {
                    URL.revokeObjectURL(
                        image.preview
                    );
                }
            );
        };
    }, []);

    const updateField = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setForm(
            (current) => ({
                ...current,
                [name]: value,
            })
        );
    };

    const handleLocationChange = (
        location
    ) => {
        setForm(
            (current) => ({
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
            })
        );
    };

    const handleImages = (
        event
    ) => {
        const incomingFiles =
            Array.from(
                event.target.files ||
                    []
            );

        setError("");

        if (
            incomingFiles.length ===
            0
        ) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        const validFiles = [];

        for (const file of incomingFiles) {
            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {
                setError(
                    "Only JPEG, PNG and WEBP images are allowed."
                );

                continue;
            }

            if (
                file.size >
                5 * 1024 * 1024
            ) {
                setError(
                    `${file.name} is larger than 5 MB.`
                );

                continue;
            }

            validFiles.push(
                file
            );
        }

        const availableSlots =
            5 -
            selectedImages.length;

        if (
            validFiles.length >
            availableSlots
        ) {
            setError(
                "You can upload a maximum of 5 images."
            );
        }

        const filesToAdd =
            validFiles.slice(
                0,
                availableSlots
            );

        const newImages =
            filesToAdd.map(
                (file) => ({
                    id:
                        crypto.randomUUID(),

                    file,

                    preview:
                        URL.createObjectURL(
                            file
                        ),
                })
            );

        setSelectedImages(
            (current) => [
                ...current,
                ...newImages,
            ]
        );

        event.target.value =
            "";
    };

    const removeImage = (
        imageId
    ) => {
        setSelectedImages(
            (current) => {
                const image =
                    current.find(
                        (item) =>
                            item.id ===
                            imageId
                    );

                if (image) {
                    URL.revokeObjectURL(
                        image.preview
                    );
                }

                return current.filter(
                    (item) =>
                        item.id !==
                        imageId
                );
            }
        );
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
                form.title.trim()
            );

            body.append(
                "description",
                form.description.trim()
            );

            if (
                form.locationName
            ) {
                body.append(
                    "locationName",
                    form.locationName
                );
            }

            if (
                form.latitude !==
                    "" &&
                Number.isFinite(
                    Number(
                        form.latitude
                    )
                )
            ) {
                body.append(
                    "latitude",
                    form.latitude
                );
            }

            if (
                form.longitude !==
                    "" &&
                Number.isFinite(
                    Number(
                        form.longitude
                    )
                )
            ) {
                body.append(
                    "longitude",
                    form.longitude
                );
            }

            if (
                form.dateOccurred
            ) {
                body.append(
                    "dateOccurred",
                    form.dateOccurred
                );
            }

            body.append(
                "contactPreference",
                form.contactPreference
            );

            selectedImages.forEach(
                (image) => {
                    body.append(
                        "images",
                        image.file
                    );
                }
            );

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
                const validationMessage =
                    data.errors
                        ?.map(
                            (item) =>
                                item.msg ||
                                item.message
                        )
                        .join(", ");

                throw new Error(
                    validationMessage ||
                        data.message ||
                        "Unable to report item"
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
            console.error(
                "Report item error:",
                error
            );

            setError(
                error.message
            );
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
                        Add details about
                        a lost or found
                        item.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form
                    className="card card-body"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div
                        style={{
                            display:
                                "grid",

                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",

                            gap:
                                "14px",
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
                            name="title"
                            className="form-control"
                            value={
                                form.title
                            }
                            onChange={
                                updateField
                            }
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
                            onChange={
                                updateField
                            }
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
                                .slice(
                                    0,
                                    10
                                )}
                            onChange={
                                updateField
                            }
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

                        {selectedImages.length <
                            5 && (
                            <label
                                className="btn btn-secondary"
                                style={{
                                    display:
                                        "inline-flex",

                                    cursor:
                                        "pointer",

                                    marginBottom:
                                        "16px",
                                }}
                            >
                                Add Images

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={
                                        handleImages
                                    }
                                    style={{
                                        display:
                                            "none",
                                    }}
                                />
                            </label>
                        )}

                        {selectedImages.length >
                            0 && (
                            <div
                                style={{
                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(150px, 1fr))",

                                    gap:
                                        "14px",

                                    marginBottom:
                                        "12px",
                                }}
                            >
                                {selectedImages.map(
                                    (
                                        image
                                    ) => (
                                        <div
                                            key={
                                                image.id
                                            }
                                            style={{
                                                border:
                                                    "1px solid #e5e7eb",

                                                borderRadius:
                                                    "12px",

                                                overflow:
                                                    "hidden",

                                                background:
                                                    "#fff",
                                            }}
                                        >
                                            <img
                                                src={
                                                    image.preview
                                                }
                                                alt="Selected"
                                                style={{
                                                    width:
                                                        "100%",

                                                    height:
                                                        "140px",

                                                    objectFit:
                                                        "cover",

                                                    display:
                                                        "block",
                                                }}
                                            />

                                            <div
                                                style={{
                                                    padding:
                                                        "10px",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        margin:
                                                            "0 0 4px",

                                                        fontSize:
                                                            "0.82rem",

                                                        overflow:
                                                            "hidden",

                                                        textOverflow:
                                                            "ellipsis",

                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    {
                                                        image
                                                            .file
                                                            .name
                                                    }
                                                </p>

                                                <p
                                                    style={{
                                                        margin:
                                                            "0 0 10px",

                                                        color:
                                                            "#6b7280",

                                                        fontSize:
                                                            "0.75rem",
                                                    }}
                                                >
                                                    {(
                                                        image
                                                            .file
                                                            .size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(
                                                        2
                                                    )}{" "}
                                                    MB
                                                </p>

                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    style={{
                                                        width:
                                                            "100%",
                                                    }}
                                                    onClick={() =>
                                                        removeImage(
                                                            image.id
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {selectedImages.length >
                            0 && (
                            <p
                                style={{
                                    margin: 0,

                                    color:
                                        "#6b7280",

                                    fontSize:
                                        "0.85rem",
                                }}
                            >
                                {
                                    selectedImages.length
                                }
                                /5 images
                                selected
                            </p>
                        )}
                    </div>

                    <button
                        className="btn btn-primary"
                        disabled={
                            loading
                        }
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