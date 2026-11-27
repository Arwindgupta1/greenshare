import "server-only";

import { getServerDb } from "@/lib/firebase/server";

// Get all library locations from Firestore.
// I use the same list on the home page and on the locations page.
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
