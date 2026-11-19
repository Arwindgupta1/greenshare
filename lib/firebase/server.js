import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// I moved the Firebase setup into one function so both
// Firestore and Authentication can use the same server app.
function getServerApp() {
	if (getApps().length) {
		return getApp();
	}

	const projectId = process.env.FIREBASE_PROJECT_ID;
	const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
	const privateKey = process.env.FIREBASE_PRIVATE_KEY;

	if (!projectId || !clientEmail || !privateKey) {
		throw new Error("Firebase server settings are missing.");
	}

	return initializeApp({
		credential: cert({
			projectId,
			clientEmail,
			privateKey: privateKey.replace(/\\n/g, "\n"),
		}),
	});
}

// This is still used to read and manage library data.
export function getServerDb() {
	return getFirestore(getServerApp());
}

// I added server-side Authentication so we can check
// who is making a request before changing any data.
export function getServerAuth() {
	return getAuth(getServerApp());
}
