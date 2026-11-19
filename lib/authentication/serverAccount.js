import "server-only";

import { cookies } from "next/headers";
import { getServerAuth, getServerDb } from "@/lib/firebase/server";

// I check the session on the server rather than trusting
// the role stored in the browser.
export async function getSignedInAccount() {
	const cookieStore = await cookies();
	const session = cookieStore.get("greenshare_session");

	if (!session) {
		return null;
	}

	try {
		const user = await getServerAuth().verifySessionCookie(session.value, true);

		// The user's role comes from their Firestore profile.
		const record = await getServerDb().collection("users").doc(user.uid).get();

		if (!record.exists) {
			return null;
		}

		const details = record.data();

		if (details.role !== "worker" && details.role !== "admin") {
			return null;
		}

		return {
			uid: user.uid,
			username: details.username,
			role: details.role,
		};
	} catch {
		return null;
	}
}

// I added this check for actions that only library admins can use.
export async function requireLibraryAdmin() {
	const account = await getSignedInAccount();

	if (!account || account.role !== "admin") {
		throw new Error("You do not have permission to do this.");
	}

	return account;
}
