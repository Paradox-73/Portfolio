lucide.createIcons();

            // --- API ---
            const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3000'
                : '';

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
                        // Hardcover search returns full descriptions (Open Library usually didn't).
                        const res = await fetch(`${API_BASE_URL}/api/hardcover-search?q=${encodeURIComponent(q)}`);
                        const books = await res.json();
                        searchResults.innerHTML = '';
                        if(Array.isArray(books) && books.length) {
                            books.forEach(bookInfo => {
                                const div = document.createElement('div');
                                div.className = 'search-item';
                                const thumb = (bookInfo.imageLinks && bookInfo.imageLinks.thumbnail) || 'https://via.placeholder.com/35x50?text=No+Img';
                                div.innerHTML = `<img src="${thumb}" class="w-8 h-12 object-cover rounded"><div class="text-xs text-gray-300 font-bold">${bookInfo.title}</div>`;
                                div.onclick = () => showRecommendPreview(bookInfo);
                                searchResults.appendChild(div);
                            });
                        } else searchResults.innerHTML = '<div class="p-2 text-gray-500 text-sm">No results.</div>';
                    } catch(e) { console.error(e); searchResults.innerHTML = '<div class="p-2 text-gray-500 text-sm">Search failed.</div>'; }
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
            
            // Maps an Open Library search doc into the {title, authors, description, imageLinks}
            // shape the rest of the page already uses (covers come from the cover id).
            function olToBookInfo(doc) {
                const cover = doc.cover_i
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                    : null;
                let desc = '';
                if (doc.first_sentence) {
                    desc = Array.isArray(doc.first_sentence)
                        ? doc.first_sentence[0]
                        : (doc.first_sentence.value || doc.first_sentence);
                }
                return {
                    title: doc.title || 'Untitled',
                    authors: doc.author_name || ['Unknown'],
                    description: desc,
                    imageLinks: { thumbnail: cover, smallThumbnail: cover },
                    workKey: doc.key // e.g. "/works/OL12345W"
                };
            }

            async function showRecommendPreview(info) {
                searchWrapper.classList.remove('active');
                searchResults.style.display='none';

                // Open Library search doesn't include the full blurb; fetch it from the work record.
                if ((!info.description || info.description.length < 5) && info.workKey) {
                    try {
                        const r = await fetch(`https://openlibrary.org${info.workKey}.json`);
                        const w = await r.json();
                        if (w.description) {
                            info.description = typeof w.description === 'string' ? w.description : (w.description.value || '');
                        }
                    } catch (e) { /* non-fatal — show without a blurb */ }
                }

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
                    const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
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
                        return;
                    }

                    if (!response.ok) throw new Error('Server responded with an error.');

                    await showAlert("Success", "Recommendation Sent! Thank you.");
                    document.getElementById('details-modal').style.display = 'none';
                    document.getElementById('search-bar').value = '';
                    loadWishlist(); 
                } catch (e) {
                    console.error(e);
                    await showAlert("Error", "Failed to send recommendation.");
                }
            }

            async function openDetailsModal(book, type, docId, recBy) {
                const modal = document.getElementById('details-modal');
                const footer = document.getElementById('modal-footer');

                // Wishlist (and older) items can be stored without a description — look one
                // up from Hardcover by title so the modal isn't blank.
                const missingDesc = !book.description || book.description === 'No description available.' || book.description.length < 5;
                if (missingDesc && book.title) {
                    try {
                        const r = await fetch(`${API_BASE_URL}/api/hardcover-search?q=${encodeURIComponent(book.title)}`);
                        const matches = await r.json();
                        const hit = Array.isArray(matches) ? matches.find(m => m.description) : null;
                        if (hit) {
                            book.description = hit.description;
                            if (!book.imageLinks || !book.imageLinks.thumbnail) book.imageLinks = hit.imageLinks;
                        }
                    } catch (e) { /* non-fatal — show without a blurb */ }
                }

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

                        if (pwd === null) return; // cancelled

                        let verified = false;
                        try {
                            const verifyRes = await fetch(`${API_BASE_URL}/api/admin/verify-password`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ password: pwd })
                            });
                            verified = (await verifyRes.json()).success;
                        } catch (err) {
                            await showAlert("Error", "Could not verify password.");
                            checkbox.checked = false;
                            return;
                        }

                        if (verified) {
                            checkbox.checked = true;
                            try {
                                const addResponse = await fetch(`${API_BASE_URL}/api/books`, {
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

                                const deleteResponse = await fetch(`${API_BASE_URL}/api/wishlist/${docId}`, {
                                    method: 'DELETE'
                                });
                                if (!deleteResponse.ok) throw new Error('Failed to remove book from wishlist.');

                                await showAlert("Success", "Moved to Read Collection!");
                                document.getElementById('details-modal').style.display = 'none';
                                
                                loadLibrary();
                                loadWishlist();
                            } catch(err) {
                                await showAlert("Update Failed", err.message);
                            }
                        } else {
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
                document.getElementById('modal-author').textContent = info.authors?.join(', ') || 'Unknown Author';
                
                let descHTML = info.description || 'No description available.';
                if (info.my_rating) {
                    const stars = generateStarRatingHTML(info.my_rating);
                    descHTML = `<div class="mb-4 p-3 bg-[#120c09] border border-[#d4af37]/20 rounded-lg">
                        <div class="flex items-center gap-3 mb-1">
                            <i class="fa fa-check-circle text-[#ffd700]"></i>
                            <span class="text-[#ffd700] text-xs font-bold uppercase tracking-widest">Kanav has read this</span>
                        </div>
                        ${stars}
                    </div>` + descHTML;
                }
                
                document.getElementById('modal-desc').innerHTML = descHTML;
                document.getElementById('modal-cover').src = info.imageLinks?.thumbnail || `https://via.placeholder.com/150x220?text=${encodeURIComponent(info.title || 'Book')}`;
            }

            function generateStarRatingHTML(rating) {
                if (typeof rating === 'undefined' || rating === null || isNaN(rating)) return '';
                const maxRating = 5;
                let starsHtml = '';
                for (let i = 1; i <= maxRating; i++) {
                    if (rating >= i) starsHtml += '<i class="fa fa-star text-[#ffd700]"></i>';
                    else if (rating >= i - 0.5) starsHtml += '<i class="fa fa-star-half-o text-[#ffd700]"></i>';
                    else starsHtml += '<i class="fa fa-star-o text-[#ffd700]"></i>';
                }
                return `<div class="flex gap-1 mt-1">${starsHtml}</div>`;
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

                fetch(`${API_BASE_URL}/api/works`)
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
                const shelf = document.getElementById('shelf-read');
                Array.from(shelf.children).forEach(c => { 
                    if(!c.classList.contains('shelf-plaque') && c.id !== 'loading-msg') c.remove(); 
                });
                document.getElementById('loading-msg').style.display = 'none';

                try {
                    // Read collection comes from two sources: the curated MongoDB collection
                    // (/api/books) and the live Hardcover "Read" shelf (/api/hardcover-books).
                    // Either may fail independently (e.g. Hardcover token missing) — tolerate that
                    // and render whatever loaded. Merge + de-dupe by normalized title.
                    const [mongoRes, hcRes] = await Promise.allSettled([
                        fetch(`${API_BASE_URL}/api/books`),
                        fetch(`${API_BASE_URL}/api/hardcover-books`)
                    ]);

                    const readJson = async (settled) => {
                        if (settled.status !== 'fulfilled' || !settled.value.ok) return [];
                        try { return await settled.value.json(); } catch { return []; }
                    };
                    const mongoBooks = await readJson(mongoRes);
                    const hcBooks = await readJson(hcRes);

                    if (!mongoBooks.length && !hcBooks.length) throw new Error('No read books from either source');

                    // Normalize both sources to the same shape, then merge preferring the
                    // record that carries more detail (cover/description) on title collisions.
                    const toBookData = (book) => ({
                        title: book.title,
                        authors: book.authors ? (Array.isArray(book.authors) ? book.authors : [book.authors]) : [],
                        description: book.description || 'No description available.',
                        imageLinks: { thumbnail: book.thumbnail || book.imageLinks?.thumbnail },
                        my_rating: book.my_rating
                    });
                    const richness = (b) => (b.imageLinks.thumbnail ? 2 : 0) + (b.description && b.description !== 'No description available.' ? 1 : 0);

                    const merged = new Map();
                    [...mongoBooks, ...hcBooks].forEach(raw => {
                        if (!raw.title) return;
                        const bd = toBookData(raw);
                        const key = normalizeTitle(bd.title);
                        const ex = merged.get(key);
                        if (!ex || richness(bd) > richness(ex)) merged.set(key, bd);
                    });

                    window.readTitles.clear();
                    merged.forEach((bookData) => {
                        window.readTitles.add(normalizeTitle(bookData.title));
                        const el = createBookEl(bookData, shelf, 'read');
                        updateBookEl(el, bookData);
                    });
                    console.log(`Fetched Read Collection: ${mongoBooks.length} from MongoDB + ${hcBooks.length} from Hardcover = ${merged.size} after de-dupe.`);
                } catch (error) {
                    console.error("Error fetching Read Collection:", error);
                    shelf.insertAdjacentHTML('beforeend', '<div class="w-full text-center text-red-400 italic mt-10 p-4">Could not load Read Collection from API. Using fallback books.</div>');
                    for(let t of FALLBACK_BOOKS) {
                        window.readTitles.add(normalizeTitle(t));
                        const el = createBookEl({title:t, authors:['...']}, shelf, 'read');
                        fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(t)}&limit=1&fields=title,author_name,cover_i,key`)
                            .then(r=>r.json()).then(d=>{ if(d.docs && d.docs[0]) updateBookEl(el, olToBookInfo(d.docs[0])); });
                    }
                }
            }

            async function loadWishlist() {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/wishlist`);
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
                            _id: book._id 
                        };
                        window.wishlistTitles.add(normalizeTitle(bookData.title));
                        const el = createBookEl(bookData, shelf, 'wishlist');
                        applyBookAppearance(el, bookData);
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
                const isMobile = $(window).width() < 768;

                if (isMobile) {
                    readerOverlay.style.display = 'flex'; 
                    readerOverlay.style.alignItems = 'flex-start'; 
                    readerOverlay.style.justifyContent = 'center'; 
                    readerOverlay.style.placeItems = ''; 
                } else {
                    readerOverlay.style.display = 'grid'; 
                    readerOverlay.style.placeItems = 'center'; 
                    readerOverlay.style.alignItems = ''; 
                    readerOverlay.style.justifyContent = ''; 
                }

                const mag = $('#magazine');
                if(mag.turn('is')) mag.turn('destroy'); 
                mag.html(''); 

                if (isMobile) {
                    mag.addClass('mobile-scroll-view'); 
                    mag.css({
                        'width': '100%', 'height': '100%', 'overflow-y': 'auto', 'overflow-x': 'hidden',
                        'position': 'static', 'transform': 'none', 'max-width': '600px',
                        'background-color': 'white', 
                        'background-image': 'url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/937765/linedpaper.png)',
                        'border': 'solid 1px grey'
                    });
                    mag.append(`<div class="hard mobile-hard-page"><div class="page-content-inner mobile-page-content-inner-h1"><h1>${d.title}</h1></div></div>`);
                    d.pages.forEach(html => {
                        mag.append(`<div class="page mobile-page"><div class="page-content-inner mobile-page-content-inner">${html}</div></div>`);
                    });
                } else {
                    mag.removeClass('mobile-scroll-view'); 
                    mag.css({ 'position': '', 'transform': '', 'width': '', 'height': '', 'overflow-y': '', 'overflow-x': '', 'max-width': '', 'background-color': '', 'background-image': '', 'border': '' });
                    mag.append(`<div class="hard"><div class="page-content-inner" style="display:flex; justify-content:center; align-items:center; text-align:center;"><h1>${d.title}</h1></div></div>`);
                    mag.append(`<div class="hard"></div>`);
                    d.pages.forEach(html => { mag.append(`<div class="page"><div class="page-content-inner">${html}</div></div>`); });
                    mag.append(`<div class="hard"></div>`); mag.append(`<div class="hard"></div>`);

                    let w = Math.min($(window).width() * 0.9, 1000);
                    let h = Math.min($(window).height() * 0.8, 600);
                    const displayMode = $(window).width() < 768 ? 'single' : 'double'; 

                    mag.turn({ width: w, height: h, display: displayMode, autoCenter: true, gradients: true, acceleration: true, turnCorners: "tl,tr" });
                    mag.bind("turned", function(event, page, view) { if (page >= mag.turn('pages')) setTimeout(() => window.closeReader(), 0); });
                }

                $(window).resize(function() {
                    if(!isMobile && mag.turn('is')) { 
                        let w = Math.min($(window).width() * 0.9, 1000);
                        let h = Math.min($(window).height() * 0.8, 600);
                        mag.turn('size', w, h);
                    } else if (isMobile) {
                        mag.css('max-width', Math.min($(window).width() * 0.9, 600) + 'px');
                    }
                });
            };

            window.closeReader = function() {
                const mag = $('#magazine');
                if (mag.turn('is')) mag.turn('destroy');
                mag.removeClass('mobile-scroll-view');
                mag.css({ 'width': '', 'height': '', 'overflow-y': '', 'overflow-x': '', 'position': '', 'transform': '', 'max-width': '', 'background-color': '', 'background-image': '', 'border': '' });
                const readerOverlay = document.getElementById('reader-overlay');
                readerOverlay.style.display = 'none'; 
                readerOverlay.style.alignItems = ''; readerOverlay.style.justifyContent = ''; readerOverlay.style.placeItems = ''; 
            };
            
            $(window).resize(function() {
                if($('#magazine').turn('is')) {
                    let w = Math.min($(window).width() * 0.9, 1000);
                    let h = Math.min($(window).height() * 0.8, 600);
                    $('#magazine').turn('size', w, h);
                }
            });
