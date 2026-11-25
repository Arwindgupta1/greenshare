import Link from "next/link";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";
import { getAllReservations } from "@/lib/borrowing/adminReservations";
import ReservationEditForm from "@/components/borrowing/ReservationEditForm";
import styles from "./page.module.css";
import ReservationDeleteButton from "@/components/borrowing/ReservationDeleteButton";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "All reservations | GreenShare",
};

const borrowingDates = {
	"2027-02-01": "1 February 2027",
	"2027-02-02": "2 February 2027",
	"2027-02-03": "3 February 2027",
};

export default async function AdminReservationsPage() {
	await requireLibraryAdmin();

	const reservations = await getAllReservations();

	return (
		<main className={styles.page}>
			<Link href="/admin" className={styles.backLink}>
				Back to admin dashboard
			</Link>

			<div className={styles.intro}>
				<span className={styles.eyebrow}>GREENSHARE / ADMINISTRATION</span>

				<h1>All reservations</h1>

				<p>Borrowing reservations across all library locations.</p>
			</div>

			<section className={styles.section}>
				<div className={styles.heading}>
					<h2>Reservation register</h2>

					<span>
						{reservations.length}{" "}
						{reservations.length === 1 ? "reservation" : "reservations"}
					</span>
				</div>

				{reservations.length === 0 ? (
					<p className={styles.empty}>
						No borrowing reservations have been made yet.
					</p>
				) : (
					<div className={styles.list}>
						{reservations.map(function (reservation) {
							return (
								<article className={styles.item} key={reservation.id}>
									<div className={styles.details}>
										<span className={styles.status}>{reservation.status}</span>

										<h3>{reservation.equipmentName}</h3>

										<p>{reservation.libraryName}</p>

										<p>
											Borrowing date:{" "}
											{borrowingDates[reservation.date] || reservation.date}
										</p>

										<p>Quantity: {reservation.quantity}</p>

										<p className={styles.worker}>
											Worker ID: {reservation.workerId}
										</p>

										{/* Admins can adjust bookings from this list without opening a separate page. */}
										{reservation.status === "confirmed" && (
											<>
												<ReservationEditForm
													reservationId={reservation.id}
													date={reservation.date}
													quantity={reservation.quantity}
												/>

												<ReservationDeleteButton
													reservationId={reservation.id}
												/>
											</>
										)}
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
