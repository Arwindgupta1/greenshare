"use client";

import { useActionState } from "react";
import { deleteReservation } from "@/app/actions/deleteReservation";
import styles from "./ReservationDeleteButton.module.css";

const initialState = {
	success: false,
	message: "",
};

export default function ReservationDeleteButton({ reservationId }) {
	const [result, formAction, pending] = useActionState(
		deleteReservation,
		initialState,
	);

	function confirmDeletion(event) {
		const confirmed = window.confirm(
			"Are you sure you want to delete this reservation? The reserved equipment will become available again.",
		);

		if (!confirmed) {
			event.preventDefault();
		}
	}

	return (
		<div className={styles.wrapper}>
			<form action={formAction} onSubmit={confirmDeletion}>
				<input type="hidden" name="reservationId" value={reservationId} />

				<button
					type="submit"
					disabled={pending}
					className={styles.deleteButton}
				>
					{pending ? "Deleting..." : "Delete reservation"}
				</button>
			</form>

			{result.message && (
				<p role="status" className={styles.error}>
					{result.message}
				</p>
			)}
		</div>
	);
}
