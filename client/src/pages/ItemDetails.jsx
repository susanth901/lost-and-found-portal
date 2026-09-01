import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
    MapContainer,
    Marker,
    TileLayer,
} from "react-leaflet";

import Navbar from "../components/Navbar";

function ItemDetails() {
    const { id } = useParams();

    const [item, setItem] = useState(null);
    const [message, setMessage] = useState("");
    const [claimError, setClaimError] = useState("");
    const [claimLoading, setClaimLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(
                localStorage.getItem("user") || "null"
            );
        } catch {
            return null;
        }
    }, []);

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
                    data.message ||
                        "Failed to load item"
                );
            }

            setItem(data.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItem();
    }, [id]);

    const handleClaim = async (e) => {
        e.preventDefault();

        try {
            setClaimLoading(true);
            setClaimError("");

            if (message.trim().length < 5) {
                throw new Error(
                    "Claim message must be at least 5 characters"
                );
            }

            const response = await fetch(
                "http://localhost:5000/api/claims",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        itemId: id,
                        message: message.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to submit claim"
                );
            }

            setMessage("");

            alert(
                "Claim submitted successfully"
            );
        } catch (error) {
            setClaimError(error.message);
        } finally {
            setClaimLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="page-shell">
                    <div className="details-layout">
                        <div className="card">
                            <div
                                className="skeleton"
                                style={{
                                    height: "420px",
                                    borderRadius:
                                        "18px 18px 0 0",
                                }}
                            />

                            <div className="card-body">
                                <div className="skeleton skeleton-title" />
                                <div className="skeleton skeleton-text" />
                                <div className="skeleton skeleton-text" />
                                <div className="skeleton skeleton-text short" />
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body">
                                <div className="skeleton skeleton-title" />
                                <div className="skeleton skeleton-text" />
                                <div className="skeleton skeleton-text" />
                                <div className="skeleton skeleton-text" />
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />

                <main className="page-shell">
                    <div className="alert alert-error">
                        {error}
                    </div>
                </main>
            </>
        );
    }

    if (!item) {
        return null;
    }

    const isOwner =
        currentUser?.id === item.user_id;

    const hasCoordinates =
        item.latitude !== null &&
        item.latitude !== undefined &&
        item.longitude !== null &&
        item.longitude !== undefined;

    const primaryImage =
        item.images &&
        item.images.length > 0
            ? item.images[0]
            : null;

    const additionalImages =
        item.images?.slice(1) || [];

    return (
        <>
            <Navbar />

            <main className="page-shell">
                <div className="details-layout">

                    <section>
                        <div className="card">

                            {primaryImage ? (
                                <img
                                    src={`http://localhost:5000${primaryImage.image_url}`}
                                    alt={item.title}
                                    style={{
                                        width: "100%",
                                        height: "420px",
                                        objectFit: "cover",
                                        borderRadius:
                                            "18px 18px 0 0",
                                    }}
                                />
                            ) : (
                                <div
                                    className="item-placeholder"
                                    style={{
                                        height: "420px",
                                        borderRadius:
                                            "18px 18px 0 0",
                                    }}
                                >
                                    No image available
                                </div>
                            )}

                            <div className="card-body">

                                <div className="status-row">
                                    <span
                                        className={`badge ${
                                            item.type === "LOST"
                                                ? "badge-lost"
                                                : "badge-found"
                                        }`}
                                    >
                                        {item.type}
                                    </span>

                                    <span
                                        className={`badge ${
                                            item.status === "ACTIVE"
                                                ? "badge-active"
                                                : "badge-neutral"
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                <h1
                                    className="page-title"
                                    style={{
                                        fontSize: "2rem",
                                        marginTop: "14px",
                                    }}
                                >
                                    {item.title}
                                </h1>

                                <div className="divider" />

                                <h3 className="section-title">
                                    Description
                                </h3>

                                <p
                                    style={{
                                        marginTop: 0,
                                        lineHeight: 1.75,
                                        color: "#374151",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {item.description}
                                </p>

                                {additionalImages.length >
                                    0 && (
                                    <>
                                        <div className="divider" />

                                        <h3 className="section-title">
                                            More images
                                        </h3>

                                        <div className="image-gallery">
                                            {additionalImages.map(
                                                (image) => (
                                                    <img
                                                        key={
                                                            image.id
                                                        }
                                                        src={`http://localhost:5000${image.image_url}`}
                                                        alt={
                                                            item.title
                                                        }
                                                        style={{
                                                            width:
                                                                "100%",
                                                            height:
                                                                "150px",
                                                            objectFit:
                                                                "cover",
                                                            borderRadius:
                                                                "12px",
                                                        }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </>
                                )}

                                {hasCoordinates && (
                                    <>
                                        <div className="divider" />

                                        <h3 className="section-title">
                                            Location
                                        </h3>

                                        {item.location_name && (
                                            <p
                                                className="muted"
                                                style={{
                                                    marginTop:
                                                        "-4px",
                                                }}
                                            >
                                                {
                                                    item.location_name
                                                }
                                            </p>
                                        )}

                                        <div
                                            style={{
                                                borderRadius:
                                                    "14px",
                                                overflow:
                                                    "hidden",
                                                border:
                                                    "1px solid #e5e7eb",
                                            }}
                                        >
                                            <MapContainer
                                                center={[
                                                    Number(
                                                        item.latitude
                                                    ),
                                                    Number(
                                                        item.longitude
                                                    ),
                                                ]}
                                                zoom={16}
                                                scrollWheelZoom={
                                                    false
                                                }
                                                style={{
                                                    height:
                                                        "320px",
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
                                                        Number(
                                                            item.latitude
                                                        ),
                                                        Number(
                                                            item.longitude
                                                        ),
                                                    ]}
                                                />
                                            </MapContainer>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="details-sidebar">

                        <div className="card">
                            <div className="card-body">
                                <h3 className="section-title">
                                    Item details
                                </h3>

                                <div className="meta-list">

                                    <div>
                                        <div className="meta-label">
                                            Category
                                        </div>

                                        <div className="meta-value">
                                            {item.category_name ||
                                                "Not specified"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="meta-label">
                                            Location
                                        </div>

                                        <div className="meta-value">
                                            {item.location_name ||
                                                "Not specified"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="meta-label">
                                            Date
                                        </div>

                                        <div className="meta-value">
                                            {item.date_occurred
                                                ? new Date(
                                                      item.date_occurred
                                                  ).toLocaleDateString()
                                                : "Not specified"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="meta-label">
                                            Reported by
                                        </div>

                                        <div className="meta-value">
                                            {item.user_name ||
                                                "User"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="meta-label">
                                            Contact preference
                                        </div>

                                        <div className="meta-value">
                                            {item.contact_preference ===
                                            "IN_APP"
                                                ? "In App"
                                                : item.contact_preference ||
                                                  "Not specified"}
                                        </div>
                                    </div>

                                    {item.created_at && (
                                        <div>
                                            <div className="meta-label">
                                                Reported
                                            </div>

                                            <div className="meta-value">
                                                {new Date(
                                                    item.created_at
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isOwner && (
                            <div className="card">
                                <div className="card-body">
                                    <span className="badge badge-neutral">
                                        Your report
                                    </span>

                                    <h3
                                        style={{
                                            margin:
                                                "14px 0 6px",
                                        }}
                                    >
                                        You reported this item
                                    </h3>

                                    <p
                                        className="muted"
                                        style={{
                                            lineHeight: 1.6,
                                            marginBottom: 0,
                                        }}
                                    >
                                        Manage this listing,
                                        update its status, or
                                        remove it from My Items.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isOwner &&
                            item.status ===
                                "ACTIVE" && (
                                <form
                                    className="card"
                                    onSubmit={
                                        handleClaim
                                    }
                                >
                                    <div className="card-body">
                                        <h3 className="section-title">
                                            Is this yours?
                                        </h3>

                                        <p
                                            className="muted"
                                            style={{
                                                lineHeight:
                                                    1.6,
                                            }}
                                        >
                                            Give the owner
                                            enough information
                                            to verify that the
                                            item belongs to
                                            you.
                                        </p>

                                        {claimError && (
                                            <div className="alert alert-error">
                                                {
                                                    claimError
                                                }
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label className="form-label">
                                                Verification
                                                message
                                            </label>

                                            <textarea
                                                className="form-control"
                                                rows={6}
                                                minLength={5}
                                                maxLength={
                                                    2000
                                                }
                                                value={
                                                    message
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setMessage(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Example: The case has a small scratch on the left side and my initials are written inside..."
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                claimLoading
                                            }
                                            style={{
                                                width:
                                                    "100%",
                                            }}
                                        >
                                            {claimLoading
                                                ? "Submitting..."
                                                : "Submit Claim"}
                                        </button>
                                    </div>
                                </form>
                            )}

                        {!isOwner &&
                            item.status !==
                                "ACTIVE" && (
                                <div className="card">
                                    <div className="card-body">
                                        <span className="badge badge-neutral">
                                            {
                                                item.status
                                            }
                                        </span>

                                        <h3
                                            style={{
                                                margin:
                                                    "14px 0 6px",
                                            }}
                                        >
                                            Claims unavailable
                                        </h3>

                                        <p
                                            className="muted"
                                            style={{
                                                marginBottom:
                                                    0,
                                                lineHeight:
                                                    1.6,
                                            }}
                                        >
                                            This report is no
                                            longer accepting
                                            new ownership
                                            claims.
                                        </p>
                                    </div>
                                </div>
                            )}
                    </aside>
                </div>
            </main>
        </>
    );
}

export default ItemDetails;