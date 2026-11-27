import "server-only";

import { getServerDb } from "@/lib/firebase/server";

/*
  I use this function to get equipment belonging to one particular library. Rather than loading all equipment and checking the location afterwards, I filter the records by libraryId in Firestore.
  I also left the active field out of the filtering because I haven't added the option to activate or deactivate equipment in this project. It could be something worth adding in the future.
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
