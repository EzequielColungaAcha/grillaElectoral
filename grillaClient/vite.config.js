import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  rollupOptions: {
    external: ["react", "react-router-dom"],
    output: {
      globals: {
        react: "React",
      },
    },
  },
  define: {
    __VALUE__: `"${process.env.VALUE}"`, // wrapping in "" since it's a string
  },
  // server: {
  //   host: true,
  //   port: 3000,
  // },
});
