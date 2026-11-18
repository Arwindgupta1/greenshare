import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
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
