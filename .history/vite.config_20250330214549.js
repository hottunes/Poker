import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/Poker/", // GitHub repository 이름을 base로 설정
    build: {
        outDir: "dist",
        assetsDir: "assets",
        rollupOptions: {
            output: {
                manualChunks: {
                    // 큰 dependencies를 별도의 chunk로 분리
                    vendor: ["react", "react-dom"],
                },
            },
        },
        // 청크 크기 경고 임계값 설정
        chunkSizeWarningLimit: 1000,
    },
});
