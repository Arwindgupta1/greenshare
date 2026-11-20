"use client";
/*
  Workers can use this form to choose a date and reserve equipment.
  I also included a stock check to prevent bookings when
  there are not enough items available.
 */

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createReservation } from "@/app/actions/createReservation";
import styles from "./BorrowForm.module.css";

const initialState = {
	success: false,
	message: "",
};

const borrowingDates = [
	{ value: "2027-02-01", label: "1 February 2027" },
	{ value: "2027-02-02", label: "2 February 2027" },
	{ value: "2027-02-03", label: "3 February 2027" },
];

export default function BorrowForm({ equipment, availability }) {
	const router = useRouter();

	const [date, setDate] = useState("2027-02-01");
	const [result, formAction, saving] = useActionState(
		createReservation,
		initialState,
	);

	const availableQuantity = availability[date] ?? 0;

	// refresh - so the page after booking is updated and its available stock
	useEffect(
		function () {
			if (result.success) {
				router.refresh();
			}
		},
		[result, router],
	);

	return (
		<form action={formAction} className={styles.form}>
			<input type="hidden" name="equipmentId" value={equipment.id} />

			<h4>Borrow this equipment</h4>

			<div className={styles.fields}>
				<div className={styles.field}>
					<label htmlFor={`date-${equipment.id}`}>Borrowing date</label>

					<select
						id={`date-${equipment.id}`}
						name="date"
						value={date}
						onChange={function (event) {
							setDate(event.target.value);
						}}
						disabled={saving}
						required
					>
						{borrowingDates.map(function (day) {
							return (
								<option key={day.value} value={day.value}>
									{day.label}
								</option>
							);
						})}
					</select>
				</div>

				<div className={styles.field}>
					<label htmlFor={`quantity-${equipment.id}`}>Quantity</label>

					<input
						id={`quantity-${equipment.id}`}
						key={date}
						name="quantity"
						type="number"
						min={1}
						max={Math.max(1, availableQuantity)}
						step={1}
						defaultValue={1}
						disabled={saving || availableQuantity === 0}
						required
					/>
				</div>
			</div>

			<p className={styles.availability} role="status">
				{availableQuantity === 0
					? "No units available for this date."
					: `${availableQuantity} units available for this date.`}
			</p>

			<button
				type="submit"
				disabled={saving || availableQuantity === 0}
				className={styles.button}
			>
				{saving ? "Reserving..." : "Confirm reservation"}
			</button>

			{result.message && (
				<p
					className={result.success ? styles.success : styles.error}
					role="status"
				>
					{result.message}
				</p>
			)}
		</form>
	);
}
