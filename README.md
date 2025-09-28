# connect

# Connect - Social Media Platform (Front-End)

Welcome to Connect, a front-end social media application prototype built entirely with HTML, CSS, and vanilla JavaScript. This project simulates the core functionalities of a modern social platform, using the browser's `localStorage` to act as a mock database for a persistent user experience.

## ✨ Features

- **User Authentication**: Secure registration and login system.
- **Dynamic Home Feed**: A central feed that displays posts from all users, sorted by the most recent.
- **Post Creation**: Users can create posts with text and optional images through an intuitive modal.
- **Interactive Posts**: Like and comment on posts, with real-time UI updates.
- **Notifications**: Receive in-app notifications for likes and comments on your posts.
- **User Profiles**: View your own profile or other users' profiles (`fanProfile.html`).
- **Profile Editing**: Update your username, bio, and profile picture.
- **Saved Posts**: Bookmark posts to view later on a dedicated "Saved" page.
- **Dynamic Search**: A powerful search bar in the navigation to find users and posts by keywords.

## 📂 File Structure

The project is organized into logical folders for styles, scripts, and HTML pages.

```
socialMedia/
├── css/
│   ├── home.css         # Styles for the main home/feed page
│   ├── profile.css      # Styles for user profile pages
│   └── style.css        # Styles for the login/register pages
│
├── js/
│   ├── auth.js          # Handles user login and registration
│   ├── database.js      # Manages the localStorage database
│   ├── fanProfile.js    # Logic for viewing other users' profiles
│   ├── main.js          # Core script for the home page (feed, modals, etc.)
│   ├── profile.js       # Logic for the user's own profile page
│   └── saved.js         # Logic for the saved posts page
│
├── fanProfile.html      # Page to display another user's profile
├── home.html            # The main application page after login
├── index.html           # The initial landing page for login/registration
├── messages.html        # Placeholder for messages
├── profile.html         # The current user's profile page
├── saved.html           # Page to display saved posts
├── settings.html        # Placeholder for settings
└── README.md            # You are here!
```

## 🚀 Getting Started

This project is a static web application and does not require a build process or a server.

1.  Clone or download the repository.
2.  Open the `index.html` file in your web browser (like Chrome, Firefox, or Edge).

That's it! You can start using the application.

### 🧪 Testing Credentials

The application uses `localStorage`, so the database will be empty the first time you open it. To test the features, you should register a few different users.

Here are some example credentials you can use to register new accounts:

**User 1:**
- **Username**: `alex_doe`
- **Email**: `alex@example.com`
- **Password**: `password123`
- **Bio**: `Exploring the world, one photo at a time.`

**User 2:**
- **Username**: `jane_smith`
- **Email**: `jane@example.com`
- **Password**: `password123`
- **Bio**: `Just a bookworm sharing my thoughts.`

After registering both users, you can log in as one, post something, and then log in as the other to test liking, commenting, and following.

## 🛠️ Technology Stack

- **HTML5**: For the structure and content of the web pages.
- **CSS3**: For all styling, layout (Grid/Flexbox), and animations.
- **JavaScript (ES6+)**: For all dynamic functionality, DOM manipulation, and interaction logic.
- **localStorage**: Used as a simple, browser-based database to persist user and post data.


Your code will now be live in a public GitHub repository! live link is .

