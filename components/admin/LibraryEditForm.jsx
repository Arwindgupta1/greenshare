"use client";

import { useActionState, useState } from "react";
import { updateLibrary } from "@/app/actions/updateLibrary";
import styles from "./LibraryList.module.css";

const initialState = {
	success: false,
	message: "",
};

export default function LibraryEditForm({ library }) {
	const [editing, setEditing] = useState(false);
	const [result, formAction, saving] = useActionState(
		updateLibrary,
		initialState,
	);

	return (
		<div className={styles.editArea}>
			<button
				type="button"
				className={styles.editButton}
				onClick={() => setEditing(!editing)}
				aria-expanded={editing}
			>
				{editing ? "Cancel" : "Edit"}
			</button>

			{editing && (
				<form action={formAction} className={styles.editForm}>
					<input type="hidden" name="libraryId" value={library.id} />

					<div className={styles.editHeading}>
						<h4>Edit location</h4>
						<p>Update the details of this library.</p>
					</div>

					{/* I used the saved values so the admin only needs
              to change the details that are incorrect. */}
					<div className={styles.editField}>
						<label htmlFor={`name-${library.id}`}>Library name</label>
						<input
							id={`name-${library.id}`}
							name="name"
							type="text"
							defaultValue={library.name}
							maxLength={100}
							required
						/>
					</div>

					<div className={styles.editField}>
						<label htmlFor={`address-${library.id}`}>Street address</label>
						<input
							id={`address-${library.id}`}
							name="address"
							type="text"
							defaultValue={library.address || ""}
							maxLength={150}
							required
						/>
					</div>

					<div className={styles.editColumns}>
						<div className={styles.editField}>
							<label htmlFor={`city-${library.id}`}>Town or city</label>
							<input
								id={`city-${library.id}`}
								name="city"
								type="text"
								defaultValue={library.city || ""}
								maxLength={80}
								required
							/>
						</div>

						<div className={styles.editField}>
							<label htmlFor={`postcode-${library.id}`}>Postcode</label>
							<input
								id={`postcode-${library.id}`}
								name="postcode"
								type="text"
								defaultValue={library.postcode || ""}
								maxLength={20}
								required
							/>
						</div>
					</div>

					<div className={styles.editColumns}>
						<div className={styles.editField}>
							<label htmlFor={`latitude-${library.id}`}>Latitude</label>
							<input
								id={`latitude-${library.id}`}
								name="latitude"
								type="number"
								step="any"
								min={-90}
								max={90}
								defaultValue={library.latitude ?? ""}
								required
							/>
						</div>

						<div className={styles.editField}>
							<label htmlFor={`longitude-${library.id}`}>Longitude</label>
							<input
								id={`longitude-${library.id}`}
								name="longitude"
								type="number"
								step="any"
								min={-180}
								max={180}
								defaultValue={library.longitude ?? ""}
								required
							/>
						</div>
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
