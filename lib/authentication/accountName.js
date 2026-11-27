const accountDomain = "greenshare-arwind.firebaseapp.com";

// I wanted users to have simple usernames instead of typing
// their full email address when signing in.
export function getAccountEmail(username) {
	const name = username.trim().toLowerCase();

	if (!/^[a-z0-9_]{3,24}$/.test(name)) {
		return null;
	}

	/*Firebase uses email addresses for signing in, but I wanted
      workers to use a username instead. So I turn their username
      into an internal email address that Firebase can recognise.
	*/
	return `${name}@${accountDomain}`;
}
