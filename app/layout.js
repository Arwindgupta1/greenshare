import SiteHeader from "@/components/shell/SiteHeader";
import { SessionProvider } from "@/context/SessionProvider";
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
				{/* I placed the SessionProvider here because different pages need
    			to know if someone is logged in and what account they are using. */}
				<SessionProvider>
					<SiteHeader />
					{children}
				</SessionProvider>
			</body>
		</html>
	);
}
