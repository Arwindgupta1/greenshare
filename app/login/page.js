import SignInForm from "@/components/authentication/SignInForm";

// The form manage user input so page itself can stay on the server.
export const metadata = {
	title: "Sign in to GreenShare App",
};

export default function LoginPage() {
	return (
		<main>
			<SignInForm />
		</main>
	);
}
