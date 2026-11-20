import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerDb } from "@/lib/firebase/server";
import { getSignedInAccount } from "@/lib/authentication/serverAccount";
import { getLibraryRecords } from "@/lib/libraries/libraryRecords";
import { getLibraryEquipment } from "@/lib/equipment/equipmentRecords";
import EquipmentEditForm from "@/components/admin/EquipmentEditForm";
import styles from "./page.module.css";
import EquipmentDeleteButton from "@/components/admin/EquipmentDeleteButton";

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

	// Only admins need the full list of libraries for editing
	const libraries = isAdmin ? await getLibraryRecords() : [];

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
						{equipment.map(function (item) {
							return (
								<article className={styles.item} key={item.id}>
									<div className={styles.itemDetails}>
										<span className={styles.category}>{item.category}</span>

										<h3>{item.name}</h3>

										{item.description && <p>{item.description}</p>}

										{/* Now I keep here  equipment management controls available only to admins and both actions also check permissions on the server. */}
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
