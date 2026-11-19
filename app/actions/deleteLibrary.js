"use server";

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";

export async function deleteLibrary(libraryId) {
	await requireLibraryAdmin();

	if (
		typeof libraryId !== "string" ||
		!libraryId.trim() ||
		libraryId.includes("/")
	) {
		return {
			success: false,
			message: "Invalid library.",
		};
	}

	try {
		const db = getServerDb();
		const libraryRef = db.collection("libraries").doc(libraryId);
		const library = await libraryRef.get();

		if (!library.exists) {
			return {
				success: false,
				message: "Library not found.",
			};
		}

		// I check for linked equipment and reservations before deleting a location.
		const equipment = await db
			.collection("equipment")
			.where("libraryId", "==", libraryId)
			.limit(1)
			.get();

		const reservations = await db
			.collection("reservations")
			.where("libraryId", "==", libraryId)
			.limit(1)
			.get();

		if (!equipment.empty || !reservations.empty) {
			return {
				success: false,
				message: "This library has linked records and cannot be deleted.",
			};
		}

		// I only remove the library when no linked records were found.
		await libraryRef.delete();

		revalidatePath("/admin");
		revalidatePath("/");

		return {
			success: true,
			message: "Library deleted successfully.",
		};
	} catch (error) {
		console.error("Could not delete library.", error);

		return {
			success: false,
			message: "Could not delete the library.",
		};
	}
}
