import {
    useEffect,
    useState,
} from "react";

import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import API_URL from "./config/api";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ReportItem from "./pages/ReportItem";
import ItemDetails from "./pages/ItemDetails";
import MyItems from "./pages/MyItems";
import EditItem from "./pages/EditItem";
import MyClaims from "./pages/MyClaims";
import ClaimsReceived from "./pages/ClaimsReceived";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    const [user, setUser] =
        useState(null);

    const [authLoading, setAuthLoading] =
        useState(true);

    useEffect(() => {
        const checkAuthentication =
            async () => {
                try {
                    const response =
                        await fetch(
                            `${API_URL}/api/auth/me`,
                            {
                                credentials:
                                    "include",
                            }
                        );

                    if (!response.ok) {
                        localStorage.removeItem(
                            "user"
                        );

                        setUser(null);

                        return;
                    }

                    const data =
                        await response.json();

                    const loggedInUser =
                        data.user ||
                        data.data ||
                        null;

                    setUser(loggedInUser);

                    if (loggedInUser) {
                        localStorage.setItem(
                            "user",
                            JSON.stringify(
                                loggedInUser
                            )
                        );
                    }
                } catch (error) {
                    console.error(
                        "Authentication check failed:",
                        error
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    setUser(null);
                } finally {
                    setAuthLoading(false);
                }
            };

        checkAuthentication();
    }, []);

    if (authLoading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "center",
                }}
            >
                Loading...
            </div>
        );
    }

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
                    element={
                        user ? (
                            <Dashboard />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/report"
                    element={
                        user ? (
                            <ReportItem />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/items/:id"
                    element={
                        user ? (
                            <ItemDetails />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/my-items"
                    element={
                        user ? (
                            <MyItems />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/items/:id/edit"
                    element={
                        user ? (
                            <EditItem />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/my-claims"
                    element={
                        user ? (
                            <MyClaims />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/claims"
                    element={
                        user ? (
                            <ClaimsReceived />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/profile"
                    element={
                        user ? (
                            <Profile />
                        ) : (
                            <Navigate
                                to="/auth"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/admin"
                    element={
                        user?.role ===
                        "ADMIN" ? (
                            <AdminDashboard />
                        ) : (
                            <Navigate
                                to="/dashboard"
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