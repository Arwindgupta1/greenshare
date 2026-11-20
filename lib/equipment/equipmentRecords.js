import "server-only";

import { getServerDb } from "@/lib/firebase/server";

/*
  I will use this function to load equipment belonging to a selected
  library. Each location has its own equipment list so I filter
  the Firestore records by libraryId rather than loading everything.
  I decided not to filter by the active field because equipment
  activation is outside the current assignment requirements but ant to keep like this 
  as it can be a perfect future feature.
 */
export async function getLibraryEquipment(libraryId) {
	const snapshot = await getServerDb()
		.collection("equipment")
		.where("libraryId", "==", libraryId)
		.get();

	const equipment = [];

	snapshot.forEach(function (document) {
		const data = document.data();

		equipment.push({
			id: document.id,
			name: data.name || "",
			category: data.category || "",
			libraryId: data.libraryId || "",
			description: data.description || "",
			totalQuantity: data.totalQuantity ?? 0,
		});
	});

	equipment.sort(function (a, b) {
		return a.name.localeCompare(b.name);
	});

	return equipment;
}
