import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Login() {
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(
                auth,
                googleProvider
            );

            const firebaseToken =
                await result.user.getIdToken();

            const response = await fetch(
                "http://localhost:5000/api/auth/firebase",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        idToken: firebaseToken,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed"
                );
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href = "/dashboard";

        } catch (error) {
            console.error(
                "Google login error:",
                error
            );
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <button onClick={handleGoogleLogin}>
                Continue with Google
            </button>
        </div>
    );
}

export default Login;