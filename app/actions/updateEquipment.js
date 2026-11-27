/*
  I added this action because I wanted the admin to be able to change equipment details without deleting 
  the item and adding it again. Before saving anything I check if the equipment and selected library
  still exist in Firestore. I also had to think about what happens when someone changes the total
  stock but workers have already made reservations. Because of this I check the existing bookings so the admin cannot reduce the stock below the number of items already reserved.
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

	const dates = ["2027-02-01", "2027-02-02", "2027-02-03"];

	try {
		const db = getServerDb();

		const equipmentRef = db.collection("equipment").doc(equipmentId);
		const libraryRef = db.collection("libraries").doc(libraryId);

		const availabilityRefs = dates.map(function (date) {
			return db
				.collection("equipmentAvailability")
				.doc(`${equipmentId}_${date}`);
		});

		const reservationQuery = db
			.collection("reservations")
			.where("equipmentId", "==", equipmentId)
			.limit(1);

		const savedEquipment = await db.runTransaction(
			async function (transaction) {
				const equipment = await transaction.get(equipmentRef);
				const library = await transaction.get(libraryRef);

				if (!equipment.exists) {
					throw new Error("EQUIPMENT_NOT_FOUND");
				}

				if (!library.exists) {
					throw new Error("LIBRARY_NOT_FOUND");
				}

				const currentEquipment = equipment.data();

				// I check the reserved quantity for each borrowing date before updating the stock.
				for (const reference of availabilityRefs) {
					const availability = await transaction.get(reference);

					if (!availability.exists) {
						continue;
					}

					const reservedQuantity = availability.data().reservedQuantity;

					if (
						!Number.isSafeInteger(reservedQuantity) ||
						reservedQuantity < 0 ||
						reservedQuantity > currentEquipment.totalQuantity
					) {
						throw new Error("INVALID_AVAILABILITY");
					}

					if (totalQuantity < reservedQuantity) {
						throw new Error("STOCK_BELOW_BOOKINGS");
					}
				}

				// I block location changes when reservations already exist to preserve the booking history.
				if (libraryId !== currentEquipment.libraryId) {
					const reservations = await transaction.get(reservationQuery);

					if (!reservations.empty) {
						throw new Error("LOCATION_HAS_BOOKINGS");
					}
				}

				// I update the same document instead of creating another one
				// so the equipment keeps its ID and existing reservations still
				// point to the correct item.
				transaction.update(equipmentRef, {
					name,
					category,
					libraryId,
					description,
					totalQuantity,
				});

				return currentEquipment;
			},
		);

		revalidatePath("/admin");
		revalidatePath("/equipment");
		revalidatePath("/locations");
		revalidatePath(`/libraries/${savedEquipment.libraryId}`);
		revalidatePath(`/libraries/${libraryId}`);

		return {
			success: true,
			message: "Equipment updated successfully.",
		};
	} catch (error) {
		if (error.message === "EQUIPMENT_NOT_FOUND") {
			return {
				success: false,
				message: "Equipment not found.",
			};
		}

		if (error.message === "LIBRARY_NOT_FOUND") {
			return {
				success: false,
				message: "The selected library does not exist.",
			};
		}

		if (error.message === "STOCK_BELOW_BOOKINGS") {
			return {
				success: false,
				message: "Stock cannot be lower than the quantity already reserved.",
			};
		}

		if (error.message === "LOCATION_HAS_BOOKINGS") {
			return {
				success: false,
				message:
					"Equipment with reservations cannot be moved to another library.",
			};
		}

		if (error.message === "INVALID_AVAILABILITY") {
			return {
				success: false,
				message: "Equipment availability data is invalid.",
			};
		}

		console.error("Could not update equipment.", error);

		return {
			success: false,
			message: "Unable to update the equipment. Please try again.",
		};
	}
}
