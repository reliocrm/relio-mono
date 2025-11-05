import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

function resolveServerURL(): string | undefined {
    // Prefer explicit env
    const envUrl = process.env.EXPO_PUBLIC_SERVER_URL;
    if (envUrl) return envUrl;
    // Derive from packager host (e.g., 192.168.x.x:8081 → http://192.168.x.x:3000)
    const hostUri = (Constants.expoConfig as any)?.hostUri as string | undefined;
    if (hostUri && hostUri.includes(":")) {
        const host = hostUri.split(":")[0];
        return `http://${host}:3000`;
    }
    return undefined;
}

export const authClient = createAuthClient({
    baseURL: resolveServerURL(),
	plugins: [
		expoClient({
			scheme: Constants.expoConfig?.scheme as string,
			storagePrefix: Constants.expoConfig?.scheme as string,
			storage: SecureStore,
		}),
	],
});
