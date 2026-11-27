/*
  I added this action so workers can change their own reservations, while the admin can also update bookings when needed.
  This part was a bit more complicated because changing a booking can affect how much equipment is available. For example, someone
   might change the date or decide to borrow more items. I used a Firestore transaction to make sure the old stock is
  adjusted and the new booking details are saved together. I also check that there is enough equipment before allowing
  the changes.
 */

"use server";

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { getSignedInAccount } from "@/lib/authentication/serverAccount";

export async function updateReservation(previousState, formData) {
	const account = await getSignedInAccount();

	if (!account || !["worker", "admin"].includes(account.role)) {
		return {
			success: false,
			message: "You do not have permission to edit reservations.",
		};
	}

	const reservationId = String(formData.get("reservationId") || "").trim();
	const date = String(formData.get("date") || "").trim();
	const quantityText = String(formData.get("quantity") || "").trim();
	const quantity = Number(quantityText);

	const allowedDates = ["2027-02-01", "2027-02-02", "2027-02-03"];

	if (!reservationId || reservationId.includes("/")) {
		return {
			success: false,
			message: "Invalid reservation.",
		};
	}

	if (!allowedDates.includes(date)) {
		return {
			success: false,
			message: "Please select a valid borrowing date.",
		};
	}

	if (!quantityText || !Number.isSafeInteger(quantity) || quantity < 1) {
		return {
			success: false,
			message: "Please enter a valid quantity.",
		};
	}

	try {
		const db = getServerDb();
		const reservationRef = db.collection("reservations").doc(reservationId);

		const libraryId = await db.runTransaction(async function (transaction) {
			const reservationDocument = await transaction.get(reservationRef);

			if (!reservationDocument.exists) {
				throw new Error("RESERVATION_NOT_FOUND");
			}

			const reservation = reservationDocument.data();
			// I wanted workers to be able to change only their own bookings.
			// The admin can edit any reservation, so I check who owns it first.
			if (account.role === "worker" && reservation.workerId !== account.uid) {
				throw new Error("NOT_ALLOWED");
			}

			if (reservation.status !== "confirmed") {
				throw new Error("INVALID_STATUS");
			}

			const equipmentRef = db
				.collection("equipment")
				.doc(reservation.equipmentId);

			const equipmentDocument = await transaction.get(equipmentRef);

			if (!equipmentDocument.exists) {
				throw new Error("EQUIPMENT_NOT_FOUND");
			}

			const totalQuantity = equipmentDocument.data().totalQuantity;
			const oldDate = reservation.date;
			const oldQuantity = reservation.quantity;

			const oldAvailabilityRef = db
				.collection("equipmentAvailability")
				.doc(`${reservation.equipmentId}_${oldDate}`);

			const oldAvailability = await transaction.get(oldAvailabilityRef);

			if (!oldAvailability.exists) {
				throw new Error("INVALID_STOCK");
			}

			const oldReserved = oldAvailability.data().reservedQuantity;

			if (
				!Number.isSafeInteger(oldQuantity) ||
				oldQuantity < 1 ||
				!Number.isSafeInteger(totalQuantity) ||
				totalQuantity < 1 ||
				!Number.isSafeInteger(oldReserved) ||
				oldReserved < oldQuantity
			) {
				throw new Error("INVALID_STOCK");
			}

			if (date === oldDate) {
				// For the same day, only the difference in quantity matters.
				const newReserved = oldReserved - oldQuantity + quantity;

				if (newReserved > totalQuantity) {
					throw new Error("NOT_ENOUGH_STOCK");
				}

				transaction.update(oldAvailabilityRef, {
					reservedQuantity: newReserved,
				});
			} else {
				const newAvailabilityRef = db
					.collection("equipmentAvailability")
					.doc(`${reservation.equipmentId}_${date}`);

				const newAvailability = await transaction.get(newAvailabilityRef);

				const newReserved = newAvailability.exists
					? newAvailability.data().reservedQuantity
					: 0;

				if (!Number.isSafeInteger(newReserved) || newReserved < 0) {
					throw new Error("INVALID_STOCK");
				}

				if (newReserved + quantity > totalQuantity) {
					throw new Error("NOT_ENOUGH_STOCK");
				}

				// If someone changes the date, I need to put the equipment back
				// for the old day and reserve it again for the newly selected date.
				// Otherwise the available stock would be incorrect.
				transaction.update(oldAvailabilityRef, {
					reservedQuantity: oldReserved - oldQuantity,
				});

				transaction.set(newAvailabilityRef, {
					equipmentId: reservation.equipmentId,
					date,
					reservedQuantity: newReserved + quantity,
				});
			}

			transaction.update(reservationRef, {
				date,
				quantity,
			});

			return reservation.libraryId;
		});

		revalidatePath("/my-borrowing");
		revalidatePath(`/my-borrowing/${reservationId}`);
		revalidatePath("/equipment");
		revalidatePath("/locations");
		revalidatePath("/admin/reservations");

		if (libraryId) {
			revalidatePath(`/libraries/${libraryId}`);
		}

		return {
			success: true,
			message: "Reservation updated successfully.",
		};
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
				message: "You cannot edit another Worker's reservation.",
			};
		}

		if (error.message === "NOT_ENOUGH_STOCK") {
			return {
				success: false,
				message: "Not enough equipment available for this date.",
			};
		}

		if (
			error.message === "INVALID_STATUS" ||
			error.message === "EQUIPMENT_NOT_FOUND" ||
			error.message === "INVALID_STOCK"
		) {
			return {
				success: false,
				message: "This reservation cannot be updated.",
			};
		}

		console.error("Could not update reservation.", error);

		return {
			success: false,
			message: "Could not update the reservation. Please try again.",
		};
	}
}
