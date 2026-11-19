"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/browser";
import { getAccountEmail } from "@/lib/authentication/accountName";
import styles from "./SignInForm.module.css";

export default function SignInForm() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const [signedIn, setSignedIn] = useState(false);

	async function handleSignIn(event) {
		event.preventDefault();

		setMessage("");
		setBusy(true);

		const email = getAccountEmail(username);

		if (!email) {
			setMessage("Enter a valid username.");
			setBusy(false);
			return;
		}

		try {
			// Firebase checks the password using the account's internal email.
			await signInWithEmailAndPassword(auth, email, password);

			setSignedIn(true);
			setPassword("");
			setMessage("You have signed in successfully.");
		} catch {
			// Do not reveal whether the username or password was wrong.
			setMessage("Could not sign in. Check your details and try again.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className={styles.signInArea}>
			<div className={styles.intro}>
				<p className={styles.eyebrow}>MEMBER ACCESS / GREENSHARE</p>

				<h1>Welcome back.</h1>

				<p>
					Sign in to manage your borrowing or look after the equipment in your
					library.
				</p>

				<div className={styles.sideNote}>
					<span>01 / 03 FEB 2027</span>
					<p>Borrow useful equipment from your local library.</p>
				</div>
			</div>

			<div className={styles.formArea}>
				<div className={styles.formHeading}>
					<span>ACCOUNT ACCESS</span>
					<h2>Sign in</h2>
					<p>Enter your account details below.</p>
				</div>

				{signedIn ? (
					<p className={styles.success} role="status">
						{message}
					</p>
				) : (
					<form onSubmit={handleSignIn}>
						<div className={styles.field}>
							<label htmlFor="username">Username</label>

							<input
								id="username"
								type="text"
								name="username"
								autoComplete="username"
								placeholder="Enter your username"
								value={username}
								onChange={function (event) {
									setUsername(event.target.value);
								}}
								maxLength={24}
								required
							/>
						</div>

						<div className={styles.field}>
							<label htmlFor="password">Password</label>

							<input
								id="password"
								type="password"
								name="password"
								autoComplete="current-password"
								placeholder="Your password"
								value={password}
								onChange={function (event) {
									setPassword(event.target.value);
								}}
								required
							/>
						</div>

						<button type="submit" disabled={busy}>
							{busy ? "Signing in..." : "Sign in"}
						</button>

						{message && (
							<p className={styles.error} role="alert">
								{message}
							</p>
						)}
					</form>
				)}
			</div>
		</section>
	);
}
