import { redirect } from "next/navigation";
import {
	getSignedInAccount,
	requireLibraryAdmin,
} from "@/lib/authentication/serverAccount";
import { getLibraryRecords } from "@/lib/libraries/libraryRecords";
import LibraryForm from "@/components/admin/LibraryForm";
import LibraryList from "@/components/admin/LibraryList";
import EquipmentForm from "@/components/admin/EquipmentForm";

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

			<p>
				Welcome, {account.username}. Manage library locations and equipment from
				here.
			</p>

			<LibraryForm />

			<LibraryList libraries={libraries} />

			{/* Added equipment registration after library managemen because each item must belong to an existing location. */}
			<EquipmentForm libraries={libraries} />
		</main>
	);
}
