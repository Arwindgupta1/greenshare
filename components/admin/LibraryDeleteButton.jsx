"use client";

import { useState } from "react";
import { deleteLibrary } from "@/app/actions/deleteLibrary";
import styles from "./LibraryList.module.css";

export default function LibraryDeleteButton({ library }) {
	const [deleting, setDeleting] = useState(false);
	const [message, setMessage] = useState("");

	async function handleDelete() {
		// I ask for confirmation so a library cannot be deleted by one accidental click.
		const confirmed = window.confirm(
			`Are you sure you want to delete "${library.name}"? This cannot be undone.`,
		);

		if (!confirmed) {
			return;
		}

		setDeleting(true);
		setMessage("");

		try {
			// The Server Action checks admin permissions and linked records.
			const result = await deleteLibrary(library.id);

			if (!result.success) {
				setMessage(result.message);
			}
		} catch (error) {
			console.error("Could not delete library.", error);
			setMessage("Something went wrong. Please try again.");
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
				{deleting ? "Deleting..." : "Delete"}
			</button>

			{message && (
				<p className={styles.error} role="alert">
					{message}
				</p>
			)}
		</div>
	);
}
