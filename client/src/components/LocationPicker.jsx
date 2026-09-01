import { useEffect, useState } from "react";
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function MapController({ latitude, longitude }) {
    const map = useMap();

    useEffect(() => {
        if (
            latitude !== "" &&
            longitude !== ""
        ) {
            map.setView(
                [
                    Number(latitude),
                    Number(longitude),
                ],
                16
            );
        }
    }, [
        latitude,
        longitude,
        map,
    ]);

    return null;
}

function ClickHandler({
    onLocationChange,
    onLocationNameChange,
}) {
    useMapEvents({
        async click(e) {
            const lat =
                e.latlng.lat;

            const lng =
                e.latlng.lng;

            onLocationChange(
                lat,
                lng
            );

            try {
                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
                    );

                const data =
                    await response.json();

                if (
                    data.display_name
                ) {
                    onLocationNameChange(
                        data.display_name
                    );
                }
            } catch (error) {
                console.error(
                    "Reverse geocoding failed:",
                    error
                );
            }
        },
    });

    return null;
}

function LocationPicker({
    latitude,
    longitude,
    onLocationChange,
    onLocationNameChange,
}) {
    const [search, setSearch] =
        useState("");

    const [searching, setSearching] =
        useState(false);

    const [error, setError] =
        useState("");

    const defaultPosition = [
        12.8231,
        80.0442,
    ];

    const position =
        latitude !== "" &&
        longitude !== ""
            ? [
                  Number(latitude),
                  Number(longitude),
              ]
            : defaultPosition;

    const handleSearch = async (
        e
    ) => {
        e.preventDefault();

        if (!search.trim()) {
            return;
        }

        try {
            setSearching(true);
            setError("");

            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
                        search.trim()
                    )}&limit=5`
                );

            const data =
                await response.json();

            if (
                !Array.isArray(
                    data
                ) ||
                data.length === 0
            ) {
                throw new Error(
                    "Location not found"
                );
            }

            const result =
                data[0];

            const lat =
                Number(
                    result.lat
                );

            const lng =
                Number(
                    result.lon
                );

            onLocationChange(
                lat,
                lng
            );

            onLocationNameChange(
                result.display_name ||
                    search.trim()
            );
        } catch (error) {
            setError(
                error.message
            );
        } finally {
            setSearching(false);
        }
    };

    return (
        <div>
            <form
                onSubmit={
                    handleSearch
                }
                style={{
                    display:
                        "flex",
                    gap: "10px",
                    marginBottom:
                        "12px",
                }}
            >
                <input
                    type="text"
                    className="form-control"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    placeholder="Search a location..."
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
            </form>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <p
                className="muted"
                style={{
                    margin:
                        "0 0 10px",
                    fontSize:
                        "0.86rem",
                }}
            >
                Search for a place or
                click directly on the
                map to select a
                location.
            </p>

            <div
                style={{
                    border:
                        "1px solid #e5e7eb",
                    borderRadius:
                        "14px",
                    overflow:
                        "hidden",
                }}
            >
                <MapContainer
                    center={
                        position
                    }
                    zoom={
                        latitude !== ""
                            ? 16
                            : 14
                    }
                    style={{
                        width:
                            "100%",
                        height:
                            "340px",
                    }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapController
                        latitude={
                            latitude
                        }
                        longitude={
                            longitude
                        }
                    />

                    <ClickHandler
                        onLocationChange={
                            onLocationChange
                        }
                        onLocationNameChange={
                            onLocationNameChange
                        }
                    />

                    {latitude !== "" &&
                        longitude !==
                            "" && (
                            <Marker
                                position={[
                                    Number(
                                        latitude
                                    ),
                                    Number(
                                        longitude
                                    ),
                                ]}
                            />
                        )}
                </MapContainer>
            </div>
        </div>
    );
}

export default LocationPicker;