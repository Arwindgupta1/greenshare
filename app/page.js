import Link from "next/link";
import styles from "./page.module.css";
import { getLibraryRecords } from "@/lib/libraries/libraryRecords";

// library details should be read again when the page is opened
export const dynamic = "force-dynamic";

export default async function Home() {
	// Read the library list on the server before showing the page.
	const libraries = await getLibraryRecords();

	return (
		<main>
			<section className={styles.intro}>
				<div className={styles.introInner}>
					<div className={styles.copy}>
						<p className={styles.eyebrow}>COMMUNITY EQUIPMENT LIBRARY / 2027</p>

						<h1>
							Useful equipment.
							<br />
							Shared locally.
						</h1>

						<p className={styles.description}>
							Find tools and sustainability equipment at a nearby library. Check
							what is available and reserve what you need.
						</p>

						<div className={styles.actions}>
							<Link href="/equipment" className={styles.primary}>
								Browse equipment <span aria-hidden="true">↗</span>
							</Link>

							<Link href="/locations" className={styles.secondary}>
								Find a library
							</Link>
						</div>
					</div>

					<aside className={styles.info}>
						<span className={styles.infoLabel}>BORROWING WINDOW</span>

						<strong>01 — 03</strong>
						<span className={styles.month}>FEBRUARY 2027</span>

						<div className={styles.infoBottom}>
							<span>Three days</span>
							<span>Shared equipment</span>
							<span>Local libraries</span>
						</div>
					</aside>
				</div>
			</section>

			<section className={styles.librarySection}>
				<div className={styles.libraryHeading}>
					<div>
						<p className={styles.eyebrow}>OUR LOCATIONS</p>
						<h2>Library locations</h2>
					</div>

					<span>{libraries.length} listed</span>
				</div>

				{libraries.length === 0 ? (
					<p className={styles.emptyLibrary}>
						No library locations have been added yet.
					</p>
				) : (
					<div className={styles.libraryList}>
						{libraries.map(function (library) {
							return (
								<div className={styles.libraryItem} key={library.id}>
									<span className={styles.libraryName}>{library.name}</span>

									<span className={styles.libraryPlace}>
										{library.city || "Location not specified"}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</section>

			<section className={styles.bottom}>
				<div>
					<p className={styles.eyebrow}>HOW IT WORKS</p>
					<h2>Find it. Book it. Borrow it.</h2>
				</div>

				<p>
					Choose a library, select your equipment and check availability for
					your preferred date. Your borrowing details will be kept together in
					one place.
				</p>
			</section>
		</main>
	);
}
