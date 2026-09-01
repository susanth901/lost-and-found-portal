import { useEffect, useState } from "react";

import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ReportItem from "./pages/ReportItem";
import ItemDetails from "./pages/ItemDetails";
import MyClaims from "./pages/MyClaims";
import ClaimsReceived from "./pages/ClaimsReceived";
import Profile from "./pages/Profile";
import MyItems from "./pages/MyItems";
import EditItem from "./pages/EditItem";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] =
        useState(true);

    const checkAuthentication = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/me",
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                setUser(null);
                localStorage.removeItem("user");
                return;
            }

            const data = await response.json();

            setUser(data.user);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        } catch (error) {
            console.error(
                "Authentication check failed:",
                error
            );

            setUser(null);
            localStorage.removeItem("user");
        } finally {
            setAuthLoading(false);
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    if (authLoading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                }}
            >
                Checking authentication...
            </div>
        );
    }

    const protectedPage = (component) => {
        return user ? (
            component
        ) : (
            <Navigate
                to="/auth"
                replace
            />
        );
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/auth"
                    element={
                        user ? (
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        ) : (
                            <Auth />
                        )
                    }
                />

                <Route
                    path="/dashboard"
                    element={protectedPage(
                        <Dashboard />
                    )}
                />

                <Route
                    path="/report"
                    element={protectedPage(
                        <ReportItem />
                    )}
                />

                <Route
                    path="/items/:id"
                    element={protectedPage(
                        <ItemDetails />
                    )}
                />

                <Route
                    path="/my-claims"
                    element={protectedPage(
                        <MyClaims />
                    )}
                />

                <Route
                    path="/claims-received"
                    element={protectedPage(
                        <ClaimsReceived />
                    )}
                />

                <Route
                    path="/profile"
                    element={protectedPage(
                        <Profile />
                    )}
                />

                <Route
                    path="/my-items"
                    element={protectedPage(
                        <MyItems />
                    )}
                />

                <Route
                    path="/items/:id/edit"
                    element={protectedPage(
                        <EditItem />
                    )}
                />

                <Route
                    path="/admin"
                    element={
                        user?.role === "ADMIN" ? (
                            <AdminDashboard />
                        ) : user ? (
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/"
                    element={
                        <Navigate
                            to={
                                user
                                    ? "/dashboard"
                                    : "/auth"
                            }
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                user
                                    ? "/dashboard"
                                    : "/auth"
                            }
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;