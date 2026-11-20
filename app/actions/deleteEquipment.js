"use server";

/*
  I created this Server Action so administrators can remove equipment that is no longer needed in a library.
  I check permissions on the server and make sure the equipment exists before deleting it. 
  I also prevent deletion when reservations are linked to the item, because those records
  will be needed for borrowing history and after deletion I revalidate the library page to display
  updated equipment list.
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

		const equipment = await equipmentRef.get();

		if (!equipment.exists) {
			return {
				success: false,
				message: "Equipment not found.",
			};
		}

		// checking for linked reservations before removing the item.
		const reservations = await db
			.collection("reservations")
			.where("equipmentId", "==", equipmentId)
			.limit(1)
			.get();

		if (!reservations.empty) {
			return {
				success: false,
				message:
					"This equipment has borrowing reservations and cannot be deleted.",
			};
		}

		const libraryId = equipment.data().libraryId;

		// I delete only selected equipment document.
		await equipmentRef.delete();

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
		console.error("Could not delete equipment.", error);

		return {
			success: false,
			message: "Could not delete the equipment. Please try again.",
		};
	}
}
