import "server-only";

import { getServerDb } from "@/lib/firebase/server";

// The worker ID comes from the verified session, not from the page URL.
export async function getWorkerReservations(workerId) {
	if (
		typeof workerId !== "string" ||
		!workerId.trim() ||
		workerId.includes("/")
	) {
		throw new Error("Invalid worker ID.");
	}

	const snapshot = await getServerDb()
		.collection("reservations")
		.where("workerId", "==", workerId)
		.get();

	const reservations = [];

	snapshot.forEach(function (document) {
		const data = document.data();

		reservations.push({
			id: document.id,
			equipmentId: data.equipmentId || "",
			libraryId: data.libraryId || "",
			date: data.date || "",
			quantity: data.quantity ?? 0,
			status: data.status || "",
			createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
		});
	});

	// I sort these after fetching to avoid needing an extra Firestore index.
	reservations.sort(function (a, b) {
		return (b.createdAt || "").localeCompare(a.createdAt || "");
	});

	return reservations;
}
