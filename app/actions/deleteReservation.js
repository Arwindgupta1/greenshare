"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerDb } from "@/lib/firebase/server";
import { getSignedInAccount } from "@/lib/authentication/serverAccount";

/**
 * Removing a reservation should also release the equipment
 * it was holding for that particular day. Both changes belong
 * in one transaction, otherwise the stock could become incorrect.
 */
export async function deleteReservation(previousState, formData) {
	const account = await getSignedInAccount();

	if (!account || !["worker", "admin"].includes(account.role)) {
		return {
			success: false,
			message: "You do not have permission to delete reservations.",
		};
	}

	const reservationId = formData.get("reservationId");

	if (
		typeof reservationId !== "string" ||
		!reservationId.trim() ||
		reservationId.includes("/") ||
		reservationId.length > 1500
	) {
		return {
			success: false,
			message: "Invalid reservation.",
		};
	}

	try {
		const db = getServerDb();
		const reservationRef = db.collection("reservations").doc(reservationId);

		await db.runTransaction(async function (transaction) {
			const reservationDocument = await transaction.get(reservationRef);

			if (!reservationDocument.exists) {
				throw new Error("RESERVATION_NOT_FOUND");
			}

			const reservation = reservationDocument.data();

			if (account.role === "worker" && reservation.workerId !== account.uid) {
				throw new Error("NOT_ALLOWED");
			}

			if (reservation.status !== "confirmed") {
				throw new Error("INVALID_STATUS");
			}

			const availabilityRef = db
				.collection("equipmentAvailability")
				.doc(`${reservation.equipmentId}_${reservation.date}`);

			const availabilityDocument = await transaction.get(availabilityRef);

			if (!availabilityDocument.exists) {
				throw new Error("AVAILABILITY_NOT_FOUND");
			}

			const reservedQuantity = availabilityDocument.data().reservedQuantity;

			if (
				!Number.isSafeInteger(reservation.quantity) ||
				reservation.quantity < 1 ||
				!Number.isSafeInteger(reservedQuantity) ||
				reservedQuantity < reservation.quantity
			) {
				throw new Error("INVALID_STOCK");
			}

			// Give the reserved units back to the same borrowing date.
			transaction.update(availabilityRef, {
				reservedQuantity: reservedQuantity - reservation.quantity,
			});

			transaction.delete(reservationRef);
		});

		revalidatePath("/my-borrowing");
		revalidatePath("/equipment");
	} catch (error) {
		if (error.message === "RESERVATION_NOT_FOUND") {
			return {
				success: false,
				message: "Reservation not found.",
			};
		}

		if (error.message === "NOT_ALLOWED") {
			return {
				success: false,
				message: "You cannot delete another Worker's reservation.",
			};
		}

		if (error.message === "INVALID_STATUS") {
			return {
				success: false,
				message: "This reservation cannot be deleted.",
			};
		}

		if (
			error.message === "AVAILABILITY_NOT_FOUND" ||
			error.message === "INVALID_STOCK"
		) {
			return {
				success: false,
				message: "Reservation stock records could not be verified.",
			};
		}

		console.error("Could not delete reservation.", error);

		return {
			success: false,
			message: "Could not delete the reservation. Please try again.",
		};
	}

	// The deleted reservation has no details page, so leave it on the server.
	redirect("/my-borrowing");
}
