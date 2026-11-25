import "server-only";

import { getServerDb } from "@/lib/firebase/server";

export async function getAllReservations() {
	const db = getServerDb();

	const snapshot = await db.collection("reservations").get();

	const reservations = await Promise.all(
		snapshot.docs.map(async function (document) {
			const data = document.data();

			const equipment = await db
				.collection("equipment")
				.doc(data.equipmentId)
				.get();

			const library = await db
				.collection("libraries")
				.doc(data.libraryId)
				.get();

			// The booking keeps the IDs, but names make the admin list easier to read.
			return {
				id: document.id,
				workerId: data.workerId,
				equipmentId: data.equipmentId,
				equipmentName: equipment.exists
					? equipment.data().name
					: "Unknown equipment",
				libraryId: data.libraryId,
				libraryName: library.exists ? library.data().name : "Unknown library",
				date: data.date,
				quantity: data.quantity,
				status: data.status,
			};
		}),
	);

	reservations.sort(function (a, b) {
		return a.date.localeCompare(b.date);
	});

	return reservations;
}
