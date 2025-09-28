document.addEventListener('DOMContentLoaded', function() {
            const loginPage = document.getElementById('login-page');
            const registerPage = document.getElementById('register-page');
            if (loginPage && registerPage) {
                // Show login, hide register by default
                loginPage.style.display = 'block';
                registerPage.style.display = 'none';

                // Register link
                document.querySelector('.footer-text a[href="#register-page"]').addEventListener('click', function(e) {
                    e.preventDefault();
                    loginPage.style.display = 'none';
                    registerPage.style.display = 'block';
                });

                // Login link
                document.querySelector('.footer-text a[href="#login-page"]').addEventListener('click', function(e) {
                    e.preventDefault();
                    registerPage.style.display = 'none';
                    loginPage.style.display = 'block';
                });
            }
        });






document.addEventListener('DOMContentLoaded', () => {

            const mainContent = document.getElementById('main-content');
            const menuItems = document.querySelectorAll('.menu-item');
            const navIcons = document.querySelectorAll('.nav-icons .icon-link[data-page]');
            const logo = document.querySelector('.logo');

            // --- State ---
            let activePostId = null; // To track which post's comments are being viewed

            // --- Page Navigation Logic ---
            const pages = document.querySelectorAll('.page-section');

            function showPage(pageId) {
                // Hide all pages
                pages.forEach(page => page.classList.remove('active'));
                
                // Show the target page
                const targetPage = document.getElementById(`${pageId}-page`);
                if (targetPage) {
                    targetPage.classList.add('active');
                }

                // Update active state in sidebar
                menuItems.forEach(item => {
                    item.classList.toggle('active', item.dataset.page === pageId);
                });
            }
            
            // Sidebar navigation
            menuItems.forEach(item => {
                if (item.id !== 'upload-btn') {
                    item.addEventListener('click', () => showPage(item.dataset.page));
                }
            });

            // Navbar profile icon navigation
            navIcons.forEach(icon => {
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (icon.dataset.page === 'profile') {
                        window.location.href = 'profile.html';
                    }
                });
            });

            // Logo click navigates to home
            logo.addEventListener('click', () => showPage('home'));

            // --- Modal Handling ---
            const commentModal = document.getElementById('comment-modal');
            const uploadModal = document.getElementById('upload-modal');

            function openModal(modal) { if (modal) modal.classList.add('active'); }
            function closeModal(modal) { if (modal) modal.classList.remove('active'); }


            mainContent.addEventListener('click', (e) => {
                // More options button (three dots)
                const moreBtn = e.target.closest('.more-btn');
                // Hide all other dropdowns first
                document.querySelectorAll('.post-options-dropdown').forEach(d => {
                    if (!moreBtn || !d.previousElementSibling.isSameNode(moreBtn)) {
                        d.style.display = 'none';
                    }
                });

                if (moreBtn) {
                    const dropdown = moreBtn.nextElementSibling;
                    if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    }
                }

                // Save post button
                if (e.target.closest('.save-post-btn')) {
                    const postCard = e.target.closest('.post-card');
                    const postId = postCard.dataset.postId;
                    const db = readDB();
                    const user = db.users.find(u => u.id === db.currentUser);
                    if (!user) return;

                    user.savedPosts = user.savedPosts || [];
                    user.savedPosts.push(postId);
                    writeDB(db);
                    alert('Post saved!');
                }

                // Like button
                const likeBtn = e.target.closest('.action-btn.like');
                if (likeBtn) {
                    const postCard = likeBtn.closest('.post-card');
                    const postId = postCard.dataset.postId;
                    const db = readDB();
                    const post = db.posts.find(p => p.id === postId);
                    const currentUser = db.currentUser;

                    if (!post || !currentUser) return;

                    const likeCountSpan = likeBtn.querySelector('.like-count');
                    const userLikeIndex = post.likes.indexOf(currentUser);

                    if (userLikeIndex > -1) {
                        // User has already liked, so unlike
                        post.likes.splice(userLikeIndex, 1);
                        likeBtn.classList.remove('liked');
                    } else {
                        // User has not liked, so like
                        post.likes.push(currentUser);
                        likeBtn.classList.add('liked');

                        // Create a notification for the post author, but not for self-likes
                        if (post.authorId !== currentUser) {
                            if (!db.notifications) db.notifications = [];
                            db.notifications.unshift({
                                id: 'notif_' + Date.now(),
                                recipientId: post.authorId,
                                senderId: currentUser,
                                type: 'like',
                                postId: postId,
                                read: false,
                                timestamp: new Date().toISOString()
                            });
                            renderNotifications(); // Refresh notifications panel immediately
                        }
                    }
                    // Update DB and UI
                    writeDB(db);
                    likeCountSpan.textContent = post.likes.length;
                }

                // Comment button
                const commentBtn = e.target.closest('.action-btn.comment');
                if (commentBtn) {
                    const postCard = commentBtn.closest('.post-card');
                    activePostId = postCard.dataset.postId;
                    renderComments(activePostId);
                    openModal(commentModal);
                }

                // Share button
                const shareBtn = e.target.closest('.action-btn.share');
                if (shareBtn) {
                    const textToCopy = window.location.href;
                    const textArea = document.createElement('textarea');
                    textArea.style.position = 'fixed';
                    textArea.style.top = 0;
                    textArea.style.left = 0;
                    textArea.style.opacity = 0;
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        alert('Link copied to clipboard!');
                    } catch (err) {
                        console.error('Failed to copy text: ', err);
                        alert('Failed to copy link.');
                    }
                    document.body.removeChild(textArea);
                }
            });

            // --- Modal Setup ---
            // Comment Modal
            if (commentModal) {
                commentModal.addEventListener('click', (e) => {
                    if (e.target === commentModal || e.target.closest('.close-btn')) {
                        closeModal(commentModal);
                        activePostId = null; // Clear active post
                    }
                });
            }

            // Upload Modal
            const uploadBtn = document.getElementById('upload-btn');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => openModal(uploadModal));
            }
            if (uploadModal) {
                uploadModal.addEventListener('click', (e) => {
                    if (e.target === uploadModal || e.target.closest('.close-btn')) {
                        closeModal(uploadModal);
                    }
                });
            }

            // --- Comment Logic ---
            function renderComments(postId) {
                const commentList = document.getElementById('comment-list');
                const db = readDB();
                const post = db.posts.find(p => p.id === postId);

                commentList.innerHTML = ''; // Clear old comments

                if (!post || !post.comments || post.comments.length === 0) {
                    commentList.innerHTML = '<p style="text-align: center; color: #888;">No comments yet. Be the first!</p>';
                    return;
                }

                post.comments.forEach(comment => {
                    const author = db.users.find(u => u.id === comment.authorId);
                    const commentEl = document.createElement('div');
                    commentEl.className = 'comment';
                    commentEl.innerHTML = `
                        <img src="${author.profilePicture || `https://i.pravatar.cc/30?u=${author.id}`}" class="avatar-sm">
                        <div class="comment-body">
                            <span class="comment-user">${author.username}</span>
                            <p>${comment.text}</p>
                        </div>
                    `;
                    commentList.appendChild(commentEl);
                });
            }
            
            // --- Comment Form Submission ---
            const commentForm = document.getElementById('comment-form');
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!activePostId) return;

                const commentText = commentForm.querySelector('textarea').value;
                if (commentText.trim() === '') return;

                const db = readDB();
                const post = db.posts.find(p => p.id === activePostId);
                const currentUser = db.currentUser;

                if (!post || !currentUser) return;

                post.comments.push({
                    authorId: currentUser,
                    text: commentText,
                    timestamp: new Date().toISOString()
                });

                // --- Create a notification for the post author ---
                // Don't notify if you're commenting on your own post
                if (post.authorId !== currentUser) {
                    if (!db.notifications) db.notifications = []; // Ensure notifications array exists

                    db.notifications.unshift({ // Add to the beginning of the array
                        id: 'notif_' + Date.now(),
                        recipientId: post.authorId,
                        senderId: currentUser,
                        type: 'comment',
                        postId: activePostId,
                        read: false,
                        timestamp: new Date().toISOString()
                    });
                }

                writeDB(db);

                // --- Update UI ---
                renderComments(activePostId); // Re-render comments for the current post
                updatePostCardUI(activePostId); // Update the comment count on the feed
                renderNotifications(); // Refresh the notifications panel
                commentForm.reset();
            });

            // --- Upload Post Modal & Form Logic (for Home Page) ---
            const uploadForm = document.getElementById('upload-form');
            if (uploadForm && document.querySelector('#home-page')) { // Only apply this logic on the home page
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

                    const db = readDB();
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

                    const saveAndRefresh = (database) => {
                        writeDB(database);
                        renderFeed(); // Re-render the home feed
                        uploadForm.reset();
                        document.getElementById('upload-modal').classList.remove('active');
                    };

                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            newPost.image = event.target.result;
                            db.posts.unshift(newPost);
                            saveAndRefresh(db);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        db.posts.unshift(newPost);
                        saveAndRefresh(db);
                    }
                });
            }



            // --- Render Home Page Feed ---
            function renderFeed() {
                const feedContainer = document.querySelector('#home-page.feed');
                if (!feedContainer) return; // Only run on home page

                const db = readDB();
                if (!db || !db.posts || db.posts.length === 0) {
                    feedContainer.innerHTML = '<p>No posts to show. Follow users to see their posts here!</p>';
                    return;
                }

                // Sort posts by timestamp, newest first
                const sortedPosts = db.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                feedContainer.innerHTML = ''; // Clear static content

                sortedPosts.forEach(post => {
                    const author = db.users.find(u => u.id === post.authorId);
                    if (!author) return; // Skip posts from deleted users

                    const postCard = document.createElement('div');
                    postCard.className = 'post-card';
                    postCard.setAttribute('data-post-id', post.id);

                    // Check if the current user has liked this post to set the initial state
                    const currentUser = db.currentUser;
                    let likedClass = '';
                    if (currentUser && post.likes && post.likes.includes(currentUser)) {
                        likedClass = 'liked';
                    }


                    postCard.innerHTML = `
                        <div class="post-header">
                            <a href="fanProfile.html?userId=${author.id}" class="profile-link" data-user-id="${author.id}">
                                <img src="${author.profilePicture || `https://i.pravatar.cc/40?u=${author.id}`}" class="avatar-sm">
                                <div>
                                    <span class="post-user">${author.username}</span>
                                    <span class="time">· ${new Date(post.timestamp).toLocaleString()}</span>
                                </div>
                            </a>
                            <button class="more-btn"><i class="fas fa-ellipsis-h"></i></button>
                            <div class="post-options-dropdown">
                                <button class="save-post-btn"><i class="fas fa-bookmark"></i> Save Post</button>
                                <button><i class="fas fa-flag"></i> Report</button>
                            </div>
                        </div>
                        <p class="post-text">${post.content}</p>
                        ${post.image ? `<img src="${post.image}" class="post-image" alt="post">` : ''}
                        <div class="post-actions">
                            <button class="action-btn like ${likedClass}"><i class="fas fa-heart"></i> <span class="like-count">${post.likes.length}</span></button>
                            <button class="action-btn comment"><i class="fas fa-comment"></i> <span>${post.comments.length}</span></button>
                            <button class="action-btn share"><i class="fas fa-share-square"></i></button>
                        </div>
                    `;
                    feedContainer.appendChild(postCard);
                });
            }

            // --- Update a single post card's UI (e.g., comment count) ---
            function updatePostCardUI(postId) {
                const postCard = document.querySelector(`.post-card[data-post-id='${postId}']`);
                if (!postCard) return;

                const db = readDB();
                const post = db.posts.find(p => p.id === postId);
                if (!post) return;

                postCard.querySelector('.action-btn.comment span').textContent = post.comments.length;
            }

            // --- Update Saved Posts Page ---
            function updateSavedPostsPage() {
                const container = document.getElementById('saved-posts-container');
                container.innerHTML = '';
                
                if (savedPosts.size === 0) {
                    container.innerHTML = '<p>You haven\'t saved any posts yet.</p>';
                    return;
                }
                
                savedPosts.forEach(postId => {
                    const originalPost = document.querySelector(`.post-card[data-post-id='${postId}']`);
                    if (originalPost) {
                        const clonedPost = originalPost.cloneNode(true);
                        // Optional: remove save functionality from cloned post
                        clonedPost.querySelector('.post-options-dropdown').remove();
                        container.appendChild(clonedPost);
                    }
                });
            }

            // --- Notifications Panel ---
            const notificationsIcon = document.getElementById('notifications-icon');
            const notificationsPanel = document.getElementById('notifications-panel');

            function renderNotifications() {
                const db = readDB();
                if (!db.currentUser || !db.notifications) {
                    notificationsPanel.innerHTML = '<p style="padding: 10px; text-align: center;">No notifications.</p>';
                    return;
                }

                const userNotifications = db.notifications
                    .filter(n => n.recipientId === db.currentUser)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                if (userNotifications.length === 0) {
                    notificationsPanel.innerHTML = '<p style="padding: 10px; text-align: center;">No notifications.</p>';
                    return;
                }

                notificationsPanel.innerHTML = ''; // Clear existing
                userNotifications.forEach(notif => {
                    const sender = db.users.find(u => u.id === notif.senderId);
                    if (!sender) return;

                    let message = '';
                    if (notif.type === 'comment') {
                        message = `<strong>${sender.username}</strong> commented on your post.`;
                    } else if (notif.type === 'like') {
                        message = `<strong>${sender.username}</strong> liked your post.`;
                    } else {
                        return; // Skip unknown notification types
                    }

                    const notifItem = document.createElement('div');
                    notifItem.className = 'notification-item';
                    notifItem.innerHTML = `
                        <img src="${sender.profilePicture || `https://i.pravatar.cc/30?u=${sender.id}`}" class="avatar-sm">
                        <p>${message}</p>`;
                    notificationsPanel.appendChild(notifItem);
                });
            }

            notificationsIcon.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent click from bubbling to document
                notificationsPanel.style.display = notificationsPanel.style.display === 'block' ? 'none' : 'block';
            });
            
            // Hide panel when clicking anywhere else
            document.addEventListener('click', (e) => {
                if (!notificationsPanel.contains(e.target) && e.target !== notificationsIcon) {
                    notificationsPanel.style.display = 'none';
                }
            });

            // --- Search Logic ---
            const searchInput = document.getElementById('search-input');
            const searchResultsContainer = document.getElementById('search-results');

            if (searchInput && searchResultsContainer) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.trim().toLowerCase();
                    
                    if (query.length < 2) {
                        searchResultsContainer.innerHTML = '';
                        searchResultsContainer.style.display = 'none';
                        return;
                    }

                    const db = readDB();
                    let resultsHTML = '';

                    // Search for users
                    const userResults = db.users.filter(user => user.username.toLowerCase().includes(query));
                    userResults.forEach(user => {
                        resultsHTML += `
                            <a href="fanProfile.html?userId=${user.id}" class="search-result-item">
                                <img src="${user.profilePicture || `https://i.pravatar.cc/40?u=${user.id}`}" class="avatar-sm">
                                <div class="search-result-info">
                                    <strong>${user.username}</strong>
                                    <span>User</span>
                                </div>
                            </a>
                        `;
                    });

                    // Search for posts
                    const postResults = db.posts.filter(post => post.content.toLowerCase().includes(query));
                    postResults.forEach(post => {
                        const author = db.users.find(u => u.id === post.authorId);
                        resultsHTML += `
                            <a href="#post-${post.id}" class="search-result-item" data-post-id="${post.id}">
                                <img src="${author.profilePicture || `https://i.pravatar.cc/40?u=${author.id}`}" class="avatar-sm">
                                <div class="search-result-info">
                                    <strong>Post by ${author.username}</strong>
                                    <span>${post.content}</span>
                                </div>
                            </a>
                        `;
                    });

                    if (resultsHTML) {
                        searchResultsContainer.innerHTML = resultsHTML;
                        searchResultsContainer.style.display = 'block';
                    } else {
                        searchResultsContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: #888;">No results found.</p>';
                        searchResultsContainer.style.display = 'block';
                    }
                });

                // Hide search results when clicking outside
                document.addEventListener('click', (e) => {
                    if (!searchResultsContainer.contains(e.target) && e.target !== searchInput) {
                        searchResultsContainer.style.display = 'none';
                    }
                });

                // Handle clicking on a post result to scroll to it
                searchResultsContainer.addEventListener('click', (e) => {
                    const postLink = e.target.closest('a[data-post-id]');
                    if (postLink) {
                        document.querySelector(`.post-card[data-post-id='${postLink.dataset.postId}']`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }

            // Initial render for the home page
            renderFeed();
            renderNotifications();

        });
        document.addEventListener('DOMContentLoaded', function() {
        const menusItems = document.querySelectorAll('.menu-item[data-page]');
        const pageSections = document.querySelectorAll('.page-section');

        menusItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                // Remove active class from all menu items
                menusItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                // Hide all page sections
                pageSections.forEach(section => section.classList.remove('active'));
                // Show the selected page section
                const pageId = item.getAttribute('data-page');
                const targetSection = document.getElementById(pageId + '-page');
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    });
































    document.addEventListener('DOMContentLoaded', () => {

    // --- Follow/Unfollow Button Toggle ---
    const followBtn = document.getElementById('followBtn');
    const unfollowBtn = document.getElementById('unfollowBtn');

    if (followBtn && unfollowBtn) {
        followBtn.addEventListener('click', () => {
            followBtn.style.display = 'none';
            unfollowBtn.style.display = 'inline-block';
            // In a real app, you would send a request to the server here.
        });

        unfollowBtn.addEventListener('click', () => {
            unfollowBtn.style.display = 'none';
            followBtn.style.display = 'inline-block';
            // In a real app, you would send a request to the server here.
        });
    }


    // --- Profile Tab Switching ---
    const tabs = document.querySelectorAll('.tab');

    if (tabs.length) {
        tabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent page reload

                // Remove 'active' class from all tabs
                tabs.forEach(t => t.classList.remove('active'));

                // Add 'active' class to the clicked tab
                event.currentTarget.classList.add('active');

                // Here you would typically load content for the selected tab
                // For example: loadPosts(), loadFollowers(), etc.
                const tabType = event.currentTarget.dataset.tab;
                console.log(`Switched to ${tabType} tab.`);
            });
        });
    }

});
