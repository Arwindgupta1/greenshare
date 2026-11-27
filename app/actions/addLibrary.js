"use server";
/*
  I decided to use a Server Action to let admins add new library  locations directly to Firestore.
  Before saving the details I check if the user is actually an admin and if the information from the
  form makes sense. Each library gets its own document in Firestore. I also decided to save the address 
  and coordinates because these are needed to show the library on the Leaflet map.
  I used useActionState in the form because I wanted to show a simple
  success or error message without having to create another API route.
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

	// The coordinates are needed for the Leaflet map, so I check
	// that both values are provided before saving the library.
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

		// I refresh these pages so the new library can appear
		// in the location list and equipment search as well.
		revalidatePath("/");
		revalidatePath("/admin");
		revalidatePath("/locations");
		revalidatePath("/equipment");

		return {
			success: true,
			message: "Library location added successfully.",
		};
	} catch (error) {
		console.error("Could not add library.", error);

		return {
			success: false,
			message: "Could not save location. Please try again.",
		};
	}
}
