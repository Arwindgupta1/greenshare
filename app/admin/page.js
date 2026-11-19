import { redirect } from "next/navigation";
import {
	getSignedInAccount,
	requireLibraryAdmin,
} from "@/lib/authentication/serverAccount";
import { getLibraryRecords } from "@/lib/libraries/libraryRecords";
import LibraryForm from "@/components/admin/LibraryForm";
import LibraryList from "@/components/admin/LibraryList";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Library desk | GreenShare",
};

export default async function AdminPage() {
	// I kept the access checks on the server because hiding
	// the admin link alone would not protect this page.
	const account = await getSignedInAccount();

	if (!account) {
		redirect("/login");
	}

	if (account.role !== "admin") {
		redirect("/");
	}

	await requireLibraryAdmin();

	// I now load the saved locations here and pass them to the list.
	// This keeps the Firestore code out of the display component.
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

			{/* I added the list below the form so new locations can
          be checked without opening Firebase Console. */}
			<LibraryForm />
			<LibraryList libraries={libraries} />
		</main>
	);
}
