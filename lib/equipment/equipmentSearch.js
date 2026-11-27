/*
  I made this function to get equipment from all the libraries,
  not just one particular location. This way users can browse
  everything in one place and narrow down the results using filters.
  I only take the information needed for the equipment list as the availability for a selected date is checked separately.
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
