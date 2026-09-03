import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import API_URL from "../config/api";

function ClaimsReceived() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const extractItems = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.data?.items)) return data.data.items;

        return [];
    };

    const extractClaims = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.claims)) return data.claims;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.data?.claims)) return data.data.claims;

        return [];
    };

    const loadClaims = async () => {
        try {
            setLoading(true);
            setError("");

            const itemsResponse = await fetch(
                `${API_URL}/api/items/mine`,
                {
                    credentials: "include",
                }
            );

            const itemsData = await itemsResponse.json();

            if (!itemsResponse.ok) {
                throw new Error(
                    itemsData.message ||
                        "Unable to load your items"
                );
            }

            const myItems = extractItems(itemsData);

            const claimRequests = myItems.map(async (item) => {
                try {
                    const response = await fetch(
                        `${API_URL}/api/claims/item/${item.id}`,
                        {
                            credentials: "include",
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        return [];
                    }

                    return extractClaims(data).map((claim) => ({
                        ...claim,
                        item_title:
                            claim.item_title ||
                            item.title,
                        item_type:
                            claim.item_type ||
                            item.type,
                    }));
                } catch {
                    return [];
                }
            });

            const results = await Promise.all(claimRequests);

            setClaims(results.flat());
        } catch (error) {
            console.error(
                "Claims received error:",
                error
            );

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClaims();
    }, []);

    const updateClaimStatus = async (
        claimId,
        status
    ) => {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/api/claims/${claimId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to update claim"
                );
            }

            await loadClaims();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <h1>Claims Received</h1>

                    <p>
                        Review claims submitted for
                        the items you reported.
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
                ) : claims.length === 0 ? (
                    <div className="empty-state">
                        <h3>No claims received</h3>

                        <p>
                            Claims submitted for your
                            items will appear here.
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gap: "16px",
                        }}
                    >
                        {claims.map((claim) => (
                            <article
                                key={claim.id}
                                className="card card-body"
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "flex-start",
                                        gap: "16px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "8px",
                                                marginBottom:
                                                    "10px",
                                            }}
                                        >
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

                                            <span
                                                className={`badge badge-${claim.status?.toLowerCase()}`}
                                            >
                                                {
                                                    claim.status
                                                }
                                            </span>
                                        </div>

                                        <h3
                                            style={{
                                                margin:
                                                    "0 0 6px",
                                            }}
                                        >
                                            {claim.item_title ||
                                                "Item claim"}
                                        </h3>

                                        <p
                                            style={{
                                                margin:
                                                    "0 0 6px",
                                                color:
                                                    "#6b7280",
                                            }}
                                        >
                                            Claimant:{" "}
                                            {claim.claimant_name ||
                                                claim.name ||
                                                "User"}
                                        </p>

                                        {claim.claimant_email && (
                                            <p
                                                style={{
                                                    margin:
                                                        "0 0 12px",
                                                    color:
                                                        "#8b9099",
                                                    fontSize:
                                                        "0.85rem",
                                                }}
                                            >
                                                {
                                                    claim.claimant_email
                                                }
                                            </p>
                                        )}

                                        <p
                                            style={{
                                                margin: 0,
                                                lineHeight:
                                                    1.6,
                                            }}
                                        >
                                            {claim.message}
                                        </p>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            flexWrap: "wrap",
                                        }}
                                    >
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
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-success"
                                                    onClick={() =>
                                                        updateClaimStatus(
                                                            claim.id,
                                                            "ACCEPTED"
                                                        )
                                                    }
                                                >
                                                    Accept
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        updateClaimStatus(
                                                            claim.id,
                                                            "REJECTED"
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ClaimsReceived;