"use client";

import { useActionState } from "react";
import { addLibrary } from "@/app/actions/addLibrary";
import styles from "./LibraryForm.module.css";

const startingState = {
	success: false,
	message: "",
};

export default function LibraryForm() {
	const [result, formAction, saving] = useActionState(
		addLibrary,
		startingState,
	);

	return (
		<section className={styles.formSection}>
			<div className={styles.heading}>
				<span>NEW LOCATION / 01</span>
				<h2>Add a library</h2>
				<p>Enter the details of the new equipment library.</p>
			</div>

			{/* I used a Server Action so the form can save directly to Firestore. */}
			<form action={formAction} className={styles.form}>
				<div className={styles.field}>
					<label htmlFor="libraryName">Library name</label>
					<input
						id="libraryName"
						name="name"
						type="text"
						placeholder="e.g. Riverside Tool Room"
						maxLength={100}
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor="libraryAddress">Street address</label>
					<input
						id="libraryAddress"
						name="address"
						type="text"
						placeholder="Street and building number"
						maxLength={150}
						required
					/>
				</div>

				<div className={styles.twoColumns}>
					<div className={styles.field}>
						<label htmlFor="libraryCity">Town or city</label>
						<input
							id="libraryCity"
							name="city"
							type="text"
							placeholder="e.g. London"
							maxLength={80}
							required
						/>
					</div>

					<div className={styles.field}>
						<label htmlFor="libraryPostcode">Postcode</label>
						<input
							id="libraryPostcode"
							name="postcode"
							type="text"
							placeholder="e.g. CM20 1AA"
							maxLength={20}
							required
						/>
					</div>
				</div>

				{/* I added coordinates because each library needs a map marker later. */}
				<div className={styles.twoColumns}>
					<div className={styles.field}>
						<label htmlFor="libraryLatitude">Latitude</label>
						<input
							id="libraryLatitude"
							name="latitude"
							type="number"
							step="any"
							min={-90}
							max={90}
							placeholder="e.g. 51.77"
							required
						/>
					</div>

					<div className={styles.field}>
						<label htmlFor="libraryLongitude">Longitude</label>
						<input
							id="libraryLongitude"
							name="longitude"
							type="number"
							step="any"
							min={-180}
							max={180}
							placeholder="e.g. 0.10"
							required
						/>
					</div>
				</div>

				<button type="submit" disabled={saving}>
					{saving ? "Saving location..." : "Add library"}
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
		</section>
	);
}
