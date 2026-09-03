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
        if (Array.isArray(data)) {
            return data;
        }

        if (
            Array.isArray(
                data?.claims
            )
        ) {
            return data.claims;
        }

        if (
            Array.isArray(
                data?.data
            )
        ) {
            return data.data;
        }

        if (
            Array.isArray(
                data?.data?.claims
            )
        ) {
            return data.data.claims;
        }

        return [];
    };

    const getImageUrl = (
        image
    ) => {
        if (!image) {
            return "";
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
                console.error(
                    "Load claims error:",
                    error
                );

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
                    "Are you sure you want to cancel this claim?"
                );

            if (!confirmed) {
                return;
            }

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
                console.error(
                    "Cancel claim error:",
                    error
                );

                setError(
                    error.message
                );
            }
        };

    const openGmail = (
        email,
        itemTitle
    ) => {
        if (!email) {
            setError(
                "Owner email is not available."
            );

            return;
        }

        const subject =
            encodeURIComponent(
                `Lost & Found - ${itemTitle}`
            );

        const body =
            encodeURIComponent(
                `Hi,\n\nMy claim for "${itemTitle}" was accepted on Lost & Found.\n\nI'm contacting you so we can coordinate the return of the item.\n\nThanks.`
            );

        const gmailAppUrl =
            `googlegmail://co?to=${encodeURIComponent(
                email
            )}&subject=${subject}&body=${body}`;

        const gmailWebUrl =
            `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                email
            )}&su=${subject}&body=${body}`;

        const isMobile =
            /Android|iPhone|iPad|iPod/i.test(
                navigator.userAgent
            );

        if (isMobile) {
            let appOpened = false;

            const handleVisibilityChange =
                () => {
                    if (
                        document.hidden
                    ) {
                        appOpened = true;
                    }
                };

            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            window.location.href =
                gmailAppUrl;

            setTimeout(() => {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );

                if (!appOpened) {
                    window.location.href =
                        gmailWebUrl;
                }
            }, 1200);

            return;
        }

        window.location.href =
            gmailWebUrl;
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
                            Claims you
                            submit will
                            appear here.
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
                                                "ACCEPTED" && (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "15px",
                                                        padding:
                                                            "14px",
                                                        background:
                                                            "#f0fdf4",
                                                        border:
                                                            "1px solid #d1fae5",
                                                        borderRadius:
                                                            "10px",
                                                    }}
                                                >
                                                    <p
                                                        style={{
                                                            margin:
                                                                "0 0 6px",
                                                            fontWeight:
                                                                "700",
                                                        }}
                                                    >
                                                        Claim
                                                        accepted
                                                    </p>

                                                    <p
                                                        style={{
                                                            margin:
                                                                "0 0 12px",
                                                            fontSize:
                                                                "0.9rem",
                                                        }}
                                                    >
                                                        You can now
                                                        contact{" "}
                                                        {claim.owner_name ||
                                                            "the owner"}{" "}
                                                        by email.
                                                    </p>

                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() =>
                                                            openGmail(
                                                                claim.owner_email,
                                                                claim.item_title ||
                                                                    "Item"
                                                            )
                                                        }
                                                    >
                                                        Contact Owner
                                                        by Email
                                                    </button>
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
                                                    This claim was
                                                    rejected.
                                                </div>
                                            )}

                                            {claim.status ===
                                                "CANCELLED" && (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "12px",
                                                        color:
                                                            "#6b7280",
                                                        fontSize:
                                                            "0.9rem",
                                                    }}
                                                >
                                                    You cancelled
                                                    this claim.
                                                </div>
                                            )}

                                            <div className="item-card-footer">
                                                {claim.item_id && (
                                                    <Link
                                                        to={`/items/${claim.item_id}`}
                                                        className="btn btn-secondary"
                                                    >
                                                        View Item
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