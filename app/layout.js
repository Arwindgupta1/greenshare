import SiteHeader from "@/components/shell/SiteHeader";
import { SessionProvider } from "@/context/SessionProvider"; // Now we share sessio with whole app
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
	title: "GreenShare | Community Tool Library",
	description: "Find and borrow equipment from local community libraries.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en-GB">
			<body>
				{/* Keeping the same user session available on every page. */}
				<SessionProvider>
					<SiteHeader />
					{children}
				</SessionProvider>
			</body>
		</html>
	);
}

// Layout stays server component but SessionProvider is client component but only covers part of the app.
