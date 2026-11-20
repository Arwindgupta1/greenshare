import Link from "next/link";
import LibraryEditForm from "./LibraryEditForm";
import LibraryDeleteButton from "./LibraryDeleteButton";
import styles from "./LibraryList.module.css";

export default function LibraryList({ libraries }) {
	return (
		<section className={styles.register}>
			<div className={styles.heading}>
				<div>
					<span className={styles.eyebrow}>LOCATION REGISTER / 02</span>
					<h2>Library locations</h2>
				</div>

				<span className={styles.count}>
					{libraries.length} {libraries.length === 1 ? "location" : "locations"}
				</span>
			</div>

			{libraries.length === 0 ? (
				<p className={styles.empty}>
					No locations yet. Use the form above to add the first library.
				</p>
			) : (
				<div className={styles.list}>
					{libraries.map(function (library) {
						const hasCoordinates =
							typeof library.latitude === "number" &&
							typeof library.longitude === "number";

						return (
							<div className={styles.entry} key={library.id}>
								<div className={styles.entrySummary}>
									<div className={styles.details}>
										<h3>{library.name}</h3>

										<p>
											{[library.address, library.city, library.postcode]
												.filter(Boolean)
												.join(", ") || "Address not available"}
										</p>
									</div>

									<div className={styles.position}>
										<span>MAP POSITION</span>

										<p>
											{hasCoordinates
												? `${library.latitude.toFixed(4)}, ${library.longitude.toFixed(4)}`
												: "Not set"}
										</p>
									</div>
								</div>

								{/* I added a direct link to each library's equipment so the admin can view its inventory separately. */}
								<Link
									href={`/libraries/${library.id}`}
									className={styles.viewLink}
								>
									View equipment
								</Link>

								{/* I kept the existing management actions so the admin can still edit or delete a location. */}
								<div className={styles.actions}>
									<LibraryEditForm library={library} />
									<LibraryDeleteButton library={library} />
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
