import Link from "next/link";
import { redirect } from "next/navigation";
import { getSignedInAccount } from "@/lib/authentication/serverAccount";
import { getWorkerReservations } from "@/lib/borrowing/reservationRecords";
import { getServerDb } from "@/lib/firebase/server";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "My borrowing - GreenShare",
};

const borrowingDates = {
	"2027-02-01": "1 February 2027",
	"2027-02-02": "2 February 2027",
	"2027-02-03": "3 February 2027",
};

export default async function MyBorrowingPage() {
	const account = await getSignedInAccount();

	if (!account) {
		redirect("/login");
	}

	if (account.role !== "worker") {
		redirect("/");
	}

	const reservations = await getWorkerReservations(account.uid);
	const db = getServerDb();

	// The booking stores IDs, so I look up the names for the history.
	const borrowingHistory = await Promise.all(
		reservations.map(async function (reservation) {
			let equipmentName = "Equipment no longer listed";
			let libraryName = "Library no longer listed";

			if (reservation.equipmentId && !reservation.equipmentId.includes("/")) {
				const equipment = await db
					.collection("equipment")
					.doc(reservation.equipmentId)
					.get();

				if (equipment.exists) {
					equipmentName = equipment.data().name;
				}
			}

			if (reservation.libraryId && !reservation.libraryId.includes("/")) {
				const library = await db
					.collection("libraries")
					.doc(reservation.libraryId)
					.get();

				if (library.exists) {
					libraryName = library.data().name;
				}
			}

			return {
				...reservation,
				equipmentName,
				libraryName,
			};
		}),
	);

	return (
		<main className={styles.page}>
			<div className={styles.intro}>
				<span className={styles.eyebrow}>GREENSHARE / WORKER ACCOUNT</span>

				<h1>My borrowing</h1>

				<p>
					View the equipment you have reserved and check your borrowing details.
				</p>
			</div>

			<section className={styles.history}>
				<div className={styles.heading}>
					<h2>Reservation history</h2>

					<span>
						{borrowingHistory.length}{" "}
						{borrowingHistory.length === 1 ? "reservation" : "reservations"}
					</span>
				</div>

				{borrowingHistory.length === 0 ? (
					<div className={styles.empty}>
						<p>You have not made any reservations yet.</p>

						<Link href="/equipment">Find equipment</Link>
					</div>
				) : (
					<div className={styles.list}>
						{borrowingHistory.map(function (reservation) {
							return (
								<article className={styles.entry} key={reservation.id}>
									<div className={styles.details}>
										<span className={styles.category}>
											{reservation.status}
										</span>

										<h3>{reservation.equipmentName}</h3>

										<p>{reservation.libraryName}</p>

										<p>
											Borrowing date:{" "}
											{borrowingDates[reservation.date] || reservation.date}
										</p>

										<p>Quantity: {reservation.quantity}</p>

										<Link
											href={`/my-borrowing/${reservation.id}`}
											className={styles.detailsLink}
										>
											View details
										</Link>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</section>
		</main>
	);
}
