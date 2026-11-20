"use server";

/**
 * I created this Server Action so administrators can remove equipment that is no longer needed in a library.
 * I check permissions on the server and make sure the equipment exists before deleting it.
 * I also prevent deletion when reservations are linked to the item, because those records
 * will be needed for borrowing history and after deletion I revalidate the library page to display
 * updated equipment list.
 */

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";

export async function deleteEquipment(equipmentId) {
	await requireLibraryAdmin();

	if (
		typeof equipmentId !== "string" ||
		!equipmentId.trim() ||
		equipmentId.includes("/") ||
		equipmentId.length > 1500
	) {
		return {
			success: false,
			message: "Invalid equipment.",
		};
	}

	try {
		const db = getServerDb();
		const equipmentRef = db.collection("equipment").doc(equipmentId);

		const reservationQuery = db
			.collection("reservations")
			.where("equipmentId", "==", equipmentId)
			.limit(1);

		// I moved the checks and deletion into one transaction to prevent conflicts with new reservations.
		const libraryId = await db.runTransaction(async function (transaction) {
			const equipment = await transaction.get(equipmentRef);

			if (!equipment.exists) {
				throw new Error("EQUIPMENT_NOT_FOUND");
			}

			// checking for linked reservations before removing the item.
			const reservations = await transaction.get(reservationQuery);

			if (!reservations.empty) {
				throw new Error("EQUIPMENT_HAS_RESERVATIONS");
			}

			const libraryId = equipment.data().libraryId;

			// I delete only selected equipment document.
			transaction.delete(equipmentRef);

			return libraryId;
		});

		revalidatePath("/admin");
		revalidatePath("/equipment");

		if (libraryId) {
			revalidatePath(`/libraries/${libraryId}`);
		}

		return {
			success: true,
			message: "Equipment deleted successfully.",
		};
	} catch (error) {
		if (error.message === "EQUIPMENT_NOT_FOUND") {
			return {
				success: false,
				message: "Equipment not found.",
			};
		}

		if (error.message === "EQUIPMENT_HAS_RESERVATIONS") {
			return {
				success: false,
				message:
					"This equipment has borrowing reservations and cannot be deleted.",
			};
		}

		console.error("Could not delete equipment.", error);

		return {
			success: false,
			message: "Could not delete the equipment. Please try again.",
		};
	}
}
