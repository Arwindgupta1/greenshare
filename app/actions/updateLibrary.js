/*
  I added this action so the admin can change library details if something needs updating, such as the address or location on the map.I wanted to keep the same library document in Firestore because equipment and reservations are already connected to its ID.
  Before saving the changes, I check that the form has the required information and that the coordinates are valid for the Leaflet map.
 */
"use server";

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";

export async function updateLibrary(previousState, formData) {
	await requireLibraryAdmin();

	const libraryId = String(formData.get("libraryId") || "").trim();
	const name = String(formData.get("name") || "").trim();
	const address = String(formData.get("address") || "").trim();
	const city = String(formData.get("city") || "").trim();
	const postcode = String(formData.get("postcode") || "").trim();
	const latText = String(formData.get("latitude") || "").trim();
	const lngText = String(formData.get("longitude") || "").trim();

	if (!libraryId || libraryId.includes("/")) {
		return { success: false, message: "Invalid library." };
	}

	if (!name || !address || !city || !postcode || !latText || !lngText) {
		return { success: false, message: "Please complete all fields." };
	}

	if (
		name.length > 100 ||
		address.length > 150 ||
		city.length > 80 ||
		postcode.length > 20
	) {
		return { success: false, message: "Some details are too long." };
	}

	const latitude = Number(latText);
	const longitude = Number(lngText);

	if (
		!Number.isFinite(latitude) ||
		!Number.isFinite(longitude) ||
		latitude < -90 ||
		latitude > 90 ||
		longitude < -180 ||
		longitude > 180
	) {
		return { success: false, message: "Invalid map coordinates." };
	}

	try {
		const libraryRef = getServerDb().collection("libraries").doc(libraryId);
		const library = await libraryRef.get();
		// I first check if the library still exists before trying to update it.
		// I didn't use a transaction here because I'm only changing the library details,
		// not the equipment or reservations. If the library gets deleted before
		// the update, Firestore will return an error which is handled below.

		if (!library.exists) {
			return { success: false, message: "Library not found." };
		}

		// I update the existing document so its ID stays the same.
		await libraryRef.update({
			name,
			address,
			city,
			postcode,
			latitude,
			longitude,
		});

		revalidatePath("/admin");
		revalidatePath("/");
		revalidatePath("/locations");
		revalidatePath("/equipment");

		return { success: true, message: "Library updated successfully." };
	} catch (error) {
		console.error("Could not update library.", error);
		return { success: false, message: "Could not update the library." };
	}
}
