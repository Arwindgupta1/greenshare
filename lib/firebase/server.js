import "server-only"; // it secure to import by mistake to client components

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// The server uses its own Firebase credentials.
// these must never be visable to the browser.
function getServerDb() {
	if (!getApps().length) {
		const projectId = process.env.FIREBASE_PROJECT_ID;
		const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
		const privateKey = process.env.FIREBASE_PRIVATE_KEY;

		if (!projectId || !clientEmail || !privateKey) {
			throw new Error("Firebase server settings are missing.");
		}

		initializeApp({
			credential: cert({
				projectId,
				clientEmail,
				privateKey: privateKey.replace(/\\n/g, "\n"),
			}),
		});
	}

	// Reuse the app rather than creating a new connection each time.
	return getFirestore();
}

export { getServerDb };
