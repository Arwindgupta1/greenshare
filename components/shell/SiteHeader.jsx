import Link from "next/link";
import styles from "./SiteHeader.module.css";

const links = [
	{ href: "/equipment", label: "Equipment" },
	{ href: "/locations", label: "Locations" },
	{ href: "/borrowing", label: "My borrowing" },
];

export default function SiteHeader() {
	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Link href="/" className={styles.brand}>
					<span className={styles.brandMark}>G/S</span>
					<span>GreenShare</span>
				</Link>

				<nav className={styles.nav} aria-label="Main navigation">
					{links.map((link) => (
						<Link key={link.href} href={link.href}>
							{link.label}
						</Link>
					))}
				</nav>

				<Link href="/login" className={styles.signIn}>
					Sign in
				</Link>
			</div>
		</header>
	);
}
