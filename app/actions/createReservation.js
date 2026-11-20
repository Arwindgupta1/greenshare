"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getServerDb } from "@/lib/firebase/server";
import { getSignedInAccount } from "@/lib/authentication/serverAccount";

/*
  I created this Server Action to let Workers book equipment for the allowed dates. I use a Firestore transaction again to
  check availability and prevent double bookings.
 */
export async function createReservation(previousState, formData) {
	const account = await getSignedInAccount();

	if (!account || account.role !== "worker") {
		return {
			success: false,
			message: "Please sign in as a Worker to reserve equipment.",
		};
	}

	const equipmentId = String(formData.get("equipmentId") || "").trim();
	const date = String(formData.get("date") || "").trim();
	const quantityText = String(formData.get("quantity") || "").trim();

	const allowedDates = ["2027-02-01", "2027-02-02", "2027-02-03"];

	if (!equipmentId || equipmentId.includes("/") || equipmentId.length > 1500) {
		return {
			success: false,
			message: "Invalid equipment.",
		};
	}

	if (!allowedDates.includes(date)) {
		return {
			success: false,
			message: "Please select a valid borrowing date.",
		};
	}

	const quantity = Number(quantityText);

	if (
		!quantityText ||
		!Number.isSafeInteger(quantity) ||
		quantity < 1 ||
		quantity > 10000
	) {
		return {
			success: false,
			message: "Please enter a valid quantity.",
		};
	}

	const db = getServerDb();

	const equipmentRef = db.collection("equipment").doc(equipmentId);

	const availabilityRef = db
		.collection("equipmentAvailability")
		.doc(`${equipmentId}_${date}`);

	const reservationRef = db.collection("reservations").doc();

	let libraryId;

	try {
		await db.runTransaction(async function (transaction) {
			// I read both documents before making any changes.
			const equipment = await transaction.get(equipmentRef);
			const availability = await transaction.get(availabilityRef);

			if (!equipment.exists) {
				throw new Error("EQUIPMENT_NOT_FOUND");
			}

			const equipmentData = equipment.data();
			const totalQuantity = equipmentData.totalQuantity;

			if (
				!Number.isSafeInteger(totalQuantity) ||
				totalQuantity < 1 ||
				!equipmentData.libraryId
			) {
				throw new Error("INVALID_STOCK");
			}

			const reservedQuantity = availability.exists
				? availability.data().reservedQuantity
				: 0;

			if (
				!Number.isSafeInteger(reservedQuantity) ||
				reservedQuantity < 0 ||
				reservedQuantity > totalQuantity
			) {
				throw new Error("INVALID_AVAILABILITY");
			}

			const availableQuantity = totalQuantity - reservedQuantity;

			if (quantity > availableQuantity) {
				throw new Error("NOT_ENOUGH_STOCK");
			}

			libraryId = equipmentData.libraryId;

			// I update daily reserved quantity and create the booking in the same transaction to prevent overbooking.
			transaction.set(availabilityRef, {
				equipmentId,
				date,
				reservedQuantity: reservedQuantity + quantity,
			});

			transaction.create(reservationRef, {
				workerId: account.uid,
				equipmentId,
				libraryId,
				date,
				quantity,
				status: "confirmed",
				createdAt: FieldValue.serverTimestamp(),
			});
		});

		revalidatePath("/equipment");

		if (libraryId) {
			revalidatePath(`/libraries/${libraryId}`);
		}

		return {
			success: true,
			message: "Equipment reserved successfully.",
		};
	} catch (error) {
		if (error.message === "EQUIPMENT_NOT_FOUND") {
			return {
				success: false,
				message: "This equipment is no longer available.",
			};
		}

		if (error.message === "NOT_ENOUGH_STOCK") {
			return {
				success: false,
				message: "There are not enough units available for this date.",
			};
		}

		if (
			error.message === "INVALID_STOCK" ||
			error.message === "INVALID_AVAILABILITY"
		) {
			console.error("Invalid equipment stock data.", error);

			return {
				success: false,
				message: "Equipment availability could not be verified.",
			};
		}

		console.error("Unable to create reservation.", error);

		return {
			success: false,
			message:
				"Not possible to complete your reservation now. Please try again.",
		};
	}
}
