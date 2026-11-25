import { redirect } from "next/navigation";
import {
	getSignedInAccount,
	requireLibraryAdmin,
} from "@/lib/authentication/serverAccount";
import { getLibraryRecords } from "@/lib/libraries/libraryRecords";
import LibraryForm from "@/components/admin/LibraryForm";
import LibraryList from "@/components/admin/LibraryList";
import EquipmentForm from "@/components/admin/EquipmentForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Library desk | GreenShare",
};

export default async function AdminPage() {
	// I keep the permission checks on the server so only
	// library admins can access the management tools.
	const account = await getSignedInAccount();

	if (!account) {
		redirect("/login");
	}

	if (account.role !== "admin") {
		redirect("/");
	}

	await requireLibraryAdmin();

	const libraries = await getLibraryRecords();

	return (
		<main
			style={{
				maxWidth: "1180px",
				margin: "0 auto",
				padding: "70px 24px",
			}}
		>
			<p style={{ color: "#355b46", fontSize: "12px" }}>LIBRARY MANAGEMENT</p>

			<h1>Library desk</h1>

			{/* Access to reservations from every library location. */}
			<div style={{ margin: "28px 0" }}>
				<Link
					href="/admin/reservations"
					style={{
						display: "inline-block",
						padding: "12px 20px",
						backgroundColor: "#355b46",
						color: "#ffffff",
						textDecoration: "none",
						borderRadius: "4px",
						fontSize: "14px",
						fontWeight: "600",
					}}
				>
					View all reservations
				</Link>
			</div>

			<LibraryForm />

			<LibraryList libraries={libraries} />

			{/* Added equipment registration after library managemen because each item must belong to an existing location. */}
			<EquipmentForm libraries={libraries} />
		</main>
	);
}
