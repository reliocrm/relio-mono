import { createContext, useContext, useRef, ReactNode } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

interface OrganizationSelectorContextType {
	bottomSheetRef: React.RefObject<BottomSheet | null>;
}

const OrganizationSelectorContext = createContext<OrganizationSelectorContextType | null>(null);

export function OrganizationSelectorProvider({ children }: { children: ReactNode }) {
	const bottomSheetRef = useRef<BottomSheet>(null);

	return (
		<OrganizationSelectorContext.Provider value={{ bottomSheetRef }}>
			{children}
		</OrganizationSelectorContext.Provider>
	);
}

export function useOrganizationSelector() {
	const context = useContext(OrganizationSelectorContext);
	if (!context) {
		throw new Error("useOrganizationSelector must be used within OrganizationSelectorProvider");
	}
	return context;
}

