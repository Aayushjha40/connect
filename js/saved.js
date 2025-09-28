document.addEventListener('DOMContentLoaded', function () {
    const savedPostsContainer = document.getElementById('saved-posts-container');
    if (!savedPostsContainer) return;

    function renderSavedPosts() {
        const db = readDB();
        const currentUser = db.users.find(u => u.id === db.currentUser);

        if (!currentUser || !currentUser.savedPosts || currentUser.savedPosts.length === 0) {
            savedPostsContainer.innerHTML = '<p>You have not saved any posts yet.</p>';
            return;
        }

        savedPostsContainer.innerHTML = ''; // Clear loading message

        // Iterate backwards to show most recently saved first
        for (let i = currentUser.savedPosts.length - 1; i >= 0; i--) {
            const postId = currentUser.savedPosts[i];
            const post = db.posts.find(p => p.id === postId);
            if (!post) continue; // Skip if post was deleted

            const author = db.users.find(u => u.id === post.authorId);
            if (!author) continue; // Skip if author was deleted

            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.setAttribute('data-post-id', post.id);

            postCard.innerHTML = `
                <div class="post-header">
                    <a href="profile.html?userId=${author.id}" class="profile-link">
                        <img src="${author.profilePicture || `https://i.pravatar.cc/40?u=${author.id}`}" class="avatar-sm">
                        <div>
                            <span class="post-user">${author.username}</span>
                            <span class="time">· ${new Date(post.timestamp).toLocaleString()}</span>
                        </div>
                    </a>
                    <button class="more-btn"><i class="fas fa-ellipsis-h"></i></button>
                    <div class="post-options-dropdown">
                        <button class="unsave-post-btn" data-post-id="${post.id}"><i class="fas fa-trash"></i> Unsave</button>
                    </div>
                </div>
                <p class="post-text">${post.content}</p>
                ${post.image ? `<img src="${post.image}" class="post-image" alt="post">` : ''}
                <div class="post-actions">
                    <button class="action-btn like"><i class="fas fa-heart"></i> <span class="like-count">${post.likes.length}</span></button>
                    <button class="action-btn comment"><i class="fas fa-comment"></i> <span>${post.comments.length}</span></button>
                    <button class="action-btn share"><i class="fas fa-share-square"></i></button>
                </div>
            `;
            savedPostsContainer.appendChild(postCard);
        }
    }

    // Initial render
    renderSavedPosts();
});