import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerDb } from "@/lib/firebase/server";
import { getSignedInAccount } from "@/lib/authentication/serverAccount";
import { getLibraryRecords } from "@/lib/libraries/libraryRecords";
import { getLibraryEquipment } from "@/lib/equipment/equipmentRecords";
import EquipmentEditForm from "@/components/admin/EquipmentEditForm";
import styles from "./page.module.css";
import EquipmentDeleteButton from "@/components/admin/EquipmentDeleteButton";
import BorrowForm from "@/components/borrowing/BorrowForm";
import { getEquipmentAvailability } from "@/lib/borrowing/dailyAvailability";

export const dynamic = "force-dynamic";

export default async function LibraryPage({ params }) {
	const { libraryId } = await params;

	if (!libraryId || libraryId.includes("/")) {
		notFound();
	}

	// I load the selected library and its equipment separately so this page only shows items assigned to this location.
	const libraryDocument = await getServerDb()
		.collection("libraries")
		.doc(libraryId)
		.get();

	if (!libraryDocument.exists) {
		notFound();
	}

	const library = libraryDocument.data();
	const equipment = await getLibraryEquipment(libraryId);

	// checking signed-in account on the server befor showing any equipment management controls.
	const account = await getSignedInAccount();
	const isAdmin = account?.role === "admin";
	const isWorker = account?.role === "worker";

	// Only admins need the full list of libraries for editing
	const libraries = isAdmin ? await getLibraryRecords() : [];

	const borrowingDates = ["2027-02-01", "2027-02-02", "2027-02-03"];

	// I load equipment availability for Workers so they can check the stock before making a reservation.
	const equipmentAvailability = isWorker
		? await Promise.all(
				equipment.map(async function (item) {
					const records = await Promise.all(
						borrowingDates.map(function (date) {
							return getEquipmentAvailability(item.id, date);
						}),
					);

					const availableByDate = {};

					records.forEach(function (record) {
						if (record) {
							availableByDate[record.date] = record.availableQuantity;
						}
					});

					return availableByDate;
				}),
			)
		: [];

	const address = [library.address, library.city, library.postcode]
		.filter(Boolean)
		.join(", ");

	return (
		<main className={styles.page}>
			<Link href="/" className={styles.backLink}>
				Back to locations
			</Link>

			<div className={styles.intro}>
				<span className={styles.eyebrow}>GREENSHARE / LIBRARY LOCATION</span>

				<h1>{library.name}</h1>
				<p>{address || "Address not available"}</p>
			</div>

			<section className={styles.inventory}>
				<div className={styles.sectionHeading}>
					<div>
						<span className={styles.eyebrow}>EQUIPMENT REGISTER</span>
						<h2>Equipment at this location</h2>
					</div>

					<span className={styles.count}>
						{equipment.length}{" "}
						{equipment.length === 1 ? "equipment type" : "equipment types"}
					</span>
				</div>

				{equipment.length === 0 ? (
					<p className={styles.empty}>
						No equipment is currently listed at this library.
					</p>
				) : (
					<div className={styles.list}>
						{equipment.map(function (item, index) {
							return (
								<article className={styles.item} key={item.id}>
									<div className={styles.itemDetails}>
										<span className={styles.category}>{item.category}</span>

										<h3>{item.name}</h3>

										{item.description && <p>{item.description}</p>}

										{/* Now I keep here equipment management controls available only to admins and both actions also check permissions on the server. */}
										{isAdmin && (
											<div className={styles.equipmentActions}>
												<EquipmentEditForm
													equipment={item}
													libraries={libraries}
													libraryId={libraryId}
												/>

												<EquipmentDeleteButton equipment={item} />
											</div>
										)}

										{/* dded borrowing form for Workers so they can reserve equipment for a selected date. */}
										{isWorker && (
											<BorrowForm
												equipment={item}
												availability={equipmentAvailability[index]}
											/>
										)}
									</div>

									<div className={styles.quantity}>
										<span>TOTAL STOCK</span>
										<strong>{item.totalQuantity}</strong>
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
