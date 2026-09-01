import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function MyClaims() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchMyClaims = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/claims/mine",
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load claims"
                );
            }

            setClaims(data.data || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyClaims();
    }, []);

    const cancelClaim = async (claimId) => {
        if (
            !window.confirm(
                "Cancel this claim?"
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/claims/${claimId}/cancel`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to cancel claim"
                );
            }

            setClaims((current) =>
                current.map((claim) =>
                    claim.id === claimId
                        ? {
                              ...claim,
                              status: "CANCELLED",
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
                        My Claims
                    </h1>

                    <p className="page-subtitle">
                        Track the claims you have
                        submitted.
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
                        You have not submitted any
                        claims yet.
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
                                            alignItems:
                                                "start",
                                            gap: "12px",
                                        }}
                                    >
                                        <div>
                                            <h3
                                                style={{
                                                    margin:
                                                        "0 0 6px",
                                                }}
                                            >
                                                {claim.item_title ||
                                                    "Item"}
                                            </h3>

                                            <p
                                                className="muted"
                                                style={{
                                                    margin: 0,
                                                }}
                                            >
                                                {claim.message}
                                            </p>
                                        </div>

                                        <span className="badge badge-neutral">
                                            {claim.status}
                                        </span>
                                    </div>

                                    {claim.owner_response && (
                                        <div
                                            style={{
                                                marginTop:
                                                    "14px",
                                                padding:
                                                    "12px",
                                                borderRadius:
                                                    "10px",
                                                background:
                                                    "#f9fafb",
                                            }}
                                        >
                                            <strong>
                                                Owner response
                                            </strong>

                                            <p
                                                style={{
                                                    margin:
                                                        "5px 0 0",
                                                }}
                                            >
                                                {
                                                    claim.owner_response
                                                }
                                            </p>
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            marginTop:
                                                "16px",
                                        }}
                                    >
                                        <Link
                                            to={`/items/${claim.item_id}`}
                                            className="btn btn-secondary"
                                        >
                                            View Item
                                        </Link>

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
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

export default MyClaims;