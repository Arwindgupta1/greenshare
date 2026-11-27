const accountDomain = "greenshare-arwind.firebaseapp.com";

// I wanted usernames to be simple and follow the same format.
// New accounts should only be created by the admin.
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
