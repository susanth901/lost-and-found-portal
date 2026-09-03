import {
    useEffect,
    useRef,
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
        });

    const [
        selectedImage,
        setSelectedImage,
    ] = useState(null);

    const [
        previewImage,
        setPreviewImage,
    ] = useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const fileInputRef =
        useRef(null);

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
            ) ||
            image.startsWith(
                "blob:"
            )
        ) {
            return image;
        }

        return `${API_URL}${image}`;
    };

    const loadProfile =
        async () => {
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
                    data.data ||
                    data.user ||
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
                        "",
                });
            } catch (error) {
                setError(
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        return () => {
            if (
                previewImage &&
                previewImage.startsWith(
                    "blob:"
                )
            ) {
                URL.revokeObjectURL(
                    previewImage
                );
            }
        };
    }, [previewImage]);

    const handleImageChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            setError(
                "Please select a JPEG, PNG or WEBP image."
            );

            event.target.value =
                "";

            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            setError(
                "Profile picture must be smaller than 5 MB."
            );

            event.target.value =
                "";

            return;
        }

        setError("");
        setSuccess("");

        if (
            previewImage &&
            previewImage.startsWith(
                "blob:"
            )
        ) {
            URL.revokeObjectURL(
                previewImage
            );
        }

        const preview =
            URL.createObjectURL(
                file
            );

        setSelectedImage(
            file
        );

        setPreviewImage(
            preview
        );
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const formData =
                new FormData();

            if (
                profile.name.trim()
            ) {
                formData.append(
                    "name",
                    profile.name.trim()
                );
            }

            if (
                selectedImage
            ) {
                formData.append(
                    "profileImage",
                    selectedImage
                );
            }

            const response =
                await fetch(
                    `${API_URL}/api/users/profile`,
                    {
                        method: "PATCH",

                        credentials:
                            "include",

                        body: formData,
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
                data.data ||
                data.user ||
                data;

            const updatedImage =
                updatedUser.profile_image_url ||
                profile.profileImageUrl;

            setProfile(
                (current) => ({
                    ...current,

                    name:
                        updatedUser.name ||
                        current.name,

                    profileImageUrl:
                        updatedImage ||
                        "",
                })
            );

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

                    name:
                        updatedUser.name ||
                        profile.name,

                    profile_image_url:
                        updatedImage ||
                        "",
                })
            );

            setSelectedImage(
                null
            );

            setPreviewImage(
                ""
            );

            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    "";
            }

            setSuccess(
                "Profile updated successfully."
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setSaving(false);
        }
    };

    const displayImage =
        previewImage ||
        getImageUrl(
            profile.profileImageUrl
        );

    return (
        <div className="page">
            <Navbar />

            <main className="page-shell">
                <div className="page-header">
                    <h1>
                        Profile
                    </h1>

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

                {loading ? (
                    <div className="card card-body">
                        Loading profile...
                    </div>
                ) : (
                    <form
                        className="card card-body"
                        style={{
                            maxWidth:
                                "650px",
                        }}
                        onSubmit={
                            handleSubmit
                        }
                    >
                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "20px",
                                marginBottom:
                                    "28px",
                            }}
                        >
                            <div
                                style={{
                                    width:
                                        "110px",
                                    height:
                                        "110px",
                                    borderRadius:
                                        "50%",
                                    overflow:
                                        "hidden",
                                    background:
                                        "#f3f4f6",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    flexShrink:
                                        0,
                                    border:
                                        "1px solid #e5e7eb",
                                }}
                            >
                                {displayImage ? (
                                    <img
                                        src={
                                            displayImage
                                        }
                                        alt="Profile"
                                        style={{
                                            width:
                                                "100%",
                                            height:
                                                "100%",
                                            objectFit:
                                                "cover",
                                        }}
                                    />
                                ) : (
                                    <span
                                        style={{
                                            fontSize:
                                                "2rem",
                                            fontWeight:
                                                700,
                                            color:
                                                "#6b7280",
                                        }}
                                    >
                                        {profile.name
                                            ?.charAt(
                                                0
                                            )
                                            .toUpperCase() ||
                                            "U"}
                                    </span>
                                )}
                            </div>

                            <div>
                                <input
                                    ref={
                                        fileInputRef
                                    }
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    style={{
                                        display:
                                            "none",
                                    }}
                                    onChange={
                                        handleImageChange
                                    }
                                />

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    Change Profile
                                    Picture
                                </button>

                                <p
                                    style={{
                                        margin:
                                            "8px 0 0",
                                        fontSize:
                                            "0.82rem",
                                        color:
                                            "#6b7280",
                                    }}
                                >
                                    JPEG, PNG or
                                    WEBP. Maximum
                                    5 MB.
                                </p>
                            </div>
                        </div>

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

                        <button
                            className="btn btn-primary"
                            disabled={
                                saving
                            }
                        >
                            {saving
                                ? "Saving..."
                                : "Save Profile"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}

export default Profile;