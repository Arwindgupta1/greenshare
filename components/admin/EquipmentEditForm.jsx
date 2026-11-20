"use client";

import { useActionState, useState } from "react";
import { updateEquipment } from "@/app/actions/updateEquipment";
import styles from "./EquipmentEditForm.module.css";

const initialState = {
	success: false,
	message: "",
};

export default function EquipmentEditForm({ equipment, libraries, libraryId }) {
	const [editing, setEditing] = useState(false);
	const [result, formAction, saving] = useActionState(
		updateEquipment,
		initialState,
	);

	return (
		<div className={styles.editArea}>
			<button
				type="button"
				className={styles.editButton}
				onClick={() => setEditing(!editing)}
				aria-expanded={editing}
				aria-controls={`equipment-form-${equipment.id}`}
			>
				{editing ? "Cancel editing" : "Edit equipment"}
			</button>

			{editing && (
				<form
					id={`equipment-form-${equipment.id}`}
					action={formAction}
					className={styles.form}
				>
					<input type="hidden" name="equipmentId" value={equipment.id} />

					<div className={styles.heading}>
						<h4>Edit equipment</h4>
						<p>Update the details of this item.</p>
					</div>

					{/* I pre-filled the form with the saved details so the admin only changes what is needed. */}
					<div className={styles.field}>
						<label htmlFor={`name-${equipment.id}`}>Equipment name</label>
						<input
							id={`name-${equipment.id}`}
							name="name"
							type="text"
							defaultValue={equipment.name}
							maxLength={100}
							required
						/>
					</div>

					<div className={styles.columns}>
						<div className={styles.field}>
							<label htmlFor={`category-${equipment.id}`}>Category</label>
							<select
								id={`category-${equipment.id}`}
								name="category"
								defaultValue={equipment.category}
								required
							>
								<option value="Tool">Tool</option>
								<option value="Sustainability Equipment">
									Sustainability Equipment
								</option>
							</select>
						</div>

						<div className={styles.field}>
							<label htmlFor={`library-${equipment.id}`}>
								Library location
							</label>
							<select
								id={`library-${equipment.id}`}
								name="libraryId"
								defaultValue={libraryId}
								required
							>
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
						<label htmlFor={`description-${equipment.id}`}>Description</label>
						<textarea
							id={`description-${equipment.id}`}
							name="description"
							defaultValue={equipment.description}
							rows={4}
							maxLength={500}
						/>
					</div>

					<div className={styles.field}>
						<label htmlFor={`quantity-${equipment.id}`}>Total quantity</label>
						<input
							id={`quantity-${equipment.id}`}
							name="totalQuantity"
							type="number"
							min={1}
							max={10000}
							step={1}
							defaultValue={equipment.totalQuantity}
							required
						/>
					</div>

					<button type="submit" className={styles.saveButton} disabled={saving}>
						{saving ? "Saving changes..." : "Save changes"}
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
			)}
		</div>
	);
}
