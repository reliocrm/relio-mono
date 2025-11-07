import { Container } from "@/components/container";
import { ScrollView, Text, View } from "react-native";
import { Favorites } from "@/components/favorites";
import { FavoriteActionSheetProvider } from "@/components/favorite-action-sheet-context";
import { FavoriteActionBottomSheet } from "@/components/favorite-action-bottom-sheet";

export default function TabOne() {
	return (
		<FavoriteActionSheetProvider>
			<View style={{ flex: 1 }}>
				<Container>
					<ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
						<Favorites />
					</ScrollView>
				</Container>
				<FavoriteActionBottomSheet />
			</View>
		</FavoriteActionSheetProvider>
	);
}

