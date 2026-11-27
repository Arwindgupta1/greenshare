import { NextResponse } from "next/server";
import { getServerAuth, getServerDb } from "@/lib/firebase/server";

const cookieName = "greenshare_session";
const sessionLength = 5 * 24 * 60 * 60 * 1000;

// I use the same cookie settings when creating and removing a session.
const cookieSettings = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
	path: "/",
};

// I wanted to make sure that login requests are coming from
// GreenShare itself and not from another website trying to send them.
function isSameOrigin(request) {
	const origin = request.headers.get("origin");

	if (!origin) {
		return false;
	}

	try {
		const source = new URL(origin);
		const target = new URL(request.url);

		return source.origin === target.origin;
	} catch {
		return false;
	}
}

// Once Firebase confirms the login, I create a session on the server
// so the user can stay signed in while moving between pages.
export async function POST(request) {
	if (!isSameOrigin(request)) {
		return NextResponse.json(
			{ error: "Request not allowed." },
			{ status: 403 },
		);
	}

	try {
		const body = await request.json();
		const idToken = body.idToken;

		if (typeof idToken !== "string" || !idToken) {
			return NextResponse.json(
				{ error: "Missing sign-in token." },
				{ status: 400 },
			);
		}

		const serverAuth = getServerAuth();
		const user = await serverAuth.verifyIdToken(idToken, true);

		// I decided to allow only recent logins when creating a session this helps avoid using an old login
		// token to start a new session.
		const signedInAt = user.auth_time * 1000;
		const fiveMinutes = 5 * 60 * 1000;

		if (Date.now() - signedInAt > fiveMinutes) {
			return NextResponse.json(
				{ error: "Please sign in again." },
				{ status: 401 },
			);
		}

		// Firebase confirms who the user is, but I also need to check
		// their profile in Firestore to see if they are a worker or admin.
		const profile = await getServerDb().collection("users").doc(user.uid).get();

		if (!profile.exists || !["worker", "admin"].includes(profile.data().role)) {
			return NextResponse.json(
				{ error: "Account profile not found." },
				{ status: 403 },
			);
		}

		const session = await serverAuth.createSessionCookie(idToken, {
			expiresIn: sessionLength,
		});

		const response = NextResponse.json({ success: true });

		response.cookies.set(cookieName, session, {
			...cookieSettings,
			maxAge: sessionLength / 1000,
		});

		return response;
	} catch (error) {
		console.error("Could not create session.", error);

		return NextResponse.json(
			{ error: "Could not start your session." },
			{ status: 401 },
		);
	}
}

// When someone logs out, I also clear their session cookie so they cannot keep using the previous session.
export async function DELETE(request) {
	if (!isSameOrigin(request)) {
		return NextResponse.json(
			{ error: "Request not allowed." },
			{ status: 403 },
		);
	}

	const response = NextResponse.json({ success: true });

	response.cookies.set(cookieName, "", {
		...cookieSettings,
		maxAge: 0,
	});

	return response;
}
