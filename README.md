# GreenShare

GreenShare is a web application I am building for my Contemporary Web Applications module at Solent University.

The idea is to create a small equipment library where workers can find and borrow tools or sustainability equipment from different locations.

Workers will be able to check what is available, make a reservation and manage their previous bookings. Library admins will have a separate area where they can manage locations, equipment and reservations.

## What I am using

I am building the application with:

- Next.js 16 and React
- JavaScript
- CSS Modules
- Firebase Authentication
- Cloud Firestore
- Leaflet for the map

I chose to keep the layout fairly simple and use separate components for different parts of the application. This should make the code easier to follow as I add more features.

## Running the application

First, install the required packages:

```bash
npm install
```

Create a `.env.local` file and add the Firebase settings. The `.env.example` file shows which values are needed.

Then start the application:

```bash
npm run dev
```

Open `http://localhost:3000` to view it.

## Firebase

I am using Firebase Authentication for signing in and Firestore to store the application data.

The browser and server have separate Firebase configuration files. I have also added a `firestore.rules` file to control which data users can access.

I plan to use four main collections:

- `users` for account details and roles
- `libraries` for the different locations
- `equipment` for the available items
- `reservations` for borrowing records

The assignment only allows reservations for 1, 2 and 3 February 2027, so these dates are defined separately in `lib/borrowing/borrowingRules.js`.

## Development

I am building GreenShare one part at a time and using GitHub to keep track of my changes.

So far, I have set up the Next.js project, created the main page layout and added the initial Firebase configuration and Firestore rules.

The next steps are to connect the database, add user accounts and start working on the equipment and borrowing features.

I will add the test account details and any final setup instructions once the application is ready.
