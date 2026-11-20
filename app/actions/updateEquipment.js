/*
 * I created this Server Action so library admins can update equipment details without creating a new Firestore document.
 I check the admin's permissions and validate the submitted values on the server. I also check that the equipment and
 selected library still exist before saving any changes. I keep the total stock separate from daily availability
 because reservations will be managed by date later.
 */

"use server";

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";

export async function updateEquipment(previousState, formData) {
	await requireLibraryAdmin();

	const equipmentId = String(formData.get("equipmentId") || "").trim();
	const name = String(formData.get("name") || "").trim();
	const category = String(formData.get("category") || "").trim();
	const libraryId = String(formData.get("libraryId") || "").trim();
	const description = String(formData.get("description") || "").trim();
	const quantityText = String(formData.get("totalQuantity") || "").trim();

	if (!equipmentId || equipmentId.includes("/") || equipmentId.length > 1500) {
		return {
			success: false,
			message: "Invalid equipment.",
		};
	}

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

		const equipmentRef = db.collection("equipment").doc(equipmentId);
		const libraryRef = db.collection("libraries").doc(libraryId);

		const equipment = await equipmentRef.get();
		const library = await libraryRef.get();

		if (!equipment.exists) {
			return {
				success: false,
				message: "Equipment not found.",
			};
		}

		if (!library.exists) {
			return {
				success: false,
				message: "The selected library does not exist.",
			};
		}

		// I block stock or location changes when reservations already exist until the booking rules are implemented.
		const reservations = await db
			.collection("reservations")
			.where("equipmentId", "==", equipmentId)
			.limit(1)
			.get();

		const savedEquipment = equipment.data();

		if (
			!reservations.empty &&
			(libraryId !== savedEquipment.libraryId ||
				totalQuantity !== savedEquipment.totalQuantity)
		) {
			return {
				success: false,
				message:
					"Stock and location cannot be changed while this equipment has reservations.",
			};
		}

		// it was required to update the existing document to keep its ID and preserve its connection to the library.
		await equipmentRef.update({
			name,
			category,
			libraryId,
			description,
			totalQuantity,
		});

		revalidatePath("/admin");
		revalidatePath("/equipment");
		revalidatePath(`/libraries/${savedEquipment.libraryId}`);
		revalidatePath(`/libraries/${libraryId}`);

		return {
			success: true,
			message: "Equipment updated successfully.",
		};
	} catch (error) {
		console.error("Could not update equipment.", error);

		return {
			success: false,
			message: "Unable to update the equipment. Please try again.",
		};
	}
}
