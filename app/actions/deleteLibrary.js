"use server";

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";

/*
  Created this Server Action so administrators can delete a library that has no equipment or borrowing reservations.
  I check permissions and linked records before deleting the  library. I now use a Firestore transaction to keep these checks and the deletion together.
 */
export async function deleteLibrary(libraryId) {
	await requireLibraryAdmin();

	if (
		typeof libraryId !== "string" ||
		!libraryId.trim() ||
		libraryId.includes("/") ||
		libraryId.length > 1500
	) {
		return {
			success: false,
			message: "Invalid library.",
		};
	}

	try {
		const db = getServerDb();
		const libraryRef = db.collection("libraries").doc(libraryId);

		const equipmentQuery = db
			.collection("equipment")
			.where("libraryId", "==", libraryId)
			.limit(1);

		const reservationQuery = db
			.collection("reservations")
			.where("libraryId", "==", libraryId)
			.limit(1);

		// I moved the checks into a transaction so they
		// are completed before deleting the library.
		await db.runTransaction(async function (transaction) {
			const library = await transaction.get(libraryRef);

			if (!library.exists) {
				throw new Error("LIBRARY_NOT_FOUND");
			}

			// I check for linked equipment and reservations
			// before deleting the location.
			const equipment = await transaction.get(equipmentQuery);
			const reservations = await transaction.get(reservationQuery);

			if (!equipment.empty || !reservations.empty) {
				throw new Error("LIBRARY_HAS_RECORDS");
			}

			// I only delete the library when no linked records were found.
			transaction.delete(libraryRef);
		});

		revalidatePath("/admin");
		revalidatePath("/");
		revalidatePath("/locations"); // I added this so the library list on the map stays updated.
		revalidatePath("/equipment");

		return {
			success: true,
			message: "Library deleted successfully.",
		};
	} catch (error) {
		if (error.message === "LIBRARY_NOT_FOUND") {
			return {
				success: false,
				message: "Library not found.",
			};
		}

		if (error.message === "LIBRARY_HAS_RECORDS") {
			return {
				success: false,
				message: "This library has linked records and cannot be deleted.",
			};
		}

		console.error("Could not delete library.", error);

		return {
			success: false,
			message: "Could not delete the library.",
		};
	}
}
