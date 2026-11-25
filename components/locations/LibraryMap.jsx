"use client";

import { useEffect, useRef } from "react";
import styles from "./LibraryMap.module.css";

export default function LibraryMap({ libraries }) {
	const mapElement = useRef(null);

	useEffect(
		function () {
			let map;
			let cancelled = false;

			async function loadMap() {
				const L = await import("leaflet");

				if (cancelled || !mapElement.current) {
					return;
				}

				// Keep the starting view around the City of London.
				map = L.map(mapElement.current).setView([51.5155, -0.0922], 12);

				L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
					maxZoom: 19,
				}).addTo(map);

				libraries.forEach(function (library) {
					if (library.latitude == null || library.longitude == null) {
						return;
					}

					const latitude = Number(library.latitude);
					const longitude = Number(library.longitude);

					if (
						!Number.isFinite(latitude) ||
						!Number.isFinite(longitude) ||
						latitude < -90 ||
						latitude > 90 ||
						longitude < -180 ||
						longitude > 180
					) {
						return;
					}

					const marker = L.circleMarker([latitude, longitude], {
						radius: 9,
						color: "#ffffff",
						weight: 2,
						fillColor: "#355b46",
						fillOpacity: 1,
					}).addTo(map);

					const popup = document.createElement("div");
					popup.style.minWidth = "220px";
					popup.style.maxHeight = "300px";
					popup.style.overflowY = "auto";

					const title = document.createElement("strong");
					title.textContent = library.name;

					const address = document.createElement("p");
					address.textContent = [
						library.address,
						library.city,
						library.postcode,
					]
						.filter(Boolean)
						.join(", ");

					popup.append(title, address);

					// Show the stock for each borrowing day, not just the total quantity.
					if (library.equipment.length === 0) {
						const empty = document.createElement("p");
						empty.textContent = "No equipment listed at this location.";
						popup.appendChild(empty);
					}

					library.equipment.forEach(function (item) {
						const equipmentBox = document.createElement("div");

						equipmentBox.style.padding = "12px 0";
						equipmentBox.style.borderTop = "1px solid #dddddd";

						const equipmentName = document.createElement("strong");
						equipmentName.textContent = item.name;

						const category = document.createElement("p");
						category.textContent = item.category;

						const total = document.createElement("p");
						total.textContent = `Total stock: ${item.totalQuantity}`;

						const dates = document.createElement("ul");
						dates.style.paddingLeft = "18px";

						item.availableDates.forEach(function (record) {
							const date = document.createElement("li");

							const readableDate = new Date(
								`${record.date}T12:00:00`,
							).toLocaleDateString("en-GB", {
								day: "numeric",
								month: "short",
								year: "numeric",
							});

							date.textContent = `${readableDate}: ${record.quantity} available`;

							dates.appendChild(date);
						});

						equipmentBox.append(equipmentName, category, total, dates);

						const hasStock = item.availableDates.some(function (record) {
							return record.quantity > 0;
						});

						if (hasStock) {
							const borrowLink = document.createElement("a");

							borrowLink.href = `/libraries/${encodeURIComponent(library.id)}`;

							borrowLink.textContent = `Borrow ${item.name}`;
							borrowLink.style.color = "#355b46";
							borrowLink.style.fontWeight = "600";

							equipmentBox.appendChild(borrowLink);
						}

						popup.appendChild(equipmentBox);
					});

					marker.bindPopup(popup, {
						maxWidth: 320,
						maxHeight: 340,
					});
				});
			}

			loadMap();

			return function () {
				cancelled = true;

				if (map) {
					map.remove();
				}
			};
		},
		[libraries],
	);

	return (
		<section className={styles.section}>
			<h2>Find a library on the map</h2>

			<p>Select a library marker to check its equipment and availability.</p>

			<div
				ref={mapElement}
				className={styles.map}
				aria-label="Interactive map of GreenShare library locations"
				role="region"
			/>
		</section>
	);
}
