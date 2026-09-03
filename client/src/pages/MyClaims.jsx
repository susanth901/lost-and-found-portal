import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import API_URL from "../config/api";

function MyClaims() {
    const [claims, setClaims] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const extractClaims = (
        data
    ) => {
        if (Array.isArray(data))
            return data;

        if (
            Array.isArray(
                data.claims
            )
        )
            return data.claims;

        if (
            Array.isArray(
                data.data
            )
        )
            return data.data;

        if (
            Array.isArray(
                data.data?.claims
            )
        )
            return data.data.claims;

        return [];
    };

    const getImageUrl = (
        image
    ) => {
        if (!image) return "";

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

    const loadClaims =
        async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await fetch(
                        `${API_URL}/api/claims/mine`,
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
                            "Unable to load claims"
                    );
                }

                setClaims(
                    extractClaims(
                        data
                    )
                );
            } catch (error) {
                setError(
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadClaims();
    }, []);

    const cancelClaim =
        async (claimId) => {
            const confirmed =
                window.confirm(
                    "Cancel this claim?"
                );

            if (!confirmed)
                return;

            try {
                setError("");

                const response =
                    await fetch(
                        `${API_URL}/api/claims/${claimId}/cancel`,
                        {
                            method:
                                "PATCH",

                            credentials:
                                "include",
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Unable to cancel claim"
                    );
                }

                await loadClaims();
            } catch (error) {
                setError(
                    error.message
                );
            }
        };

    const getMailLink = (
        email,
        itemTitle
    ) => {
        const subject =
            encodeURIComponent(
                `Lost & Found - ${itemTitle}`
            );

        const body =
            encodeURIComponent(
                `Hi,\n\nI'm contacting you regarding my accepted claim for "${itemTitle}".\n\n`
            );

        return `mailto:${email}?subject=${subject}&body=${body}`;
    };

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <h1>
                        My Claims
                    </h1>

                    <p>
                        Track the claims
                        you have submitted.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="card card-body">
                        Loading claims...
                    </div>
                ) : claims.length ===
                  0 ? (
                    <div className="empty-state">
                        <h3>
                            No claims yet
                        </h3>

                        <p>
                            Browse items
                            and submit a
                            claim if you
                            find something
                            that belongs to
                            you.
                        </p>

                        <Link
                            to="/dashboard"
                            className="btn btn-primary"
                            style={{
                                marginTop:
                                    "16px",
                            }}
                        >
                            Explore Items
                        </Link>
                    </div>
                ) : (
                    <div className="items-grid">
                        {claims.map(
                            (claim) => {
                                const image =
                                    claim.primary_image ||
                                    claim.image_url;

                                return (
                                    <article
                                        className="item-card"
                                        key={
                                            claim.id
                                        }
                                    >
                                        {image ? (
                                            <img
                                                className="item-card-image"
                                                src={getImageUrl(
                                                    image
                                                )}
                                                alt={
                                                    claim.item_title ||
                                                    "Item"
                                                }
                                            />
                                        ) : (
                                            <div className="item-card-no-image">
                                                No image
                                            </div>
                                        )}

                                        <div className="item-card-content">
                                            <div className="item-card-top">
                                                {claim.item_type && (
                                                    <span
                                                        className={`badge ${
                                                            claim.item_type ===
                                                            "FOUND"
                                                                ? "badge-found"
                                                                : "badge-lost"
                                                        }`}
                                                    >
                                                        {
                                                            claim.item_type
                                                        }
                                                    </span>
                                                )}

                                                <span
                                                    className={`badge badge-${claim.status?.toLowerCase()}`}
                                                >
                                                    {
                                                        claim.status
                                                    }
                                                </span>
                                            </div>

                                            <h3>
                                                {claim.item_title ||
                                                    "Item"}
                                            </h3>

                                            <p>
                                                {
                                                    claim.message
                                                }
                                            </p>

                                            {claim.owner_response && (
                                                <p
                                                    style={{
                                                        marginTop:
                                                            "10px",

                                                        color:
                                                            "#6b7280",
                                                    }}
                                                >
                                                    Owner
                                                    response:{" "}
                                                    {
                                                        claim.owner_response
                                                    }
                                                </p>
                                            )}

                                            {claim.status ===
                                                "ACCEPTED" &&
                                                claim.owner_email && (
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "15px",

                                                            padding:
                                                                "12px",

                                                            borderRadius:
                                                                "10px",

                                                            background:
                                                                "#f0fdf4",

                                                            border:
                                                                "1px solid #d1fae5",
                                                        }}
                                                    >
                                                        <p
                                                            style={{
                                                                margin:
                                                                    "0 0 5px",

                                                                fontWeight:
                                                                    600,
                                                            }}
                                                        >
                                                            Your
                                                            claim was
                                                            accepted!
                                                        </p>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    "0 0 10px",

                                                                fontSize:
                                                                    "0.9rem",
                                                            }}
                                                        >
                                                            You can
                                                            now
                                                            contact{" "}
                                                            {claim.owner_name ||
                                                                "the owner"}{" "}
                                                            by email.
                                                        </p>

                                                        <a
                                                            href={getMailLink(
                                                                claim.owner_email,
                                                                claim.item_title
                                                            )}
                                                            className="btn btn-primary"
                                                        >
                                                            Contact
                                                            Owner by
                                                            Email
                                                        </a>
                                                    </div>
                                                )}

                                            {claim.status ===
                                                "REJECTED" && (
                                                <div
                                                    className="alert alert-error"
                                                    style={{
                                                        marginTop:
                                                            "12px",
                                                    }}
                                                >
                                                    This claim
                                                    was rejected.
                                                </div>
                                            )}

                                            <div className="item-card-footer">
                                                {claim.item_id && (
                                                    <Link
                                                        to={`/items/${claim.item_id}`}
                                                    >
                                                        View
                                                        Item
                                                    </Link>
                                                )}

                                                {claim.status ===
                                                    "PENDING" && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() =>
                                                            cancelClaim(
                                                                claim.id
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyClaims;