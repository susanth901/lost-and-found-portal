import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    MapContainer,
    Marker,
    TileLayer,
} from "react-leaflet";

import Navbar from "../components/Navbar";
import API_URL from "../config/api";

function ItemDetails() {
    const { id } = useParams();

    const [item, setItem] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [claimMessage, setClaimMessage] =
        useState("");

    const [claimLoading, setClaimLoading] =
        useState(false);

    const currentUser = useMemo(() => {
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

    const loadItem = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/items/${id}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to load item"
                );
            }

            const loadedItem =
                data.data?.item ||
                data.item ||
                data.data ||
                data;

            const images =
                loadedItem.images ||
                data.images ||
                data.data?.images ||
                [];

            setItem({
                ...loadedItem,
                images,
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItem();
    }, [id]);

    const submitClaim = async (
        event
    ) => {
        event.preventDefault();

        try {
            setClaimLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/claims`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        itemId: id,
                        message:
                            claimMessage,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to submit claim"
                );
            }

            setClaimMessage("");

            window.alert(
                "Claim submitted successfully."
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setClaimLoading(false);
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

    if (!item) {
        return (
            <div className="page">
                <Navbar />

                <main className="page-shell">
                    <div className="alert alert-error">
                        {error ||
                            "Item not found"}
                    </div>
                </main>
            </div>
        );
    }

    const isOwner =
        currentUser?.id ===
        item.user_id;

    const primaryImage =
        item.images?.[0]?.image_url ||
        item.primary_image ||
        item.image_url;

    const latitude =
        Number(item.latitude);

    const longitude =
        Number(item.longitude);

    const hasCoordinates =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude);

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="details-layout">
                    <section>
                        <div className="card card-body">
                            {primaryImage && (
                                <img
                                    className="details-image"
                                    src={getImageUrl(
                                        primaryImage
                                    )}
                                    alt={
                                        item.title
                                    }
                                />
                            )}

                            {item.images?.length >
                                1 && (
                                <div className="gallery">
                                    {item.images.map(
                                        (
                                            image
                                        ) => (
                                            <img
                                                key={
                                                    image.id
                                                }
                                                src={getImageUrl(
                                                    image.image_url
                                                )}
                                                alt={
                                                    item.title
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    gap: "10px",
                                    marginTop:
                                        "22px",
                                }}
                            >
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

                            <h1
                                style={{
                                    margin:
                                        "18px 0 10px",
                                }}
                            >
                                {item.title}
                            </h1>

                            <p
                                style={{
                                    color:
                                        "#6b7280",
                                    lineHeight: 1.7,
                                }}
                            >
                                {item.description}
                            </p>

                            <div className="meta-grid">
                                <div className="meta-item">
                                    <span className="meta-label">
                                        Location
                                    </span>

                                    <span className="meta-value">
                                        {item.location_name ||
                                            "Not specified"}
                                    </span>
                                </div>

                                <div className="meta-item">
                                    <span className="meta-label">
                                        Date
                                    </span>

                                    <span className="meta-value">
                                        {item.date_occurred
                                            ? new Date(
                                                  item.date_occurred
                                              ).toLocaleDateString()
                                            : "Not specified"}
                                    </span>
                                </div>

                                <div className="meta-item">
                                    <span className="meta-label">
                                        Category
                                    </span>

                                    <span className="meta-value">
                                        {item.category_name ||
                                            "Other"}
                                    </span>
                                </div>

                                <div className="meta-item">
                                    <span className="meta-label">
                                        Contact
                                    </span>

                                    <span className="meta-value">
                                        {item.contact_preference ||
                                            "IN_APP"}
                                    </span>
                                </div>
                            </div>

                            {hasCoordinates && (
                                <div
                                    style={{
                                        height:
                                            "320px",
                                        overflow:
                                            "hidden",
                                        borderRadius:
                                            "12px",
                                    }}
                                >
                                    <MapContainer
                                        center={[
                                            latitude,
                                            longitude,
                                        ]}
                                        zoom={15}
                                        style={{
                                            height:
                                                "100%",
                                            width:
                                                "100%",
                                        }}
                                    >
                                        <TileLayer
                                            attribution='&copy; OpenStreetMap contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        <Marker
                                            position={[
                                                latitude,
                                                longitude,
                                            ]}
                                        />
                                    </MapContainer>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="details-sidebar">
                        <div className="card card-body">
                            {isOwner ? (
                                <>
                                    <h3>
                                        Your Item
                                    </h3>

                                    <p
                                        style={{
                                            color:
                                                "#6b7280",
                                        }}
                                    >
                                        You reported
                                        this item.
                                    </p>

                                    <Link
                                        to={`/items/${id}/edit`}
                                        className="btn btn-primary"
                                        style={{
                                            width:
                                                "100%",
                                        }}
                                    >
                                        Edit Item
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <h3>
                                        Think this is
                                        yours?
                                    </h3>

                                    <p
                                        style={{
                                            color:
                                                "#6b7280",
                                            lineHeight:
                                                1.6,
                                        }}
                                    >
                                        Submit a claim
                                        with details
                                        that can help
                                        the owner verify
                                        you.
                                    </p>

                                    <form
                                        onSubmit={
                                            submitClaim
                                        }
                                    >
                                        <textarea
                                            className="form-control"
                                            value={
                                                claimMessage
                                            }
                                            minLength={
                                                5
                                            }
                                            maxLength={
                                                2000
                                            }
                                            required
                                            placeholder="Describe why you believe this item belongs to you..."
                                            onChange={(
                                                event
                                            ) =>
                                                setClaimMessage(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                        <button
                                            className="btn btn-primary"
                                            disabled={
                                                claimLoading ||
                                                item.status !==
                                                    "ACTIVE"
                                            }
                                            style={{
                                                width:
                                                    "100%",
                                                marginTop:
                                                    "12px",
                                            }}
                                        >
                                            {claimLoading
                                                ? "Submitting..."
                                                : "Submit Claim"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default ItemDetails;