import Link from "next/link";
import { getEquipmentCatalogue } from "@/lib/equipment/equipmentSearch";
import { getLibraryRecords } from "@/lib/libraries/libraryRecords";
import { getEquipmentAvailability } from "@/lib/borrowing/dailyAvailability";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Find equipment | GreenShare",
};

const borrowingDates = [
	{ value: "2027-02-01", label: "1 February 2027" },
	{ value: "2027-02-02", label: "2 February 2027" },
	{ value: "2027-02-03", label: "3 February 2027" },
];

export default async function EquipmentPage({ searchParams }) {
	const params = await searchParams;

	const selectedCategory =
		typeof params.category === "string" ? params.category : "";

	const selectedLibrary =
		typeof params.libraryId === "string" ? params.libraryId : "";

	const selectedDate = typeof params.date === "string" ? params.date : "";

	const libraries = await getLibraryRecords();
	const equipment = await getEquipmentCatalogue();

	// check filter values before using them so catalogue only accepts options provided by the application.
	const validCategories = ["Tool", "Sustainability Equipment"];

	const category = validCategories.includes(selectedCategory)
		? selectedCategory
		: "";

	const libraryExists = libraries.some(function (library) {
		return library.id === selectedLibrary;
	});

	const libraryId = libraryExists ? selectedLibrary : "";

	const validDate = borrowingDates.some(function (date) {
		return date.value === selectedDate;
	});

	const date = validDate ? selectedDate : "";

	// I want to filter  equipment on the server so the results can be opened directly using the search URL.
	const filteredEquipment = equipment.filter(function (item) {
		if (category && item.category !== category) {
			return false;
		}

		if (libraryId && item.libraryId !== libraryId) {
			return false;
		}

		return true;
	});

	// With a date selected, the results should reflect what can actually be borrowed that day.
	const equipmentWithAvailability = await Promise.all(
		filteredEquipment.map(async function (item) {
			if (!date) {
				return item;
			}

			const availability = await getEquipmentAvailability(item.id, date);

			return {
				...item,
				availableQuantity: availability?.availableQuantity ?? 0,
			};
		}),
	);

	const results = date
		? equipmentWithAvailability.filter(function (item) {
				return item.availableQuantity > 0;
			})
		: equipmentWithAvailability;

	function getLibraryName(itemLibraryId) {
		const library = libraries.find(function (item) {
			return item.id === itemLibraryId;
		});

		return library ? library.name : "Unknown library";
	}

	return (
		<main className={styles.page}>
			<div className={styles.intro}>
				<span className={styles.eyebrow}>GREENSHARE / EQUIPMENT CATALOGUE</span>

				<h1>Find equipment</h1>

				<p>
					Explore tools and sustainability equipment available through our
					community libraries.
				</p>
			</div>

			<section className={styles.searchSection}>
				<div className={styles.sectionHeading}>
					<h2>Search equipment</h2>
					<p>Choose a category, library location and borrowing date.</p>
				</div>

				{/* I use a GET form so users can share or revisit their search without losing the selected filters. */}
				<form action="/equipment" method="GET" className={styles.filters}>
					<div className={styles.field}>
						<label htmlFor="category">Equipment type</label>

						<select id="category" name="category" defaultValue={category}>
							<option value="">All categories</option>
							<option value="Tool">Tool</option>
							<option value="Sustainability Equipment">
								Sustainability Equipment
							</option>
						</select>
					</div>

					<div className={styles.field}>
						<label htmlFor="libraryId">Library location</label>

						<select id="libraryId" name="libraryId" defaultValue={libraryId}>
							<option value="">All libraries</option>

							{libraries.map(function (library) {
								return (
									<option key={library.id} value={library.id}>
										{library.name}
									</option>
								);
							})}
						</select>
					</div>

					<div className={styles.field}>
						<label htmlFor="date">Borrowing date</label>

						<select id="date" name="date" defaultValue={date}>
							<option value="">Select date</option>

							{borrowingDates.map(function (day) {
								return (
									<option key={day.value} value={day.value}>
										{day.label}
									</option>
								);
							})}
						</select>
					</div>

					<div className={styles.filterActions}>
						<button type="submit" className={styles.searchButton}>
							Search equipment
						</button>

						<Link href="/equipment" className={styles.clearLink}>
							Clear filters
						</Link>
					</div>
				</form>

				<p className={styles.dateNotice}>
					{date
						? "Only equipment available on the selected date is shown."
						: "Select a borrowing date to check available quantities."}
				</p>
			</section>

			<section className={styles.resultsSection}>
				<div className={styles.resultsHeading}>
					<div>
						<span className={styles.eyebrow}>EQUIPMENT RESULTS</span>

						<h2>Equipment catalogue</h2>
					</div>

					<span className={styles.count}>
						{results.length} {results.length === 1 ? "item" : "items"}
					</span>
				</div>

				{results.length === 0 ? (
					<div className={styles.empty}>
						<h3>No equipment found</h3>
						<p>Try another category, library location or borrowing date.</p>
					</div>
				) : (
					<div className={styles.list}>
						{results.map(function (item) {
							return (
								<article key={item.id} className={styles.item}>
									<div className={styles.itemDetails}>
										<span className={styles.category}>{item.category}</span>

										<h3>{item.name}</h3>

										<p className={styles.location}>
											{getLibraryName(item.libraryId)}
										</p>

										{item.description && (
											<p className={styles.description}>{item.description}</p>
										)}

										<Link
											href={`/libraries/${item.libraryId}`}
											className={styles.viewLink}
										>
											View library
										</Link>
									</div>

									<div className={styles.stock}>
										<span>{date ? "AVAILABLE STOCK" : "TOTAL STOCK"}</span>

										<strong>
											{date ? item.availableQuantity : item.totalQuantity}
										</strong>

										<p>{date ? "units available" : "units owned"}</p>
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
