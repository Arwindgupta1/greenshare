import "server-only";

import { getServerDb } from "@/lib/firebase/server";

/*
  I use this function to check how much equipment is available for a particular day. At first I was thinking about keeping
  everything in the equipment document, but I decided to store the reserved quantities separately for each date.
  This way I can keep the total stock in one place and work out how many items are still available after workers make bookings.
  The reservation actions update these numbers using Firestore transactions.
 */

export async function getEquipmentAvailability(equipmentId, date) {
	const allowedDates = ["2027-02-01", "2027-02-02", "2027-02-03"];

	if (!allowedDates.includes(date)) {
		throw new Error("Invalid borrowing date.");
	}

	if (
		typeof equipmentId !== "string" ||
		!equipmentId.trim() ||
		equipmentId.includes("/") ||
		equipmentId.length > 1500
	) {
		throw new Error("Invalid equipment ID.");
	}

	const db = getServerDb();

	const equipmentRef = db.collection("equipment").doc(equipmentId);

	const availabilityRef = db
		.collection("equipmentAvailability")
		.doc(`${equipmentId}_${date}`);

	// I read both records because availability depends on total stock and reservations for the selected date.
	const [equipment, availability] = await Promise.all([
		equipmentRef.get(),
		availabilityRef.get(),
	]);

	if (!equipment.exists) {
		return null;
	}

	const totalQuantity = equipment.data().totalQuantity;

	// If no bookings have been made yet -all units are available.
	const reservedQuantity = availability.exists
		? availability.data().reservedQuantity
		: 0;

	if (
		!Number.isSafeInteger(totalQuantity) ||
		totalQuantity < 0 ||
		!Number.isSafeInteger(reservedQuantity) ||
		reservedQuantity < 0 ||
		reservedQuantity > totalQuantity
	) {
		throw new Error("Invalid equipment availability data.");
	}

	return {
		equipmentId,
		date,
		totalQuantity,
		reservedQuantity,
		availableQuantity: totalQuantity - reservedQuantity,
	};
}
