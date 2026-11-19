import "server-only";

import { getServerDb } from "@/lib/firebase/server";

// Read the library locations from Firestore.
// I  will use this for the home page and the map later.
export async function getLibraryRecords() {
	const db = getServerDb();
	const snapshot = await db.collection("libraries").get();

	const libraries = [];

	for (const document of snapshot.docs) {
		libraries.push({
			id: document.id,
			...document.data(),
		});
	}

	return libraries;
}
