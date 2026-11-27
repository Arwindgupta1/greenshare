"use client";

/*
  This code keeps track of who is signed in to GreenShare.
  Firebase handles the login, while Firestore stores the user's
  name and role. I use context so other parts of the app can
  access these details without loading them separately.
*/

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/browser";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
	const [account, setAccount] = useState(null);
	const [checking, setChecking] = useState(true);

	useEffect(function () {
		// Listen for login changes including when the page is refreshed.
		const stopListening = onAuthStateChanged(auth, async function (user) {
			setChecking(true);
			setAccount(null);

			if (!user) {
				setChecking(false);
				return;
			}

			try {
				// I use the Firebase UID to find the matching profile in Firestore.
				const record = await getDoc(doc(db, "users", user.uid));

				if (record.exists()) {
					const details = record.data();

					setAccount({
						uid: user.uid,
						username: details.username,
						displayName: details.displayName,
						role: details.role === "admin" ? "admin" : "worker",
					});
				}
			} catch (error) {
				console.error("Could not load the user profile.", error);
			} finally {
				setChecking(false);
			}
		});

		// I remove the listener when the component is no longer used,
		// so it doesn't keep listening for login changes.
		return function () {
			stopListening();
		};
	}, []);

	return (
		<SessionContext.Provider value={{ account, checking }}>
			{children}
		</SessionContext.Provider>
	);
}

// Other components can use this to check the current account.
export function useSession() {
	return useContext(SessionContext);
}
