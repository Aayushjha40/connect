document.addEventListener('DOMContentLoaded', function () {
    const profileContainer = document.querySelector('.profile-container');
    if (!profileContainer) return; // Exit if not on a profile-like page

    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get('userId');

    if (!profileUserId) {
        profileContainer.innerHTML = '<h1>User not found.</h1>';
        return;
    }

    function safeReadDB() {
        try { return readDB(); } catch (e) { console.error('readDB missing', e); return null; }
    }

    function renderFanProfile() {
        const db = safeReadDB();
        if (!db) return;

        const profileUser = db.users.find(u => u.id === profileUserId);
        const currentUser = db.users.find(u => u.id === db.currentUser);

        if (!profileUser) {
            profileContainer.innerHTML = '<h1>User not found.</h1>';
            return;
        }

        // Populate profile details
        document.querySelector('.user-name').textContent = profileUser.username;
        document.querySelector('.user-email').textContent = profileUser.email;
        document.querySelector('.user-bio').textContent = profileUser.bio || 'No bio yet.';
        document.querySelector('.profile-picture').src = profileUser.profilePicture || `https://i.pravatar.cc/150?u=${profileUser.id}`;
        document.querySelector('.stat-number.posts').textContent = db.posts.filter(p => p.authorId === profileUser.id).length;
        document.querySelector('.stat-number.followers').textContent = (profileUser.followers || []).length;
        document.querySelector('.stat-number.following').textContent = (profileUser.following || []).length;

        // Setup Follow/Unfollow Button
        const followBtn = document.getElementById('follow-btn');
        if (currentUser && currentUser.id !== profileUser.id) {
            followBtn.style.display = 'inline-block';
            const isFollowing = currentUser.following.includes(profileUserId);

            if (isFollowing) {
                followBtn.textContent = 'Unfollow';
                followBtn.className = 'btn-follow unfollow';
            } else {
                followBtn.textContent = 'Follow';
                followBtn.className = 'btn-follow follow';
            }

            // Use cloneNode to remove old event listeners
            const newFollowBtn = followBtn.cloneNode(true);
            followBtn.parentNode.replaceChild(newFollowBtn, followBtn);
            newFollowBtn.addEventListener('click', handleFollow);

        } else {
            followBtn.style.display = 'none';
        }
    }

    function handleFollow() {
        const db = safeReadDB();
        const currentUser = db.users.find(u => u.id === db.currentUser);
        const targetUser = db.users.find(u => u.id === profileUserId);

        if (!currentUser || !targetUser) {
            alert('You must be logged in to follow users.');
            return;
        }

        const isFollowing = currentUser.following.includes(profileUserId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id !== profileUserId);
            targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
        } else {
            // Follow
            currentUser.following.push(profileUserId);
            targetUser.followers.push(currentUser.id);
        }

        writeDB(db);
        renderFanProfile(); // Re-render to update button text and follower counts
    }

    function renderPosts() {
        const db = safeReadDB();
        const postGrid = document.querySelector('.post-grid');
        if (!postGrid) return;

        const userPosts = db.posts.filter(p => p.authorId === profileUserId)
                                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (userPosts.length === 0) {
            postGrid.innerHTML = '<p style="color:#666; text-align:center;">This user has no posts yet.</p>';
            return;
        }

        postGrid.innerHTML = '';
        userPosts.forEach(post => {
            const item = document.createElement('article');
            item.className = 'post-item';
            item.innerHTML = post.image ? `<img src="${post.image}" alt="post image">` : `<div class="post-item-text-content">${post.content}</div>`;
            postGrid.appendChild(item);
        });
    }

    // Initial Load
    renderFanProfile();
    renderPosts();
});