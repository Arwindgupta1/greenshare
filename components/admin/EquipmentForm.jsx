"use client";

import { useActionState } from "react";
import { addEquipment } from "@/app/actions/addEquipment";
import styles from "./EquipmentForm.module.css";

const initialState = {
	success: false,
	message: "",
};

export default function EquipmentForm({ libraries }) {
	const [result, formAction, saving] = useActionState(
		addEquipment,
		initialState,
	);

	const hasLibraries = libraries.length > 0;

	return (
		<section className={styles.formSection}>
			<div className={styles.heading}>
				<span>EQUIPMENT INVENTORY / 03</span>
				<h2>Add equipment</h2>
				<p>
					Register new equipment and assign it to an existing library location.
				</p>
			</div>

			{/* Used  existing libraries so the admin can select location without entering its Firestore document ID. */}
			<form action={formAction} className={styles.form}>
				<div className={styles.field}>
					<label htmlFor="equipmentName">Equipment name</label>
					<input
						id="equipmentName"
						name="name"
						type="text"
						placeholder="e.g. Cordless Drill"
						maxLength={100}
						required
					/>
				</div>

				<div className={styles.twoColumns}>
					<div className={styles.field}>
						<label htmlFor="equipmentCategory">Equipment category</label>
						<select
							id="equipmentCategory"
							name="category"
							defaultValue=""
							required
						>
							<option value="" disabled>
								Select category
							</option>
							<option value="Tool">Tool</option>
							<option value="Sustainability Equipment">
								Sustainability Equipment
							</option>
						</select>
					</div>

					<div className={styles.field}>
						<label htmlFor="equipmentLibrary">Library location</label>
						<select
							id="equipmentLibrary"
							name="libraryId"
							defaultValue=""
							required
							disabled={!hasLibraries}
						>
							<option value="" disabled>
								Select library
							</option>

							{libraries.map(function (library) {
								return (
									<option key={library.id} value={library.id}>
										{library.name}
									</option>
								);
							})}
						</select>
					</div>
				</div>

				<div className={styles.field}>
					<label htmlFor="equipmentDescription">Description</label>
					<textarea
						id="equipmentDescription"
						name="description"
						rows={4}
						maxLength={500}
						placeholder="Describe the equipment and what is included."
					/>
				</div>

				{/* I store the total stock rather than changing it for each booking date. */}
				<div className={styles.field}>
					<label htmlFor="equipmentQuantity">Total quantity</label>
					<input
						id="equipmentQuantity"
						name="totalQuantity"
						type="number"
						min={1}
						max={10000}
						step={1}
						placeholder="e.g. 8"
						required
					/>
					<p className={styles.hint}>
						Enter the total number of units owned by this library.
					</p>
				</div>

				<button type="submit" disabled={saving || !hasLibraries}>
					{saving ? "Saving equipment..." : "Add equipment"}
				</button>

				{!hasLibraries && (
					<p className={styles.error} role="status">
						Add a library location before registering equipment.
					</p>
				)}

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
