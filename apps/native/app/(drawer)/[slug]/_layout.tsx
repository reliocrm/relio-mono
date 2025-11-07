import { Stack } from "expo-router";
import { OrganizationSelectorProvider } from "@/components/organization-selector-context";
import { OrganizationBottomSheet } from "@/components/organization-bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function OrganizationLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<OrganizationSelectorProvider>
				<Stack
					screenOptions={{
						headerShown: false,
					}}
				>
					<Stack.Screen name="(tabs)" />
				</Stack>
				<OrganizationBottomSheet />
			</OrganizationSelectorProvider>
		</GestureHandlerRootView>
	);
}

