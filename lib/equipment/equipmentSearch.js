/*
  This function i created to load equipment for the public catalogue unlike library details page this function
  loads equipment from all locations so users can search across whole GreenShare system. I return only the fields needed by the search results. Selected borrowing date will be used to calculate actual availability once reservations gonna be implemented.
 */
import "server-only";

import { getServerDb } from "@/lib/firebase/server";

export async function getEquipmentCatalogue() {
	const snapshot = await getServerDb().collection("equipment").get();

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
