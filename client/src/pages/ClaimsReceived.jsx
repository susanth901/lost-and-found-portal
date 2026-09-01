import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function ClaimsReceived() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchClaimsReceived = async () => {
        try {
            const itemsResponse = await fetch(
                "http://localhost:5000/api/items/mine",
                {
                    credentials: "include",
                }
            );

            const itemsData =
                await itemsResponse.json();

            if (!itemsResponse.ok) {
                throw new Error(
                    itemsData.message ||
                        "Failed to load your items"
                );
            }

            const requests = (
                itemsData.data || []
            ).map(async (item) => {
                const response = await fetch(
                    `http://localhost:5000/api/claims/item/${item.id}`,
                    {
                        credentials: "include",
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    return [];
                }

                return (data.data || []).map(
                    (claim) => ({
                        ...claim,
                        itemTitle:
                            item.title,
                        itemType:
                            item.type,
                    })
                );
            });

            const results =
                await Promise.all(requests);

            setClaims(results.flat());
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaimsReceived();
    }, []);

    const updateClaimStatus = async (
        claimId,
        status
    ) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/claims/${claimId}/status`,
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
                        "Failed to update claim"
                );
            }

            setClaims((current) =>
                current.map((claim) =>
                    claim.id === claimId
                        ? {
                              ...claim,
                              status,
                          }
                        : status ===
                                "ACCEPTED" &&
                            claim.item_id ===
                                data.data.item_id &&
                            claim.status ===
                                "PENDING"
                          ? {
                                ...claim,
                                status:
                                    "REJECTED",
                            }
                          : claim
                )
            );
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <h1 className="page-title">
                        Claims Received
                    </h1>

                    <p className="page-subtitle">
                        Review ownership requests for
                        your reported items.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="empty-state">
                        Loading claims...
                    </div>
                ) : claims.length === 0 ? (
                    <div className="card empty-state">
                        No claims received yet.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gap: "16px",
                        }}
                    >
                        {claims.map((claim) => (
                            <div
                                key={claim.id}
                                className="card"
                            >
                                <div className="card-body">
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            gap: "16px",
                                            alignItems:
                                                "start",
                                        }}
                                    >
                                        <div>
                                            <span
                                                className={`badge ${
                                                    claim.itemType ===
                                                    "LOST"
                                                        ? "badge-lost"
                                                        : "badge-found"
                                                }`}
                                            >
                                                {
                                                    claim.itemType
                                                }
                                            </span>

                                            <h3
                                                style={{
                                                    margin:
                                                        "10px 0 4px",
                                                }}
                                            >
                                                {
                                                    claim.itemTitle
                                                }
                                            </h3>

                                            <p className="muted">
                                                Claim from{" "}
                                                <strong>
                                                    {claim.claimant_name ||
                                                        "User"}
                                                </strong>
                                            </p>
                                        </div>

                                        <span className="badge badge-neutral">
                                            {claim.status}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            padding: "14px",
                                            background:
                                                "#f9fafb",
                                            borderRadius:
                                                "12px",
                                            marginTop:
                                                "12px",
                                        }}
                                    >
                                        {claim.message}
                                    </div>

                                    {claim.status ===
                                        "PENDING" && (
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap: "8px",
                                                marginTop:
                                                    "16px",
                                            }}
                                        >
                                            <button
                                                className="btn btn-primary"
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

export default ClaimsReceived;