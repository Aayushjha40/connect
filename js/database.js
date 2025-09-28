// js/database.js

// The key for our entire database in localStorage
const DB_KEY = 'socialAppDB';

/**
 * 🚀 Initializes the database in localStorage if it doesn't already exist.
 * This function should be called once when the application starts.
 */
function initializeDB() {
    // Check if the database key already exists in localStorage
    if (!localStorage.getItem(DB_KEY)) {
        // If not, create the initial database structure
        const initialDB = {
            users: [],
            posts: [],
            notifications: [], // To store notifications for users
            currentUser: null, // Stores the ID of the currently logged-in user
        };
        // Write this initial structure to localStorage
        writeDB(initialDB);
    }
}

/**
 * 📖 Reads the entire database from localStorage.
 * @returns {object} The database object (parsed from JSON).
 */
function readDB() {
    // Get the string version of the database from localStorage
    const dbString = localStorage.getItem(DB_KEY);
    // Parse the string into a JavaScript object and return it
    return JSON.parse(dbString);
}

/**
 * ✍️ Writes a given object to the database in localStorage.
 * @param {object} dbObject The object to write to the database.
 */
function writeDB(dbObject) {
    // Convert the JavaScript object into a JSON string
    const dbString = JSON.stringify(dbObject);
    // Save the string to localStorage under our key
    localStorage.setItem(DB_KEY, dbString);
}

// --- IMPORTANT ---
// Call the initialization function when the script loads to ensure the DB exists.
initializeDB();
