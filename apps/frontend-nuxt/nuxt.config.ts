// https://nuxt.com/docs/api/configuration/nuxt-config
import { join } from "node:path";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui"],

  fonts: {
    provider: "local",
  },

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  alias: {
    "@backend/db": join(
      import.meta.dirname,
      "../backend/src/database/index.ts",
    ),
    "@backend/elysia": join(
      import.meta.dirname,
      "../backend/src/services/elysia.ts",
    ),
    "@backend/api": join(import.meta.dirname, "../backend/src/api/index.ts"),
    "@backend": join(import.meta.dirname, "../backend/src"),
    "@root": join(import.meta.dirname, "../../"),
  },

  routeRules: {
    "/": { prerender: true },
  },

  devServer: {
    port: 4000,
  },

  compatibilityDate: "2025-01-15",

  nitro: {
    preset: "bun",
    devProxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        allowImportingTsExtensions: true,
        baseUrl: ".",
        paths: {
          "@backend/db": ["../backend/src/database/index.ts"],
          "@backend/elysia": ["../backend/src/services/elysia.ts"],
          "@backend/api": ["../backend/src/api/index.ts"],
          "@backend/*": ["../backend/src/*"],
          "@root/*": ["../../*"],
        },
      },
    },
  },
});
