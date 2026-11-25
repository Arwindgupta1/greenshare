# GreenShare Community Tool Library

GreenShare is a web application I developed for the Contemporary Web Applications module at Solent University. It is based on a community equipment library where workers can find and reserve tools or sustainability equipment from different locations.

I kept the application fairly simple and focused on the main requirements of the assignment. Workers can manage their own bookings, while library administrators have a separate area for managing libraries, equipment and reservations.

## What the application does

Workers can:

- Sign in with a username and password.
- Search for equipment by type, library location and borrowing date.
- Check how many units are available on a selected date.
- Make reservations for **1, 2 or 3 February 2027**.
- View their reservation history and booking details.
- Change the date or quantity of their own reservations, or delete them.

Library admins can:

- Add and edit library locations, including their map coordinates.
- Add, edit and delete individual equipment items.
- View reservations from all workers and edit or delete them.
- Delete an empty library. Libraries with linked equipment or reservations cannot currently be deleted.

The **Locations** page uses an interactive Leaflet map. Clicking a library marker shows its equipment, stock and availability for the three borrowing dates. The Borrow link takes users to that library's equipment page.

## Technologies

- Next.js 16 and React 19
- JavaScript and CSS Modules
- Firebase Authentication for signing in
- Cloud Firestore for application data
- Firebase Admin SDK for server-side operations
- Leaflet with OpenStreetMap tiles for the map

I used React components for the interface and Next.js Server Actions for saving changes. Firestore transactions help prevent bookings from going over the available stock and make sure quantities are restored when a reservation is deleted.

## Running GreenShare locally

You will need Node.js and npm. Some Firebase packages used by this project require **Node.js 24.12.0 or later**.

1. Extract the project ZIP and open the `greenshare` folder in a terminal.
2. Install the packages:

   ```bash
   npm ci
   ```

3. Create a file called `.env.local` in the project folder. Use `.env.example` to see which Firebase settings are required.
4. Add the Firebase web configuration and the server-side service account details for the test Firebase project. The private service account key must be supplied securely and should not be committed to a public repository.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open <http://localhost:3000> in a browser.

The Firebase project must already contain the test accounts, their corresponding `users` documents with `worker` or `admin` roles, and the library/equipment test data. The application does not create these automatically when it starts.

Other useful commands:

```bash
npm run lint
npm run build
npm run start
```

`npm run start` is used after a successful production build.

## Test accounts

Both accounts use a simple password for assignment testing only.

| Role          | Username   | Password |
| ------------- | ---------- | -------- |
| Library Admin | `admin`    | `123456` |
| Worker        | `worker01` | `123456` |

Go to `/login` and enter the username and password. These are demonstration accounts, not credentials intended for a real public system. If the administrator account in the supplied Firebase project is named differently, use the username provided with the submission.

A simple way to test the application is to sign in as a Worker, search for equipment, make a reservation and then change or delete it from **My borrowing**. After that, sign in as an Admin and check **All reservations** and the library management tools.

## Firebase data

The main Firestore collections are:

- `users` — account profiles and roles
- `libraries` — library names, addresses and coordinates
- `equipment` — items and total stock at each library
- `reservations` — the worker, equipment, date and reserved quantity
- `equipmentAvailability` — reserved quantities for each item and borrowing date

The application has separate Firebase configuration files for browser and server code. Access checks are also made on the server, so hiding a button in the interface is not the only permission check. The `firestore.rules` file contains the client access rules used in the project.

## A few limitations

I focused on the features needed for the coursework rather than adding extra administration tools. For example, the admin reservation list shows the Worker's Firebase UID instead of a readable username. I left this improvement out because of the limited development time.

Deleting a whole library together with all its equipment is not implemented. An admin can remove individual equipment or delete an empty library instead. The map also links to the library page rather than opening a booking form directly for a particular item.

## Project files and GitHub

The project uses the Next.js App Router. The main pages and Server Actions are in `app/`, reusable UI components are in `components/`, and Firebase and data-reading functions are in `lib/`.

I used Git throughout development and made separate commits as working features were added. The repository history shows how the application developed in stages.

GitHub repository: <https://github.com/Arwindgupta1/greenshare>
