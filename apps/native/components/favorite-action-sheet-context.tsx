import { createContext, useContext, useRef, ReactNode, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

interface FavoriteActionSheetContextType {
	bottomSheetRef: React.RefObject<BottomSheet | null>;
	selectedFavorite: any | null;
	setSelectedFavorite: (favorite: any | null) => void;
}

const FavoriteActionSheetContext = createContext<FavoriteActionSheetContextType | null>(null);

export function FavoriteActionSheetProvider({ children }: { children: ReactNode }) {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const [selectedFavorite, setSelectedFavorite] = useState<any | null>(null);

	return (
		<FavoriteActionSheetContext.Provider value={{ bottomSheetRef, selectedFavorite, setSelectedFavorite }}>
			{children}
		</FavoriteActionSheetContext.Provider>
	);
}

export function useFavoriteActionSheet() {
	const context = useContext(FavoriteActionSheetContext);
	if (!context) {
		throw new Error("useFavoriteActionSheet must be used within FavoriteActionSheetProvider");
	}
	return context;
}



