const accountDomain = "greenshare-arwind.firebaseapp.com";

// Usernames stay simple so every account follows the same format
// important is that accounts can be created only by admins!
export function getAccountEmail(username) {
	const name = username.trim().toLowerCase();

	if (!/^[a-z0-9_]{3,24}$/.test(name)) {
		return null;
	}

	// firebase uses email for sign-in so I used the username to create an internal email address.
	// as per my assumption only admin will have option to add new users
	return `${name}@${accountDomain}`;
}
