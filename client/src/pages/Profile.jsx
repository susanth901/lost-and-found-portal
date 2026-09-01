import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [profileImageUrl, setProfileImageUrl] =
        useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchProfile = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/users/profile",
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load profile"
                );
            }

            setProfile(data.data);
            setName(data.data?.name || "");
            setProfileImageUrl(
                data.data?.profile_image_url || ""
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await fetch(
                "http://localhost:5000/api/users/profile",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name: name.trim(),
                        profileImageUrl:
                            profileImageUrl.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update profile"
                );
            }

            setProfile(data.data);

            localStorage.setItem(
                "user",
                JSON.stringify(data.data)
            );

            setMessage(
                "Profile updated successfully"
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="page-shell">
                    <div className="empty-state">
                        Loading profile...
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main
                className="page-shell"
                style={{
                    maxWidth: "760px",
                }}
            >
                <div className="page-header">
                    <h1 className="page-title">
                        Profile
                    </h1>

                    <p className="page-subtitle">
                        Manage your basic account
                        information.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )}

                <div className="card">
                    <div className="card-body">
                        <div
                            style={{
                                display: "flex",
                                gap: "18px",
                                alignItems: "center",
                                marginBottom: "26px",
                            }}
                        >
                            <div
                                style={{
                                    width: "84px",
                                    height: "84px",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    background: "#f3f4f6",
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: 700,
                                    fontSize: "1.4rem",
                                }}
                            >
                                {profileImageUrl ? (
                                    <img
                                        src={profileImageUrl}
                                        alt="Profile"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    name
                                        ?.charAt(0)
                                        .toUpperCase() ||
                                    "U"
                                )}
                            </div>

                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                    }}
                                >
                                    {profile?.name}
                                </h2>

                                <p
                                    className="muted"
                                    style={{
                                        margin:
                                            "4px 0",
                                    }}
                                >
                                    {profile?.email}
                                </p>

                                <span className="badge badge-neutral">
                                    {profile?.role}
                                </span>
                            </div>
                        </div>

                        <form
                            onSubmit={
                                handleUpdateProfile
                            }
                        >
                            <div className="form-group">
                                <label className="form-label">
                                    Name
                                </label>

                                <input
                                    className="form-control"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    minLength={2}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Profile Image URL
                                </label>

                                <input
                                    className="form-control"
                                    type="url"
                                    value={profileImageUrl}
                                    onChange={(e) =>
                                        setProfileImageUrl(
                                            e.target.value
                                        )
                                    }
                                    placeholder="https://..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Profile;