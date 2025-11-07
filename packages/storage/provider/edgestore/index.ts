"use client";

import { createEdgeStoreProvider } from "@edgestore/react";
import type { EdgeStoreRouter } from "../../types";

// EdgeStore provider configuration
// The provider will automatically use /api/edgestore as the endpoint path
// In development, Vite proxies /api/edgestore/* to the server (port 3000)
// In production, ensure EDGE_STORE_BASE_URL env var is set or use relative URLs
const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider<EdgeStoreRouter>();

export { EdgeStoreProvider, useEdgeStore };
