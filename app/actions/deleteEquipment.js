"use server";

/*
  I added this action so the admin can remove equipment that is no longer needed in the library. 
  One thing I had to consider was what happens if someone has already booked that equipment. Because of
  this I check for existing reservations before allowing it to be deleted so the borrowing records are not affected.
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

			// Before deleting anything, I check if this equipment has any bookings.
			// If it does, I don't want to remove it from the library.
			const reservations = await transaction.get(reservationQuery);

			if (!reservations.empty) {
				throw new Error("EQUIPMENT_HAS_RESERVATIONS");
			}

			const libraryId = equipment.data().libraryId;

			// At this point I know there are no bookings, so I can delete
			// this equipment without removing the whole library.
			transaction.delete(equipmentRef);

			return libraryId;
		});

		revalidatePath("/admin");
		revalidatePath("/equipment");
		revalidatePath("/locations");

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
