const accountDomain = "greenshare-arwind.firebaseapp.com";

// Usernames stay simple so every account follows the same format
// important is that accounts can be created only by admins!
export function getAccountEmail(username) {
	const name = username.trim().toLowerCase();

	if (!/^[a-z0-9_]{3,24}$/.test(name)) {
		return null;
	}

	// firebase needs an email, but members only use their username.
	return `${name}@${accountDomain}`;
}
