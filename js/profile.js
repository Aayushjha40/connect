// ...existing code...

document.addEventListener('DOMContentLoaded', function () {
    // Profile page logic: render profile details and posts; support create/edit/delete
    const profileContainer = document.querySelector('.profile-container');
    if (!profileContainer) return; // not on profile page

    const postGrid = document.querySelector('.post-grid');
    const userListContainer = document.querySelector('.user-list-container');
    
    // Helpers
    function safeReadDB() {
        try { return readDB(); } catch (e) { console.error('readDB missing', e); return null; }
    }
    function writeAndRefresh(db) {
        writeDB(db);
        renderProfile();
        renderProfilePosts();
    }
    function getUsername(userId) {
        const db = safeReadDB();
        if (!db) return 'Unknown';
        const u = db.users.find(x => x.id === userId);
        return u ? u.username : 'Unknown';
    }
    function formatTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleString();
    }

    // Render profile header/details
    function renderProfile() {
        const db = safeReadDB();
        if (!db) return;

        const user = db.users.find(u => u.id === db.currentUser);
        if (!user) {
            // not logged in
            const card = document.querySelector('.profile-card');
            if (card) card.innerHTML = '<p style="padding:1rem">Please log in to view profile.</p>';
            return;
        }

        const nameEl = document.querySelector('.user-name');
        const emailEl = document.querySelector('.user-email');
        const bioEl = document.querySelector('.user-bio');
        const picEl = document.querySelector('.profile-picture');
        const followersEl = document.querySelector('.stat-number.followers');
        const followingEl = document.querySelector('.stat-number.following');
        const postsEl = document.querySelector('.stat-number.posts');
        const actionArea = document.getElementById('profile-action-area');

        if (nameEl) nameEl.textContent = user.username || 'User';
        if (emailEl) emailEl.textContent = user.email || '';
        if (bioEl) bioEl.textContent = user.bio || '';
        if (picEl) picEl.src = user.profilePicture || `https://i.pravatar.cc/150?u=${user.id}`;
        if (followersEl) followersEl.textContent = (user.followers || []).length;
        if (followingEl) followingEl.textContent = (user.following || []).length;
        if (postsEl) postsEl.textContent = db.posts.filter(p => p.authorId === db.currentUser).length;

        // On the main profile page, always show the edit button
        const editBtn = document.getElementById('edit-profile-btn');
        if (actionArea && editBtn) editBtn.style.display = 'inline-block'; // This is the correct check
    }

    // Render posts authored by current user
    function renderProfilePosts() {
        const db = safeReadDB();
        if (!db) return;
        const currentUser = db.currentUser;
        if (!postGrid) return;

        const userPosts = db.posts.filter(p => p.authorId === currentUser).sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp));
        if (userPosts.length === 0) {
            postGrid.innerHTML = '<p style="color:#666">No posts yet. Create one using Upload Post.</p>';
            return;
        }

        postGrid.innerHTML = '';
        userPosts.forEach(post => {
            const item = document.createElement('article');
            item.className = 'post-item';
            item.setAttribute('data-post-id', post.id);

            const imgHtml = post.image ? `<img src="${post.image}" alt="post image">` : '';
            const textHtml = post.content ? `<div class="post-item-text-content">${escapeHtml(post.content)}</div>` : '';

            item.innerHTML = `
                ${imgHtml}
                ${textHtml}
                <div class="post-item-overlay">
                    <p>${escapeHtml(post.content || '')}</p>
                    <div class="post-actions-buttons">
                        <button class="edit-post-btn" aria-label="Edit post"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-post-btn" aria-label="Delete post"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                    <small style="margin-top:10px;opacity:.8;">${formatTime(post.timestamp)}</small>
                </div>
            `;
            postGrid.appendChild(item);
        });
    }

    // Edit / Delete handlers using event delegation
    postGrid && postGrid.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.edit-post-btn');
        const deleteBtn = e.target.closest('.delete-post-btn');
        if (editBtn) {
            const postEl = editBtn.closest('.post-item');
            if (!postEl) return;
            const postId = postEl.getAttribute('data-post-id');
            handleEditPost(postId);
        } else if (deleteBtn) {
            const postEl = deleteBtn.closest('.post-item');
            if (!postEl) return;
            const postId = postEl.getAttribute('data-post-id');
            handleDeletePost(postId);
        }
    });

    function handleEditPost(postId) {
        const db = safeReadDB();
        if (!db) return;
        const post = db.posts.find(p => p.id === postId);
        if (!post) { alert('Post not found'); return; }

        const newText = prompt('Edit post content:', post.content || '');
        if (newText === null) return; // cancelled
        if (newText.trim().length === 0) { alert('Content cannot be empty'); return; }
        if (newText.length > 280) { alert('Max 280 characters'); return; }

        post.content = newText.trim();
        post.editedAt = new Date().toISOString();
        writeAndRefresh(db);
    }

    function handleDeletePost(postId) {
        if (!confirm('Delete this post? This cannot be undone.')) return;
        const db = safeReadDB();
        if (!db) return;
        const idx = db.posts.findIndex(p => p.id === postId);
        if (idx === -1) { alert('Post not found'); return; }
        db.posts.splice(idx, 1);
        writeAndRefresh(db);
    }

    // --- Upload Post Modal Logic ---
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const uploadForm = document.getElementById('upload-form');

    if (uploadBtn && uploadModal) {
        uploadBtn.addEventListener('click', () => {
            uploadModal.classList.add('active');
        });

        uploadModal.querySelector('.close-btn').addEventListener('click', () => {
            uploadModal.classList.remove('active');
        });

        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                uploadModal.classList.remove('active');
            }
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const postContentInput = document.getElementById('post-content');
            const postImageInput = document.getElementById('post-image');
            const content = postContentInput.value.trim();
            const file = postImageInput.files[0];

            if (!content && !file) {
                alert('A post must have either text or an image.');
                return;
            }

            const db = safeReadDB();
            if (!db || !db.currentUser) {
                alert('You must be logged in to post.');
                return;
            }

            const newPost = {
                id: 'post_' + Date.now(),
                authorId: db.currentUser,
                content: content,
                image: null, // Will be set by file reader if present
                timestamp: new Date().toISOString(),
                likes: [],
                comments: []
            };

            // Handle file upload
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    newPost.image = event.target.result; // Set the image to the base64 string
                    db.posts.unshift(newPost);
                    writeAndRefresh(db);
                    uploadForm.reset();
                    uploadModal.classList.remove('active');
                };
                reader.onerror = function() {
                    alert('Failed to read file.');
                };
                reader.readAsDataURL(file);
            } else {
                // If no file, save post directly
                db.posts.unshift(newPost);
                writeAndRefresh(db);
                uploadForm.reset();
                uploadModal.classList.remove('active');
            }
        });
    }

    // --- Tab and Stat Click Handling ---
    const tabs = document.querySelectorAll('.tab');
    const stats = document.querySelectorAll('.stat');

    function handleTabClick(tabType) {
        // Update active class for tabs
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabType));

        // Show/hide content sections
        if (tabType === 'posts') {
            postGrid.style.display = 'grid';
            userListContainer.style.display = 'none';
            renderProfilePosts();
        } else if (tabType === 'followers' || tabType === 'following') {
            postGrid.style.display = 'none';
            userListContainer.style.display = 'block';
            renderUserList(tabType);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            handleTabClick(tab.dataset.tab);
        });
    });

    stats.forEach(stat => {
        stat.addEventListener('click', () => {
            handleTabClick(stat.dataset.tab);
        });
    });

    function renderUserList(type) {
        const db = safeReadDB();
        if (!db) return;
        const currentUser = db.users.find(u => u.id === db.currentUser);
        if (!currentUser) return;

        let userIdsToShow = [];
        if (type === 'followers') {
            userIdsToShow = currentUser.followers || [];
        } else if (type === 'following') {
            userIdsToShow = currentUser.following || [];
        }

        userListContainer.innerHTML = ''; // Clear previous list

        if (userIdsToShow.length === 0) {
            userListContainer.innerHTML = `<p style="color:#666; text-align:center;">No users to show.</p>`;
            return;
        }

        const usersToShow = userIdsToShow.map(id => db.users.find(u => u.id === id)).filter(Boolean);

        usersToShow.forEach(user => {
            const item = document.createElement('div');
            item.className = 'user-list-item';
            item.innerHTML = `
                <img src="${user.profilePicture || `https://i.pravatar.cc/50?u=${user.id}`}" alt="${user.username}'s profile picture">
                <div class="user-list-info">
                    <a href="#" class="username">${escapeHtml(user.username)}</a>
                    <p class="bio">${escapeHtml(user.bio.substring(0, 50))}${user.bio.length > 50 ? '...' : ''}</p>
                </div>
                <button class="follow-btn" data-user-id="${user.id}">Follow</button>
            `;
            userListContainer.appendChild(item);
        });

        // TODO: Add logic for follow/unfollow buttons within this list
    }

    // --- Bio Editing Logic ---
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editModal = document.getElementById('edit-profile-modal');
    const editForm = document.getElementById('edit-profile-form');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    }

    function openEditProfileModal() {
        const db = safeReadDB();
        if (!db) return;
        const user = db.users.find(u => u.id === db.currentUser);
        if (!user) return;

        // Populate form with current user data
        document.getElementById('edit-username').value = user.username || '';
        document.getElementById('edit-bio').value = user.bio || '';
        document.getElementById('edit-profile-pic-preview').src = user.profilePicture || `https://i.pravatar.cc/100?u=${user.id}`;

        // Show the modal
        if (editModal) editModal.classList.add('active');
    }

    function closeEditProfileModal() {
        if (editModal) editModal.classList.remove('active');
    }

    // Handle modal close buttons
    if (editModal) {
        editModal.querySelector('.close-btn').addEventListener('click', closeEditProfileModal);
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditProfileModal();
            }
        });
    }

    // Handle profile picture preview in modal
    const editPicInput = document.getElementById('edit-profile-pic-input');
    const editPicPreview = document.getElementById('edit-profile-pic-preview');
    if (editPicInput && editPicPreview) {
        editPicInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editPicPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle form submission
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const newUsername = document.getElementById('edit-username').value.trim();
            const newBio = document.getElementById('edit-bio').value.trim();
            const newPicFile = editPicInput.files[0];

            const db = safeReadDB();
            const user = db.users.find(u => u.id === db.currentUser);
            if (!user) return;

            // Check if username is taken by another user
            const isUsernameTaken = db.users.some(u => u.username === newUsername && u.id !== db.currentUser);
            if (isUsernameTaken) {
                alert('Username is already taken. Please choose another one.');
                return;
            }

            user.username = newUsername;
            user.bio = newBio;

            if (newPicFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    user.profilePicture = e.target.result;
                    writeAndRefresh(db);
                    closeEditProfileModal();
                };
                reader.readAsDataURL(newPicFile);
            } else {
                writeAndRefresh(db);
                closeEditProfileModal();
            }
        });
    }


    // Utility: escape HTML for safety
    function escapeHtml(str = '') {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Utility: close modal if present
    function closeModalIfOpen(id) {
        const m = document.getElementById(id);
        if (m) m.style.display = 'none';
    }

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const db = safeReadDB();
            if (!db) return;
            db.currentUser = null; // Clear the current user
            writeDB(db);
            alert('You have been logged out.');
            window.location.href = 'index.html'; // Redirect to the login/register page
        });
    }

    // initial render
    renderProfile();
    renderProfilePosts();
});

