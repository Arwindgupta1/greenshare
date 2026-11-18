import SiteHeader from "@/components/shell/SiteHeader";
import "./globals.css";

export const metadata = {
	title: "GreenShare | Community Tool Library",
	description: "Find and borrow equipment from local community libraries.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en-GB">
			<body>
				<SiteHeader />
				{children}
			</body>
		</html>
	);
}
