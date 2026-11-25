"use client";

import { useEffect, useRef } from "react";
import styles from "./LibraryMap.module.css";

export default function LibraryMap() {
	const mapElement = useRef(null);

	useEffect(function () {
		let map;
		let cancelled = false;

		async function loadMap() {
			const L = await import("leaflet");

			if (cancelled || !mapElement.current) {
				return;
			}

			// Start the map around the City of London.
			map = L.map(mapElement.current).setView([51.5155, -0.0922], 12);

			L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19,
			}).addTo(map);
		}

		loadMap();

		return function () {
			cancelled = true;

			if (map) {
				map.remove();
			}
		};
	}, []);

	return (
		<section className={styles.section}>
			<h2>Find a library on the map</h2>

			<p>
				Explore community tool libraries and their locations on dedicated map.
			</p>

			<div
				ref={mapElement}
				className={styles.map}
				aria-label="Interactive map of GreenShare library locations"
				role="region"
			/>
		</section>
	);
}
