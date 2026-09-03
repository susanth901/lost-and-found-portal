import {
    useEffect,
    useState,
} from "react";

import Navbar from "../components/Navbar";
import API_URL from "../config/api";

function Profile() {
    const [profile, setProfile] =
        useState({
            name: "",
            email: "",
            profileImageUrl: "",
            role: "",
        });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await fetch(
                    `${API_URL}/api/users/profile`,
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
                        "Unable to load profile"
                );
            }

            const user =
                data.user ||
                data.data ||
                data;

            setProfile({
                name:
                    user.name ||
                    "",
                email:
                    user.email ||
                    "",
                profileImageUrl:
                    user.profile_image_url ||
                    user.profileImageUrl ||
                    "",
                role:
                    user.role ||
                    "USER",
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response =
                await fetch(
                    `${API_URL}/api/users/profile`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        credentials:
                            "include",

                        body: JSON.stringify(
                            {
                                name:
                                    profile.name,
                                profileImageUrl:
                                    profile.profileImageUrl ||
                                    null,
                            }
                        ),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to update profile"
                );
            }

            const updatedUser =
                data.user ||
                data.data ||
                {
                    ...profile,
                };

            const storedUser =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    ) || "{}"
                );

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...storedUser,
                    ...updatedUser,
                    name:
                        updatedUser.name ||
                        profile.name,
                    profile_image_url:
                        updatedUser.profile_image_url ||
                        profile.profileImageUrl,
                })
            );

            setSuccess(
                "Profile updated successfully."
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <Navbar />

                <main className="page-shell">
                    Loading profile...
                </main>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <h1>Profile</h1>

                    <p>
                        Manage your account
                        information.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <form
                    className="card card-body"
                    style={{
                        maxWidth: "650px",
                    }}
                    onSubmit={handleSubmit}
                >
                    {profile.profileImageUrl && (
                        <img
                            src={
                                profile.profileImageUrl
                            }
                            alt="Profile"
                            style={{
                                width: "90px",
                                height: "90px",
                                objectFit:
                                    "cover",
                                borderRadius:
                                    "50%",
                                marginBottom:
                                    "20px",
                            }}
                        />
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            Name
                        </label>

                        <input
                            className="form-control"
                            value={
                                profile.name
                            }
                            onChange={(
                                event
                            ) =>
                                setProfile(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        name:
                                            event
                                                .target
                                                .value,
                                    })
                                )
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Email
                        </label>

                        <input
                            className="form-control"
                            value={
                                profile.email
                            }
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Role
                        </label>

                        <input
                            className="form-control"
                            value={
                                profile.role
                            }
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Profile Image URL
                        </label>

                        <input
                            type="url"
                            className="form-control"
                            value={
                                profile.profileImageUrl
                            }
                            placeholder="https://..."
                            onChange={(
                                event
                            ) =>
                                setProfile(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        profileImageUrl:
                                            event
                                                .target
                                                .value,
                                    })
                                )
                            }
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Profile"}
                    </button>
                </form>
            </main>
        </div>
    );
}

export default Profile;