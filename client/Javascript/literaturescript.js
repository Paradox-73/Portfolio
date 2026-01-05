            lucide.createIcons();

    

            // --- DATA ---

            const FALLBACK_BOOKS = ["The Great Gatsby", "Dune", "Sapiens", "Atomic Habits", "Project Hail Mary", "Clean Code"];

            const BOOK_COLORS = ['#2a1b12', '#3e2723', '#4e342e', '#5d4037', '#1a237e', '#004d40', '#b71c1c'];

            

            let WORKS_CONTENT = {};

            window.readTitles = new Set();

            window.wishlistTitles = new Set();

            

            function normalizeTitle(t) { return t ? t.toLowerCase().split(':')[0].split('(')[0].trim() : ""; }

    

            // --- DATA Loading ---

            document.addEventListener('DOMContentLoaded', () => {

                loadLibrary();

                loadMyWorks();

                loadWishlist();

            });

    

            // --- UI ---

            document.getElementById('menu-btn').onclick = (e) => { e.stopPropagation(); document.getElementById('nav-dropdown').classList.toggle('show-menu'); };

            document.onclick = () => document.getElementById('nav-dropdown').classList.remove('show-menu');

    

            const searchWrapper = document.getElementById('search-wrapper');

            const searchResults = document.getElementById('search-results');

            const searchInput = document.getElementById('search-bar');

    

            document.getElementById('search-btn').onclick = (e) => { 

                e.stopPropagation(); 

                searchWrapper.classList.toggle('active'); 

                if(!searchWrapper.classList.contains('active')) searchResults.style.display='none'; 

                else searchInput.focus(); 

            };

    

            let debounce;

            searchInput.oninput = (e) => {

                clearTimeout(debounce);

                const q = e.target.value;

                if(q.length < 3) { searchResults.style.display='none'; return; }

                debounce = setTimeout(async () => {

                    searchResults.style.display='block';

                    searchResults.innerHTML = '<div class="p-2 text-gray-500 text-sm">Searching...</div>';

                    try {

                        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5`);

                        const data = await res.json();

                        searchResults.innerHTML = '';

                        if(data.items) {

                            data.items.forEach(item => {

                                const div = document.createElement('div');

                                div.className = 'search-item';

                                const thumb = item.volumeInfo.imageLinks?.smallThumbnail || item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/35x50?text=No+Img';

                                div.innerHTML = `<img src="${thumb}" class="w-8 h-12 object-cover rounded"><div class="text-xs text-gray-300 font-bold">${item.volumeInfo.title}</div>`;

                                const bookInfo = item.volumeInfo;

                                div.onclick = () => showRecommendPreview(bookInfo);

                                searchResults.appendChild(div);

                            });

                        } else searchResults.innerHTML = '<div class="p-2 text-gray-500 text-sm">No results.</div>';

                    } catch(e) { console.error(e); }

                }, 400);

            };

    

            // --- MODAL & LOGIC ---

            let activeInputResolver = null;

            function showInputModal({ title, label, inputType = 'text', submitText = 'Submit' }) {

                return new Promise((resolve) => {

                    activeInputResolver = resolve;

                    const modal = document.getElementById('input-modal');

                    document.getElementById('input-modal-title').textContent = title;

                    document.getElementById('input-modal-label').textContent = label;

                    const inputField = document.getElementById('input-modal-field');

                    inputField.type = inputType;

                    inputField.value = '';

                    document.getElementById('input-modal-submit').textContent = submitText;

                    modal.style.display = 'flex';

                    inputField.focus();

                });

            }

            document.getElementById('input-modal-submit').onclick = () => {

                const value = document.getElementById('input-modal-field').value;

                if (activeInputResolver) activeInputResolver(value);

                document.getElementById('input-modal').style.display = 'none';

                activeInputResolver = null;

            };

            document.getElementById('input-modal-cancel').onclick = () => {

                if (activeInputResolver) activeInputResolver(null);

                document.getElementById('input-modal').style.display = 'none';

                activeInputResolver = null;

            };

    

            let activeAlertResolver = null;

            function showAlert(title, message) {

                return new Promise((resolve) => {

                    activeAlertResolver = resolve;

                    const modal = document.getElementById('alert-modal');

                    document.getElementById('alert-modal-title').textContent = title;

                    document.getElementById('alert-modal-message').textContent = message;

                    modal.style.display = 'flex';

                });

            }

            document.getElementById('alert-modal-ok').onclick = () => {

                if (activeAlertResolver) activeAlertResolver();

                document.getElementById('alert-modal').style.display = 'none';

                activeAlertResolver = null;

            };

            

            function showRecommendPreview(info) {

                searchWrapper.classList.remove('active'); 

                searchResults.style.display='none';

                

                const modal = document.getElementById('details-modal');

                const footer = document.getElementById('modal-footer');

                populateModal(info);

                footer.innerHTML = '';

    

                const normTitle = normalizeTitle(info.title);

                

                if(window.readTitles.has(normTitle)) {

                    const msg = document.createElement('div');

                    msg.className = "w-full text-center text-[#d4af37] font-bold py-3 border border-[#d4af37]/30 rounded";

                    msg.textContent = "You have already read this book.";

                    footer.appendChild(msg);

                } else if (window.wishlistTitles.has(normTitle)) {

                    const msg = document.createElement('div');

                    msg.className = "w-full text-center text-gray-400 font-bold py-3 border border-gray-600 rounded";

                    msg.textContent = "Already in Wishlist.";

                    footer.appendChild(msg);

                } else {

                    const btn = document.createElement('button');

                    btn.className = "w-full bg-[#3e2723] hover:bg-[#5c4033] text-[#ffd700] py-3 rounded font-bold uppercase tracking-widest text-sm transition-colors border border-[#5c4033]";

                    btn.textContent = "Recommend This Book";

                    btn.onclick = () => processRecommendation(info);

                    footer.appendChild(btn);

                }

                modal.style.display = 'flex';

            }

    

            async function processRecommendation(info) {
    const name = await showInputModal({
        title: "Recommend Book",
        label: "Enter your name (optional)",
        submitText: "Submit"
    });

    if (name === null) return;
    const recommender = name.trim() === "" ? "Anonymous" : name;

    try {
        const response = await fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: info.title || "Unknown Title",
                authors: info.authors || ['Unknown'],
                description: info.description || '',
                imageLinks: info.imageLinks || {},
                recommendedBy: recommender,
                status: 'wishlist'
            })
        });

        if (response.status === 409) {
            const errorData = await response.json();
            await showAlert("Duplicate", errorData.message || "This book is already in the wishlist.");
            return; // Stop further execution
        }

        if (!response.ok) {
            throw new Error('Server responded with an error.');
        }

        await showAlert("Success", "Recommendation Sent! Thank you.");
        document.getElementById('details-modal').style.display = 'none';
        document.getElementById('search-bar').value = '';
        loadWishlist(); // Refresh wishlist
    } catch (e) {
        console.error(e);
        await showAlert("Error", "Failed to send recommendation.");
    }
}

    

            async function openDetailsModal(book, type, docId, recBy) {

                const modal = document.getElementById('details-modal');

                const footer = document.getElementById('modal-footer');

                populateModal(book);

                footer.innerHTML = '';

    

                if(recBy) document.getElementById('modal-desc').insertAdjacentHTML('afterbegin', `<p class="text-[#ffd700] text-xs italic mb-2">Rec by: ${recBy}</p>`);

    

                if(type === 'wishlist') {

                    const label = document.createElement('label');

                    label.className = "flex items-center space-x-3 cursor-pointer group p-2 hover:bg-[#2c1b12] rounded transition select-none";

                    label.innerHTML = `<input type="checkbox" class="accent-[#d4af37] w-5 h-5 cursor-pointer"><span class="text-sm font-bold text-gray-400">I HAVE READ THIS</span>`;

                    

                    const checkbox = label.querySelector('input');

                    

                    checkbox.onclick = async (e) => {

                        e.preventDefault(); 

                        const pwd = await showInputModal({

                            title: "Admin Access",

                            label: "Enter password to move book",

                            inputType: "password",

                            submitText: "Confirm"

                        });

    

                        if(pwd === "admin123") {

                            checkbox.checked = true;

                            try {

                                // 1. Add to read collection

                                const addResponse = await fetch('/api/books', {

                                    method: 'POST',

                                    headers: { 'Content-Type': 'application/json' },

                                    body: JSON.stringify({

                                        title: book.title,

                                        authors: book.authors.join(', '),

                                        description: book.description,

                                        thumbnail: book.imageLinks?.thumbnail

                                    })

                                });

                                if (!addResponse.ok) throw new Error('Failed to add book to read collection.');

    

                                // 2. Remove from wishlist

                                const deleteResponse = await fetch(`/api/wishlist/${docId}`, {

                                    method: 'DELETE'

                                });

                                if (!deleteResponse.ok) throw new Error('Failed to remove book from wishlist.');

    

                                await showAlert("Success", "Moved to Read Collection!");

                                document.getElementById('details-modal').style.display = 'none';

                                

                                // 3. Refresh both shelves

                                loadLibrary();

                                loadWishlist();

    

                            } catch(err) {

                                await showAlert("Update Failed", err.message);

                            }

                        } else if(pwd !== null) {

                            await showAlert("Error", "Incorrect Password.");

                            checkbox.checked = false;

                        }

                    };

                                        footer.appendChild(label);

                                    }

                                    modal.style.display = 'flex';

                                    document.body.style.overflow = 'hidden';

            }

    

            function populateModal(info) {

                document.getElementById('modal-title').textContent = info.title || "Untitled";

                document.getElementById('modal-author').textContent = info.authors?.join(', ')||'Unknown Author';

                document.getElementById('modal-desc').innerHTML = info.description || 'No description available.';

                document.getElementById('modal-cover').src = info.imageLinks?.thumbnail || `https://via.placeholder.com/150x220?text=${encodeURIComponent(info.title || 'Book')}`;

            }

    

            // --- LIBRARY LOGIC ---

            function loadMyWorks() {

                const shelf = document.getElementById('shelf-works');

                Array.from(shelf.children).forEach(c => { 

                    if(!c.classList.contains('shelf-plaque')) c.remove(); 

                });

                WORKS_CONTENT = {};

    

                function chunkTextByParagraph(text, maxChars) {

                    const pages = [];

                    const paragraphs = text.split('\n').map(p => `<p>${p.trim()}</p>`);

                    let currentPageHTML = '';

                    for (const p of paragraphs) {

                        if (p.length <= 7) continue;

                        if ((currentPageHTML.length + p.length) > maxChars && currentPageHTML.length > 0) {

                            pages.push(currentPageHTML);

                            currentPageHTML = '';

                        }

                        currentPageHTML += p;

                    }

                    if (currentPageHTML.length > 0) pages.push(currentPageHTML);

                    return pages;

                }

    

                fetch('/api/works')

                    .then(response => response.json())

                    .then(works => {

                        works.forEach(work => {

                            if (work.title && work.text) {

                                const key = normalizeTitle(work.title);

                                const CHARS_PER_PAGE = 750;

                                const htmlPages = chunkTextByParagraph(work.text, CHARS_PER_PAGE);

    

                                WORKS_CONTENT[key] = {

                                    title: work.title,

                                    pages: [`<h1>${work.title}</h1>`, ...htmlPages]

                                };

    

                                const el = createBookEl({ title: work.title, authors: ['My Work'], imageLinks: { thumbnail: null } }, shelf, 'work');

                                el.onclick = () => window.openMagazine(work.title, key);

                            }

                        });

                        console.log("Fetched and processed My Works from API.");

                    })

                    .catch(error => {

                        console.error("Error fetching My Works:", error);

                    });

            }

            

            async function loadLibrary() {

                // Clear existing books from the shelf first

                const shelf = document.getElementById('shelf-read');

                Array.from(shelf.children).forEach(c => { 

                    if(!c.classList.contains('shelf-plaque') && c.id !== 'loading-msg') c.remove(); 

                });

                document.getElementById('loading-msg').style.display = 'none';

    

                try {

                    const response = await fetch('/api/books');

                    if (!response.ok) throw new Error('Network response was not ok');

                    const books = await response.json();

                    

                    window.readTitles.clear();

                    books.forEach(book => {

                        if (book.title) {

                            const bookData = {

                                title: book.title,

                                authors: book.authors ? [book.authors] : [],

                                description: book.description || 'No description available.',

                                imageLinks: { thumbnail: book.thumbnail }

                            };

                            

                            window.readTitles.add(normalizeTitle(bookData.title));

                            const el = createBookEl(bookData, shelf, 'read');

                            updateBookEl(el, bookData);

                        }

                    });

                    console.log("Fetched and processed Read Collection from API.");

                } catch (error) {

                    console.error("Error fetching Read Collection:", error);

                    shelf.insertAdjacentHTML('beforeend', '<div class="w-full text-center text-red-400 italic mt-10 p-4">Could not load Read Collection from API. Using fallback books.</div>');

                    for(let t of FALLBACK_BOOKS) {

                        window.readTitles.add(normalizeTitle(t));

                        const el = createBookEl({title:t, authors:['...']}, shelf, 'read');

                        fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(t)}&maxResults=1`)

                            .then(r=>r.json()).then(d=>{ if(d.items) updateBookEl(el, d.items[0].volumeInfo); });

                    }

                }

            }

    

            async function loadWishlist() {

                try {

                    const response = await fetch('/api/wishlist');

                    if (!response.ok) throw new Error('Network response was not ok');

                    const books = await response.json();

    

                    const shelf = document.getElementById('shelf-wishlist');

                    Array.from(shelf.children).forEach(c => { 

                        if(!c.classList.contains('shelf-plaque') && c.id !== 'no-wishlist-books') c.remove(); 

                    });

                    

                    window.wishlistTitles.clear();

                    document.getElementById('no-wishlist-books').classList.toggle('hidden', books.length > 0);

    

                    books.forEach(book => {

                        const bookData = {

                            title: book.title,

                            authors: book.authors || [],

                            description: book.description || 'No description available.',

                            imageLinks: book.imageLinks || {},

                            recommendedBy: book.recommendedBy,

                            _id: book._id // Assuming the server sends back the MongoDB document ID

                        };

                        window.wishlistTitles.add(normalizeTitle(bookData.title));

                        const el = createBookEl(bookData, shelf, 'wishlist');

                        applyBookAppearance(el, bookData);

                        // Pass the document ID to the details modal

                        el.onclick = () => openDetailsModal(bookData, 'wishlist', bookData._id, bookData.recommendedBy);

                    });

                    console.log("Fetched and processed Wishlist from API.");

                } catch (error) {

                    console.error("Error fetching Wishlist:", error);

                    document.getElementById('shelf-wishlist').insertAdjacentHTML('beforeend', '<div class="w-full text-center text-red-400 italic mt-10 p-4">Could not load Wishlist from API.</div>');

                }

            }

    

            function createBookEl(book, container, type) {

                const el = document.createElement('div');

                el.className = 'book-face book-generated-cover';

                el.style.backgroundColor = BOOK_COLORS[Math.floor(Math.random()*BOOK_COLORS.length)];

                el.style.borderLeft = "4px solid rgba(0,0,0,0.3)";

                el.innerHTML = `<div class="flex flex-col h-full w-full justify-between py-2 px-1"><span class="text-[8px] uppercase text-white/50 text-center border-b border-white/20 pb-1">${type}</span><div class="text-[10px] md:text-xs font-bold text-center leading-tight line-clamp-3 text-[#f3f3f3] font-serif">${book.title}</div><div class="text-[8px] text-center text-white/50 truncate">${book.authors?.[0]||''}</div></div>`;

                if(type !== 'wishlist' && type !== 'work') el.onclick = () => openDetailsModal(book, type);

                container.appendChild(el);

                return el;

            }

    

            function applyBookAppearance(el, info) {

                if(info.imageLinks?.thumbnail) {

                    el.classList.remove('book-generated-cover'); el.style.backgroundImage = `url('${info.imageLinks.thumbnail}')`; el.innerHTML = '<div class="absolute left-0 top-0 bottom-0 w-1 bg-white/10"></div>';

                } else {

                    el.querySelector('div div:nth-child(2)').textContent = info.title; 

                    el.querySelector('div div:nth-child(3)').textContent = info.authors?.[0] || '';

                }

            }

    

            function updateBookEl(el, info) {

                applyBookAppearance(el, info);

                el.onclick = () => openDetailsModal(info, 'read');

            }

    

            // --- TURN.JS MAGAZINE (Global Scope) ---

            window.openMagazine = function(t, k) {

                const d = WORKS_CONTENT[k]; if(!d) return;

                const readerOverlay = document.getElementById('reader-overlay');

                

                // Determine if in mobile view

                const isMobile = $(window).width() < 768;

    

                // Set overlay display and centering properties based on mode

                if (isMobile) {

                    readerOverlay.style.display = 'flex'; // Use flex for mobile scrolling layout

                    readerOverlay.style.alignItems = 'flex-start'; // Align content to start for scrolling

                    readerOverlay.style.justifyContent = 'center'; // Center horizontally

                    readerOverlay.style.placeItems = ''; // Clear placeItems

                } else {

                    readerOverlay.style.display = 'grid'; // Use grid for desktop centering

                    readerOverlay.style.placeItems = 'center'; // Center both vertically and horizontally

                    readerOverlay.style.alignItems = ''; // Clear alignItems

                    readerOverlay.style.justifyContent = ''; // Clear justifyContent

                }

    

                const mag = $('#magazine');

                

                if(mag.turn('is')) mag.turn('destroy'); // Destroy existing turn.js instance if any

                mag.html(''); // Clear previous content

    

                if (isMobile) {

                    // Mobile view: single scrollable page

                    // Append all content directly into #magazine

                    mag.addClass('mobile-scroll-view'); // Add class for mobile styling

                    mag.css({

                        'width': '100%',

                        'height': '100%',

                        'overflow-y': 'auto',

                        'overflow-x': 'hidden',

                        'position': 'static', // Override absolute positioning

                        'transform': 'none',   // Override transform

                        'max-width': '600px', // Limit width for readability

                        'background-color': 'white', 

                        'background-image': 'url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/937765/linedpaper.png)',

                        'border': 'solid 1px grey'

                    });

    

                    mag.append(`<div class="hard mobile-hard-page"><div class="page-content-inner mobile-page-content-inner-h1"><h1>${d.title}</h1></div></div>`);

                    d.pages.forEach(html => {

                        mag.append(`<div class="page mobile-page"><div class="page-content-inner mobile-page-content-inner">${html}</div></div>`);

                    });

                    

                } else {

                    // Desktop view: Turn.js magazine

                    mag.removeClass('mobile-scroll-view'); // Remove mobile class

                    // Ensure default styles for #magazine are applied (or not overridden)

                    mag.css({

                        'position': '', // Reset to default or initial style

                        'transform': '',

                        'width': '',

                        'height': '',

                        'overflow-y': '',

                        'overflow-x': '',

                        'max-width': '',

                        'background-color': '',

                        'background-image': '',

                        'border': ''

                    });

    

                    mag.append(`<div class="hard"><div class="page-content-inner" style="display:flex; justify-content:center; align-items:center; text-align:center;"><h1>${d.title}</h1></div></div>`);

                    mag.append(`<div class="hard"></div>`);

    

                    d.pages.forEach(html => {

                        mag.append(`<div class="page"><div class="page-content-inner">${html}</div></div>`);

                    });

    

                    mag.append(`<div class="hard"></div>`);

                    mag.append(`<div class="hard"></div>`);

    

                    let w = Math.min($(window).width() * 0.9, 1000);

                    let h = Math.min($(window).height() * 0.8, 600);

                    const displayMode = $(window).width() < 768 ? 'single' : 'double'; 

    

                    mag.turn({

                        width: w, height: h,

                        display: displayMode, // This will typically be 'double' on desktop

                        autoCenter: true,

                        gradients: true,

                        acceleration: true,

                        turnCorners: "tl,tr"

                    });

    

                    mag.bind("turned", function(event, page, view) {

                        if (page >= mag.turn('pages')) {

                            setTimeout(function() {

                                window.closeReader();

                            }, 0); 

                        }

                    });

                }

                // Update the size on window resize for both modes if necessary

                $(window).resize(function() {

                    if(!isMobile && mag.turn('is')) { // Only resize turn.js if it's active and not mobile

                        let w = Math.min($(window).width() * 0.9, 1000);

                        let h = Math.min($(window).height() * 0.8, 600);

                        mag.turn('size', w, h);

                    } else if (isMobile) {

                        // For mobile, ensure max-width adjusts if window width changes

                        mag.css('max-width', Math.min($(window).width() * 0.9, 600) + 'px');

                    }

                });

            };

    

            window.closeReader = function() {

                const mag = $('#magazine');

                if (mag.turn('is')) {

                    mag.turn('destroy');

                }

                // Reset #magazine classes and inline styles

                mag.removeClass('mobile-scroll-view');

                mag.css({

                    'width': '',

                    'height': '',

                    'overflow-y': '',

                    'overflow-x': '',

                    'position': '',

                    'transform': '',

                    'max-width': '',

                    'background-color': '',

                    'background-image': '',

                    'border': ''

                });

                const readerOverlay = document.getElementById('reader-overlay');

                readerOverlay.style.display = 'none'; // Ensure it's hidden

                readerOverlay.style.alignItems = ''; // Reset

                readerOverlay.style.justifyContent = ''; // Reset

                readerOverlay.style.placeItems = ''; // Reset

            };

            

            $(window).resize(function() {

                if($('#magazine').turn('is')) {

                    let w = Math.min($(window).width() * 0.9, 1000);

                    let h = Math.min($(window).height() * 0.8, 600);

                    $('#magazine').turn('size', w, h);

                }

            });

    
