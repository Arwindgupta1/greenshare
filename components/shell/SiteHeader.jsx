"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/browser";
import { useSession } from "@/context/SessionProvider";
import styles from "./SiteHeader.module.css";

// I kept these links public because everyone should be able
// to browse equipment and library locations.
const publicLinks = [
	{ href: "/equipment", label: "Equipment" },
	{ href: "/locations", label: "Locations" },
];

export default function SiteHeader() {
	const { account, checking } = useSession();
	const router = useRouter();

	// I changed sign-out to clear the server session as well.
	// This prevents someone from using the old session after leaving.
	async function handleSignOut() {
		try {
			const response = await fetch("/api/session", {
				method: "DELETE",
				credentials: "same-origin",
			});

			if (!response.ok) {
				throw new Error("Could not clear the server session.");
			}

			await signOut(auth);

			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Could not sign out.", error);
			window.alert("Could not sign out. Please try again.");
		}
	}

	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Link href="/" className={styles.brand}>
					<span className={styles.brandMark}>G/S</span>
					<span>GreenShare</span>
				</Link>

				<nav className={styles.nav} aria-label="Main navigation">
					{publicLinks.map(function (link) {
						return (
							<Link key={link.href} href={link.href}>
								{link.label}
							</Link>
						);
					})}

					{/* I kept borrowing separate because only workers need this link. */}
					{account?.role === "worker" && (
						<Link href="/borrowing">My borrowing</Link>
					)}

					{/* Library admins have their own area for managing equipment. */}
					{account?.role === "admin" && <Link href="/admin">Library desk</Link>}
				</nav>

				{/* I now show the member's display name rather than their login name. */}
				<div className={styles.accountArea}>
					{!checking &&
						(account ? (
							<>
								<span className={styles.accountName}>
									{account.displayName || account.username}
								</span>

								<button
									type="button"
									className={styles.signOut}
									onClick={handleSignOut}
								>
									Sign out
								</button>
							</>
						) : (
							<Link href="/login" className={styles.signIn}>
								Sign in
							</Link>
						))}
				</div>
			</div>
		</header>
	);
}
