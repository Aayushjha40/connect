// js/auth.js

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const profilePicInput = document.getElementById('profile-pic-input');
    const profilePicPreview = document.getElementById('profile-pic-preview');
    const profilePicLabel = document.getElementById('profile-pic-label');

    // --- Profile Picture Preview ---
    if (profilePicInput && profilePicPreview) {
        profilePicInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePicPreview.src = e.target.result;
                    profilePicPreview.style.display = 'block'; // Show preview
                    if (profilePicLabel) profilePicLabel.querySelector('i').style.display = 'none'; // Hide icon
                };
                reader.readAsDataURL(file);
            } else {
                profilePicPreview.src = "https://i.pravatar.cc/100?u=default";
                profilePicPreview.style.display = 'none';
                profilePicLabel.querySelector('i').style.display = 'block';
            }
        });
    }

    // --- Registration Logic ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form values
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            const bio = document.getElementById('reg-bio').value;
            const profilePicFile = profilePicInput.files[0];

            // Basic validation
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            // Read the database
            const db = readDB();

            // Check if user already exists
            const userExists = db.users.some(user => user.username === username || user.email === email);
            if (userExists) {
                alert("Username or email already exists!");
                return;
            }

            const saveUser = (picData) => {
                const newUser = {
                    id: 'user_' + Date.now(),
                    username: username,
                    email: email,
                    password: password, // In a real app, ALWAYS hash passwords!
                    bio: bio,
                    profilePicture: picData,
                    followers: [],
                    following: [],
                    savedPosts: []
                };

                db.users.push(newUser);
                writeDB(db);

                alert('Registration successful! Please log in.');
                // Use location.reload() and hash to ensure the page state is correct
                window.location.hash = 'login-page';
                window.location.reload();
            };

            if (profilePicFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    saveUser(e.target.result); // Save user with the image data
                };
                reader.readAsDataURL(profilePicFile);
            } else {
                saveUser(null); // Save user without an image
            }
        });
    }

    // --- Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form values
            const emailOrUsername = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Read the database
            const db = readDB();

            // Find the user
            const user = db.users.find(u => 
                (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
            );

            if (user) {
                // User found, set as current user and redirect
                db.currentUser = user.id;
                writeDB(db);
                alert(`Welcome back, ${user.username}!`);
                window.location.href = 'home.html'; // Redirect to home page
            } else {
                // User not found or incorrect password
                alert('Invalid credentials. Please try again.');
            }
        });
    }

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const db = readDB();
            db.currentUser = null; // Clear the current user
            writeDB(db);
            alert('You have been logged out.');
            window.location.href = 'index.html'; // Redirect to the login/register page
        });
    }
});
