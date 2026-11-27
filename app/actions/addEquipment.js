"use server";

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";

/*
I made this action so the admin can add new equipment to a selected library.
One thing I wanted to avoid was adding equipment to a library that might
have been deleted in the meantime. That's why I check if the library
still exists before saving the new equipment in Firestore.
*/
export async function addEquipment(previousState, formData) {
	await requireLibraryAdmin();

	const name = String(formData.get("name") || "").trim();
	const category = String(formData.get("category") || "").trim();
	const libraryId = String(formData.get("libraryId") || "").trim();
	const description = String(formData.get("description") || "").trim();
	const quantityText = String(formData.get("totalQuantity") || "").trim();

	if (!name || !category || !libraryId || !quantityText) {
		return {
			success: false,
			message: "Please complete all required fields.",
		};
	}

	if (name.length > 100 || description.length > 500) {
		return {
			success: false,
			message: "Some equipment details are too long.",
		};
	}

	if (category !== "Tool" && category !== "Sustainability Equipment") {
		return {
			success: false,
			message: "Please select a valid equipment category.",
		};
	}

	if (libraryId.includes("/") || libraryId.length > 1500) {
		return {
			success: false,
			message: "Invalid library location.",
		};
	}

	const totalQuantity = Number(quantityText);

	if (
		!Number.isSafeInteger(totalQuantity) ||
		totalQuantity < 1 ||
		totalQuantity > 10000
	) {
		return {
			success: false,
			message: "Quantity must be a whole number between 1 and 10000.",
		};
	}

	try {
		const db = getServerDb();
		const libraryRef = db.collection("libraries").doc(libraryId);
		const equipmentRef = db.collection("equipment").doc();

		await db.runTransaction(async function (transaction) {
			// I check the selected library inside the transaction
			// before assigning equipment to it.
			const library = await transaction.get(libraryRef);

			if (!library.exists) {
				throw new Error("LIBRARY_NOT_FOUND");
			}

			// I only save the total number of items here. The actual available
			// quantity is worked out separately for each date, depending on
			// how many units have already been booked.
			transaction.create(equipmentRef, {
				name,
				category,
				libraryId,
				description,
				totalQuantity,
				active: true,
			});
		});

		revalidatePath("/admin");
		revalidatePath("/");
		revalidatePath("/equipment");
		revalidatePath("/locations"); // Added this to keep the library map up to date.
		revalidatePath(`/libraries/${libraryId}`);

		return {
			success: true,
			message: "Equipment added successfully.",
		};
	} catch (error) {
		if (error.message === "LIBRARY_NOT_FOUND") {
			return {
				success: false,
				message: "The selected library no longer exists.",
			};
		}

		console.error("Could not add equipment.", error);

		return {
			success: false,
			message: "Could not save the equipment. Please try again.",
		};
	}
}
