"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEquipment } from "@/app/actions/deleteEquipment";
import styles from "./EquipmentDeleteButton.module.css";

/*
  Here created this button so library admins can remove equipment
  directly from its library page. I added confirmation to avoid
  accidental deletion and show an error if the item cannot be removed.
  The actual permission and reservation checks remain on the server.
 */
export default function EquipmentDeleteButton({ equipment }) {
	const router = useRouter();
	const [deleting, setDeleting] = useState(false);
	const [message, setMessage] = useState("");

	async function handleDelete() {
		const confirmed = window.confirm(
			`Are you sure you want to delete "${equipment.name}"? This cannot be undone.`,
		);

		if (!confirmed) {
			return;
		}

		setDeleting(true);
		setMessage("");

		try {
			const result = await deleteEquipment(equipment.id);

			if (result.success) {
				// I refresh the library page so the deleted item disappears.
				router.refresh();
			} else {
				setMessage(result.message);
			}
		} catch (error) {
			console.error("Cannot delete equipment.", error);
			setMessage("Something went wrong. Please try again later.");
		} finally {
			setDeleting(false);
		}
	}

	return (
		<div className={styles.deleteArea}>
			<button
				type="button"
				className={styles.deleteButton}
				onClick={handleDelete}
				disabled={deleting}
			>
				{deleting ? "Deleting..." : "Delete equipment"}
			</button>

			{message && (
				<p className={styles.error} role="alert">
					{message}
				</p>
			)}
		</div>
	);
}
