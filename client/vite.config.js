import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    preview: {
        host: "0.0.0.0",

        allowedHosts: [
            "diplomatic-contentment-production-e4ce.up.railway.app",
        ],

        proxy: {
            "/api": {
                target:
                    "https://lost-and-found-portal-production-215b.up.railway.app",
                changeOrigin: true,
                secure: true,
            },

            "/uploads": {
                target:
                    "https://lost-and-found-portal-production-215b.up.railway.app",
                changeOrigin: true,
                secure: true,
            },
        },
    },
});