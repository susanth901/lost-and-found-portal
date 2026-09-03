import {
    useEffect,
    useState,
} from "react";

import {
    MapContainer,
    Marker,
    TileLayer,
    useMapEvents,
} from "react-leaflet";

const DEFAULT_LAT = 12.8231;
const DEFAULT_LNG = 80.0442;

function MapClickHandler({
    onLocationSelect,
}) {
    useMapEvents({
        click(event) {
            const {
                lat,
                lng,
            } = event.latlng;

            onLocationSelect(
                lat,
                lng
            );
        },
    });

    return null;
}

function LocationPicker({
    value,
    onChange,
}) {
    const [search, setSearch] =
        useState(
            value?.locationName ||
                ""
        );

    const [latitude, setLatitude] =
        useState(() => {
            const lat = Number(
                value?.latitude
            );

            return Number.isFinite(
                lat
            )
                ? lat
                : DEFAULT_LAT;
        });

    const [
        longitude,
        setLongitude,
    ] = useState(() => {
        const lng = Number(
            value?.longitude
        );

        return Number.isFinite(
                lng
            )
                ? lng
                : DEFAULT_LNG;
        });

    const [
        hasSelectedLocation,
        setHasSelectedLocation,
    ] = useState(
        Number.isFinite(
            Number(
                value?.latitude
            )
        ) &&
            Number.isFinite(
                Number(
                    value?.longitude
                )
            )
    );

    const [
        searching,
        setSearching,
    ] = useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const lat = Number(
            value?.latitude
        );

        const lng = Number(
            value?.longitude
        );

        if (
            Number.isFinite(lat) &&
            Number.isFinite(lng)
        ) {
            setLatitude(lat);
            setLongitude(lng);

            setHasSelectedLocation(
                true
            );
        }

        if (
            value?.locationName !==
            undefined
        ) {
            setSearch(
                value.locationName ||
                    ""
            );
        }
    }, [
        value?.latitude,
        value?.longitude,
        value?.locationName,
    ]);

    const reverseGeocode =
        async (lat, lng) => {
            try {
                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
                    );

                const data =
                    await response.json();

                return (
                    data.display_name ||
                    `${lat.toFixed(
                        6
                    )}, ${lng.toFixed(
                        6
                    )}`
                );
            } catch {
                return `${lat.toFixed(
                    6
                )}, ${lng.toFixed(
                    6
                )}`;
            }
        };

    const selectLocation =
        async (lat, lng) => {
            if (
                !Number.isFinite(
                    Number(lat)
                ) ||
                !Number.isFinite(
                    Number(lng)
                )
            ) {
                return;
            }

            const validLat =
                Number(lat);

            const validLng =
                Number(lng);

            setLatitude(
                validLat
            );

            setLongitude(
                validLng
            );

            setHasSelectedLocation(
                true
            );

            const name =
                await reverseGeocode(
                    validLat,
                    validLng
                );

            setSearch(name);

            onChange?.({
                locationName:
                    name,
                latitude:
                    validLat,
                longitude:
                    validLng,
            });
        };

    const handleSearch =
        async (event) => {
            event.preventDefault();

            if (!search.trim()) {
                setError(
                    "Enter a location to search."
                );

                return;
            }

            try {
                setSearching(
                    true
                );

                setError("");

                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
                            search.trim()
                        )}`
                    );

                const data =
                    await response.json();

                if (
                    !Array.isArray(
                        data
                    ) ||
                    data.length ===
                        0
                ) {
                    setError(
                        "Location not found."
                    );

                    return;
                }

                const lat =
                    Number(
                        data[0].lat
                    );

                const lng =
                    Number(
                        data[0].lon
                    );

                if (
                    !Number.isFinite(
                        lat
                    ) ||
                    !Number.isFinite(
                        lng
                    )
                ) {
                    setError(
                        "Invalid location returned."
                    );

                    return;
                }

                setLatitude(
                    lat
                );

                setLongitude(
                    lng
                );

                setHasSelectedLocation(
                    true
                );

                const name =
                    data[0]
                        .display_name ||
                    search.trim();

                setSearch(name);

                onChange?.({
                    locationName:
                        name,
                    latitude: lat,
                    longitude: lng,
                });
            } catch (error) {
                console.error(
                    "Location search error:",
                    error
                );

                setError(
                    "Unable to search location."
                );
            } finally {
                setSearching(
                    false
                );
            }
        };

    const useCurrentLocation =
        () => {
            if (
                !navigator.geolocation
            ) {
                setError(
                    "Location services are not supported by this browser."
                );

                return;
            }

            setError("");

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    selectLocation(
                        position.coords
                            .latitude,
                        position.coords
                            .longitude
                    );
                },

                () => {
                    setError(
                        "Unable to access your current location."
                    );
                }
            );
        };

    return (
        <div>
            <form
                onSubmit={
                    handleSearch
                }
                style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom:
                        "10px",
                    flexWrap:
                        "wrap",
                }}
            >
                <input
                    type="text"
                    className="form-control"
                    value={search}
                    placeholder="Search location..."
                    onChange={(
                        event
                    ) =>
                        setSearch(
                            event
                                .target
                                .value
                        )
                    }
                    style={{
                        flex: 1,
                    }}
                />

                <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={
                        searching
                    }
                >
                    {searching
                        ? "Searching..."
                        : "Search"}
                </button>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                        useCurrentLocation
                    }
                >
                    Use Current
                    Location
                </button>
            </form>

            {error && (
                <div
                    className="alert alert-error"
                    style={{
                        marginBottom:
                            "10px",
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    height:
                        "320px",
                    borderRadius:
                        "12px",
                    overflow:
                        "hidden",
                    border:
                        "1px solid #e5e7eb",
                }}
            >
                <MapContainer
                    center={[
                        latitude,
                        longitude,
                    ]}
                    zoom={
                        hasSelectedLocation
                            ? 16
                            : 14
                    }
                    style={{
                        height:
                            "100%",
                        width:
                            "100%",
                    }}
                    key={`${latitude}-${longitude}`}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapClickHandler
                        onLocationSelect={
                            selectLocation
                        }
                    />

                    {hasSelectedLocation && (
                        <Marker
                            position={[
                                latitude,
                                longitude,
                            ]}
                        />
                    )}
                </MapContainer>
            </div>

            {hasSelectedLocation && (
                <p
                    style={{
                        marginTop:
                            "8px",
                        fontSize:
                            "0.85rem",
                        color:
                            "#6b7280",
                    }}
                >
                    Click anywhere on
                    the map to change
                    the selected
                    location.
                </p>
            )}
        </div>
    );
}

export default LocationPicker;