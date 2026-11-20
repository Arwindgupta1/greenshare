import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSignedInAccount } from "@/lib/authentication/serverAccount";
import { getServerDb } from "@/lib/firebase/server";
import styles from "../page.module.css";
import ReservationDeleteButton from "@/components/borrowing/ReservationDeleteButton";
import ReservationEditForm from "@/components/borrowing/ReservationEditForm";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Reservation details | GreenShare",
};

const borrowingDates = {
	"2027-02-01": "1 February 2027",
	"2027-02-02": "2 February 2027",
	"2027-02-03": "3 February 2027",
};

export default async function ReservationDetailsPage({ params }) {
	const account = await getSignedInAccount();

	if (!account) {
		redirect("/login");
	}

	if (account.role !== "worker") {
		redirect("/");
	}

	const { reservationId } = await params;

	if (
		!reservationId ||
		reservationId.includes("/") ||
		reservationId.length > 1500
	) {
		notFound();
	}

	const db = getServerDb();

	const reservationDocument = await db
		.collection("reservations")
		.doc(reservationId)
		.get();

	if (!reservationDocument.exists) {
		notFound();
	}

	const reservation = reservationDocument.data();

	// I check who made the booking before showing its details.
	// A Worker should not be able to open another person's reservation.
	if (reservation.workerId !== account.uid) {
		notFound();
	}

	let equipmentName = "Equipment no longer listed";
	let libraryName = "Library no longer listed";

	if (reservation.equipmentId && !reservation.equipmentId.includes("/")) {
		const equipmentDocument = await db
			.collection("equipment")
			.doc(reservation.equipmentId)
			.get();

		if (equipmentDocument.exists) {
			equipmentName = equipmentDocument.data().name;
		}
	}

	if (reservation.libraryId && !reservation.libraryId.includes("/")) {
		const libraryDocument = await db
			.collection("libraries")
			.doc(reservation.libraryId)
			.get();

		if (libraryDocument.exists) {
			libraryName = libraryDocument.data().name;
		}
	}

	const createdAt = reservation.createdAt
		? reservation.createdAt.toDate().toLocaleString("en-GB", {
				timeZone: "Europe/London",
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
		: "Not available";

	return (
		<main className={styles.page}>
			<Link href="/my-borrowing" className={styles.detailsLink}>
				Back to my borrowing
			</Link>

			<div className={styles.intro}>
				<span className={styles.eyebrow}>GREENSHARE / RESERVATION DETAILS</span>

				<h1>{equipmentName}</h1>

				<p>Details of your equipment borrowing reservation.</p>
			</div>

			<section className={styles.history}>
				<div className={styles.heading}>
					<h2>Booking information</h2>
				</div>

				{/* The reservation keeps its own IDs and date,
                    while the names come from the linked records. */}
				<div className={styles.list}>
					<div className={styles.entry}>
						<div className={styles.details}>
							<p>Reservation reference</p>
							<h3>{reservationId}</h3>
						</div>
					</div>

					<div className={styles.entry}>
						<div className={styles.details}>
							<p>Equipment</p>
							<h3>{equipmentName}</h3>
						</div>
					</div>

					<div className={styles.entry}>
						<div className={styles.details}>
							<p>Library location</p>
							<h3>{libraryName}</h3>
						</div>
					</div>

					<div className={styles.entry}>
						<div className={styles.details}>
							<p>Borrowing date</p>
							<h3>{borrowingDates[reservation.date] || reservation.date}</h3>
						</div>
					</div>

					<div className={styles.entry}>
						<div className={styles.details}>
							<p>Quantity</p>
							<h3>{reservation.quantity}</h3>
						</div>
					</div>

					<div className={styles.entry}>
						<div className={styles.details}>
							<p>Status</p>
							<h3>{reservation.status}</h3>
						</div>
					</div>

					<div className={styles.entry}>
						<div className={styles.details}>
							<p>Reservation created</p>
							<h3>{createdAt}</h3>
						</div>
					</div>
				</div>
				{/* The Worker can remove this booking from its details page and edit. */}
				{reservation.status === "confirmed" && (
					<>
						<ReservationEditForm
							reservationId={reservationId}
							date={reservation.date}
							quantity={reservation.quantity}
						/>

						<ReservationDeleteButton reservationId={reservationId} />
					</>
				)}
			</section>
		</main>
	);
}
