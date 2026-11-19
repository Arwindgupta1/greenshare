"use server";
/*
I decided to use a Server Action to save new library locations in Firestore.
Before saving anything, I check that the signed-in user is a library
admin. I also check the form details on the server rather than relying
only on the browser.
Each library has its own Firestore document, with an automatically
generated ID. I included the address and coordinates because I will
need them later when adding the Leaflet map.
I am using useActionState in the form, so this action takes the
previous state and the submitted form data. This lets me return
a simple message if something goes wrong without creating a
separate API endpoint.
*/

import { revalidatePath } from "next/cache";
import { getServerDb } from "@/lib/firebase/server";
import { requireLibraryAdmin } from "@/lib/authentication/serverAccount";

// I check details here because the browser cannot be trusted
// to send valid information every time.
export async function addLibrary(previousState, formData) {
	// Only a library admin can add a new location.
	await requireLibraryAdmin();

	const name = String(formData.get("name") || "").trim();
	const address = String(formData.get("address") || "").trim();
	const city = String(formData.get("city") || "").trim();
	const postcode = String(formData.get("postcode") || "").trim();

	const latText = String(formData.get("latitude") || "").trim();
	const lngText = String(formData.get("longitude") || "").trim();

	if (!name || !address || !city || !postcode) {
		return {
			success: false,
			message: "Please fill in all the location details.",
		};
	}

	if (
		name.length > 100 ||
		address.length > 150 ||
		city.length > 80 ||
		postcode.length > 20
	) {
		return {
			success: false,
			message: "Some of the location details are too long.",
		};
	}

	// I included coordinates now because the locations will
	// also appear on the Leaflet map later.
	if (!latText || !lngText) {
		return {
			success: false,
			message: "Please enter both map coordinates.",
		};
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
		return {
			success: false,
			message: "Please enter valid map coordinates.",
		};
	}

	try {
		// I save each location as a separate document in Firestore.
		await getServerDb().collection("libraries").add({
			name,
			address,
			city,
			postcode,
			latitude,
			longitude,
		});

		// I added this so the home page can show newly added locations.
		revalidatePath("/");
		revalidatePath("/admin");

		return {
			success: true,
			message: "Library location added :).",
		};
	} catch (error) {
		console.error("Could not add library.", error);

		return {
			success: false,
			message: "Could not save location. Please try again.",
		};
	}
}
