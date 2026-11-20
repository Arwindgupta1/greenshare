"use server";

/*
  I created this Server Action to allow library administrators to add
  new equipment to an existing library. I used a Server Action because
  the data needs to be validated and saved securely in Firestore,
  without allowing the browser to access administrative operations.
  The function checks the admin's permissions, validates the equipment
  details and makes sure the selected library exists before saving.
  I also keep the total stock quantity separate from reservations,
  so availability can be calculated for each borrowing date later.
  After saving, I revalidate the relevant pages so the new equipment
  can be displayed without relying on outdated data.
 */

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";

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

		// I check the selected library before linking equipment to it.
		const library = await libraryRef.get();

		if (!library.exists) {
			return {
				success: false,
				message: "The selected library no longer exists.",
			};
		}

		// I keep the total stock separate from daily reservations.
		// This will let us calculate availability for each borrowing date.
		await db.collection("equipment").add({
			name,
			category,
			libraryId,
			description,
			totalQuantity,
			active: true,
		});

		revalidatePath("/admin");
		revalidatePath("/");
		revalidatePath("/equipment");

		return {
			success: true,
			message: "Equipment added successfully.",
		};
	} catch (error) {
		console.error("Could not add equipment.", error);

		return {
			success: false,
			message: "Could not save the equipment. Please try again.",
		};
	}
}
