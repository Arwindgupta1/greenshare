import { redirect } from "next/navigation";
import {
	getSignedInAccount,
	requireLibraryAdmin,
} from "@/lib/authentication/serverAccount";

// I check access on the server because hiding the admin link
// in the header would not stop someone opening /admin directly.
export default async function AdminPage() {
	const account = await getSignedInAccount();

	if (!account) {
		redirect("/login");
	}

	if (account.role !== "admin") {
		redirect("/");
	}

	// I added a second check here so future admin features
	// will follow the same permission rule.
	await requireLibraryAdmin();

	return (
		<main
			style={{ maxWidth: "1180px", margin: "0 auto", padding: "70px 24px" }}
		>
			<p style={{ color: "#355b46", fontSize: "12px" }}>LIBRARY MANAGEMENT</p>

			<h1>Library desk</h1>

			<p>
				Welcome, {account.username}. You can manage library locations, equipment
				and borrowing reservations here.
			</p>

			<p>The management tools will be added in the next stage.</p>
		</main>
	);
}
