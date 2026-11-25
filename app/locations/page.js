import Link from "next/link";
import LibraryMap from "@/components/locations/LibraryMap";
import { getLibraryRecords } from "@/lib/libraries/libraryRecords";
import { getLibraryEquipment } from "@/lib/equipment/equipmentRecords";
import { getEquipmentAvailability } from "@/lib/borrowing/dailyAvailability";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Library locations | GreenShare",
};

export default async function LocationsPage() {
	const libraries = await getLibraryRecords();

	const borrowingDates = ["2027-02-01", "2027-02-02", "2027-02-03"];

	// Collect the equipment and daily stock for each map location.
	const mapLocations = await Promise.all(
		libraries.map(async function (library) {
			const equipment = await getLibraryEquipment(library.id);

			const mapEquipment = await Promise.all(
				equipment.map(async function (item) {
					const availability = await Promise.all(
						borrowingDates.map(function (date) {
							return getEquipmentAvailability(item.id, date);
						}),
					);

					return {
						id: item.id,
						name: item.name,
						category: item.category,
						totalQuantity: item.totalQuantity,
						availableDates: availability.map(function (record, index) {
							return {
								date: borrowingDates[index],
								quantity: record.availableQuantity,
							};
						}),
					};
				}),
			);

			return {
				id: library.id,
				name: library.name || "Unnamed library",
				address: library.address || "",
				city: library.city || "",
				postcode: library.postcode || "",
				latitude: library.latitude ?? null,
				longitude: library.longitude ?? null,
				equipment: mapEquipment,
			};
		}),
	);

	return (
		<main
			style={{
				maxWidth: "1180px",
				margin: "0 auto",
				padding: "50px 24px 80px",
			}}
		>
			<p style={{ color: "#355b46", fontSize: "12px" }}>
				GREENSHARE / LOCATIONS
			</p>

			<h1>Library locations</h1>

			<p>
				Explore community equipment libraries and find the equipment you need.
			</p>

			<LibraryMap libraries={mapLocations} />

			<section style={{ marginTop: "50px" }}>
				<h2>Available library locations</h2>

				{libraries.length === 0 ? (
					<p>No library locations have been added yet.</p>
				) : (
					<div>
						{libraries.map(function (library) {
							return (
								<div
									key={library.id}
									style={{
										padding: "20px 0",
										borderBottom: "1px solid #ddd",
									}}
								>
									<h3>{library.name}</h3>

									<p>{library.city || "Location not specified"}</p>

									<Link href={`/libraries/${library.id}`}>View equipment</Link>
								</div>
							);
						})}
					</div>
				)}
			</section>
		</main>
	);
}
