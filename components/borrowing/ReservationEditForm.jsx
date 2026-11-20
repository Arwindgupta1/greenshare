"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateReservation } from "@/app/actions/updateReservation";
import styles from "./ReservationEditForm.module.css";

const initialState = {
	success: false,
	message: "",
};

export default function ReservationEditForm({ reservationId, date, quantity }) {
	const router = useRouter();

	const [result, formAction, pending] = useActionState(
		updateReservation,
		initialState,
	);

	// The page needs fresh booking details once the changes have been saved.
	useEffect(
		function () {
			if (result.success) {
				router.refresh();
			}
		},
		[result.success, router],
	);

	return (
		<form action={formAction} className={styles.form}>
			<h3>Edit reservation</h3>

			<input type="hidden" name="reservationId" value={reservationId} />

			<div className={styles.fields}>
				<div className={styles.field}>
					<label htmlFor="edit-date">Borrowing date</label>

					<select
						id="edit-date"
						name="date"
						defaultValue={date}
						disabled={pending}
						required
					>
						<option value="2027-02-01">1 February 2027</option>
						<option value="2027-02-02">2 February 2027</option>
						<option value="2027-02-03">3 February 2027</option>
					</select>
				</div>

				<div className={styles.field}>
					<label htmlFor="edit-quantity">Quantity</label>

					<input
						id="edit-quantity"
						type="number"
						name="quantity"
						min="1"
						step="1"
						defaultValue={quantity}
						disabled={pending}
						required
					/>
				</div>
			</div>

			<button type="submit" className={styles.saveButton} disabled={pending}>
				{pending ? "Saving..." : "Save changes"}
			</button>

			{result.message && (
				<p
					role="status"
					className={result.success ? styles.success : styles.error}
				>
					{result.message}
				</p>
			)}
		</form>
	);
}
