# Kanav's Interactive Portfolio

## About My Project

Welcome to my interactive portfolio! This project is a creative showcase of my work, interests, and skills, designed to be a unique and engaging experience. I've built the frontend as a pixelated digital room, where each interactive object invites you to explore a different facet of my personality and expertise. Behind this playful interface, a robust Node.js backend with MongoDB tirelessly serves dynamic content and intelligently proxies external APIs like TMDB, OMDB, and RAWG to keep everything rich and up-to-date.

## Key Features

*   **My Digital Room Experience**: I've crafted a pixel-art themed room that serves as the main navigation hub. Clicking on objects in the room transports you to different sections of my portfolio.
*   **Dynamic Loading**: An engaging loader with a progress bar keeps you company while everything loads, followed by a personal welcome message from me.
*   **Ambient Music**: I've integrated a background music player using the YouTube IFrame API to set the mood, complete with an autoplay fallback and toggle controls.
*   **Detailed Portfolio Sections**: Each interactive item leads to a dedicated page:
    *   **Music**: Dive into my sonic world with popular playlists, featured artists, recommended albums, and an integrated music player, all powered by data fetched from Spotify.
    *   **Movies & TV**: Explore my cinematic tastes, with dynamic content integrated from TMDB and OMDB.
    *   **Games**: Discover my gaming universe, with data pulled from the RAWG API.
    *   **Travel**: Journey through my travel memories and aspirations.
    *   **Food**: Savor my culinary adventures and recipes.
    *   **Literature**: Browse my favorite reads and literary escapes.
    *   **Art**: Step into my creative canvas, showcasing my artistic inspirations.
    *   **Sport**: See the sports I've played and enjoy.
    *   **Projects**: Experience an XP-themed desktop environment featuring my key development projects.
*   **Holographic Contact Display**: Hover over the phone in my digital room to reveal a holographic display, providing quick access to my GitHub, LinkedIn, Email, and Resume.
*   **Backend Services**: I've built a Node.js/Express.js API to manage data in MongoDB and to proxy external APIs securely.
*   **Automated Movie Diary Sync**: A custom-built ETL pipeline automatically fetches my latest movie entries from my public Letterboxd RSS feed, enriches them with data from The Movie Database (TMDB), and saves them to MongoDB. This sync runs on a daily schedule, ensuring my movie list is always up-to-date without manual intervention.
*   **Data Management**: I use a script to initially populate my MongoDB collections from CSV files, making data setup efficient.
*   **Admin Wishlist**: For certain sections (like games), I've included protected endpoints to manage personal wishlists.
*   **Responsive Design**: I've ensured that my portfolio is accessible and looks great across various screen sizes.

## Technologies I Used

### Frontend

*   **HTML5, CSS3, JavaScript (ES6+)**: The core building blocks of my interactive web experience.
*   **External Libraries**:
    *   [Font Awesome](https://fontawesome.com/): For all the cool icons you see around.
    *   [Swiper.js](https://swiperjs.com/): Powering the carousels in my Music section.
    *   [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference): For seamless background music integration.
    *   [PapaParse](https://www.papaparse.com/): A utility for client-side CSV parsing, though my backend migration handles most data.

### Backend

*   **Node.js** & **Express.js**: I use Node.js as my JavaScript runtime, and **Express.js** is the web application framework built on top of Node.js that I chose for building my robust and scalable API. It allows me to handle requests, manage data in MongoDB, and act as a secure gateway to external APIs. This backend is crucial for dynamic content, and it's also where I can make recommendations for various items across my portfolio.
*   [MongoDB Atlas](https://www.mongodb.com/atlas): Where all my dynamic data lives, hosted securely in the cloud.
*   `dotenv`, `cors`, `axios`: Essential npm packages for environment variable management, cross-origin resource sharing, and making HTTP requests to external APIs.
*   `node-cron` & `rss-parser`: For creating the automated, scheduled job that fetches and parses the Letterboxd RSS feed to keep my movie diary synced.

### External APIs I Integrated

*   **Letterboxd RSS Feed**: The source for my automated movie diary sync.
*   [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api): For rich movie and TV show data.
*   [Open Movie Database (OMDB)](http://www.omdbapi.com/): My reliable fallback for movie/TV data if TMDB isn't available.
*   [RAWG Video Games Database API](https://rawg.io/apidocs): To showcase my gaming interests with detailed game information.
*   **Spotify**: While not directly exposed, my music data structure and scripts imply integration with Spotify's data to curate my playlists and recommendations.

## My Portfolio Sections in Detail

Here's a closer look at what each section of my portfolio offers:

### My Digital Room (`index.html`)

This is the central hub of my portfolio, designed as a cozy, pixel-art inspired room. It's the first thing you'll see. Key interactive elements include:
*   **Ukulele**: Leads to my Music section.
*   **Movie Posters**: Leads to my Movies & TV section.
*   **PS5**: Leads to my Games section.
*   **Painting**: Leads to my Art section.
*   **Noodles**: Leads to my Food section.
*   **Polaroids**: Leads to my Travel section.
*   **Bookshelf**: Leads to my Literature section.
*   **Dumbbell**: Leads to my Sport section.
*   **Monitor**: Leads to my Projects section.
*   **Phone**: Reveals my holographic contact display (GitHub, Resume, Email, LinkedIn).
*   **Speaker**: Toggles ambient background music.
*   **Dog**: Just a cute, sleeping dog!

### My Sonic World (Music) (`Music.html`)

This page is a deep dive into my musical tastes. I've designed it with a modern layout, featuring:
*   **Sidebar Navigation**: A persistent navigation bar to easily jump between all portfolio categories.
*   **Popular Playlists**: A dynamic carousel (powered by Swiper.js) showcasing playlists, some linked directly to Spotify.
*   **Featured Artists**: A collection of artists I admire, with images and names.
*   **Recommended Albums/Podcasts**: My curated list of albums and episodes for you to check out.
*   **Recommended Songs**: A list of individual tracks I recommend.
*   **Integrated Music Player**: A functional music player that loads audio previews from Spotify data and features a rotating album cover, progress bar, and playback controls.

### My Reel Life (Movies & TV) (`MoviesTV.html`)

This section offers a personalized, Netflix-style interface for exploring my favorite movies, TV shows, and anime.
*   **Profile Selection**: Starts with a "Who's watching?" screen, allowing for a personalized entry (currently "Kanav").
*   **Dynamic Billboard**: A prominent section showcasing a rotating selection of titles with trailers (via YouTube Iframe API), a brief description, and action buttons. I can navigate through these using arrow keys.
*   **Content Rows**: Organized rows for "Recommended for Kanav," "Recommended By Others," "Movies," "Shows," and "Anime," all dynamically loaded.
*   **Comprehensive Search**: A global search bar to find titles across movies, TV, and anime, with results displayed in a grid.
*   **Detail Modals**: Clicking on any title opens a detailed modal view showing trailers, description, cast, genres, similar titles, and for TV shows, episode listings by season.
*   **Recommendation System**: I've built a system where others can recommend titles to me, and I can mark them as "seen" (with admin password protection).
*   **Grid View**: Dedicated full-page grids for Movies, Shows, and Anime, offering filtering by genre and sorting options.
*   **Backend Integration**: All dynamic content and recommendations are fetched from my Node.js/Express.js backend, which proxies TMDB and OMDB for rich media metadata.

### My Gaming Universe (Games) (`Games.html`)

This page is a PlayStation-inspired arcade where I showcase my gaming interests.
*   **Interactive Intro**: Features an animated intro with a "Press Spacebar or A on your gamepad" prompt, creating an immersive entry.
*   **Dynamic Backgrounds**: Uses a `dynamic-bg-img` and a YouTube video background to set the mood for the currently selected game.
*   **Carousel Navigation**: A horizontally scrolling carousel of game covers, allowing me to browse through my game library and wishlist.
*   **Game Details**: Displays the title, tagline, and a play button for the currently selected game.
*   **Recommendation & Wishlist**: Includes a "Wishlist" tab where I can manage games recommended by others, mark them as "played" (password protected), or add new game recommendations. It integrates with the RAWG API via my backend for game data.
*   **Global Search**: A search bar allows me to look up games, showing both games I own/wishlist and external results from RAWG.
*   **Detail Overlay**: Provides more in-depth information about a selected game, including description, genres, platforms, and release date.
*   **Settings Menu**: A slide-out menu offering quick navigation to other portfolio sections.
*   **Gamepad Support**: Designed with gamepad interaction in mind for a true console-like experience.

### My Wanderlust (Travel) (`Travel.html`)

I've designed this section as an interactive scrapbook or travel magazine, utilizing the `Turn.js` library for a realistic page-flipping experience.
*   **Scrapbook Design**: Each "page" is styled to look like a scrapbook entry, complete with handwritten-style fonts and skewed images.
*   **Personal Travelogues**: Features stories and photos from my trips to places like Pondicherry, Coorg, and Shimla, sharing personal anecdotes and experiences.
*   **Wishlist Destinations**: I've included a page for my travel wishlist (e.g., Singapore), humorously noting it's a work in progress.
*   **Interactive Navigation**: The last page of the scrapbook includes a grid of icons, allowing direct navigation to other sections of my portfolio, enhanced with tooltips.
*   **Responsive Page Turning**: The page-flipping mechanism adapts for mobile, offering a single-page scroll view on smaller screens and classic double-page turns on desktop, with both keyboard and touch swipe navigation.

### My Culinary Journey (Food) (`Food.html`)

This page is a delightful menu showcasing my culinary adventures, designed with a retro diner aesthetic.
*   **Menu Categories**: Organizes my dishes into sections like "Suspicious But Delicious" (mains), "Frozen Gourmet" (sides), "Sugar Crash" (desserts), and "Udderly Delicious" (shakes/drinks).
*   **Interactive Menu Items**: Each dish includes an image, name, a witty description, a star rating, and a "Recipe" button.
*   **Recipe Modals**: Clicking the "Recipe" button (managed by `recipe.js` and `recipes.js`) pops up a modal displaying detailed ingredients and instructions for the dish.
*   **Allergen Legend**: A clear legend indicates common allergens (Nuts, Eggs, Wheat, Dairy, Seafood) for each dish.
*   **Music Toggle**: Includes a music toggle button to play background music (via YouTube Iframe API), enhancing the dining experience.
*   **Playful Interactions**: Features sound effects on button hovers and clicks (though commented out in the JS), and an interactive "Bill" section that reveals a humorous message.
*   **Footer Navigation**: Quick links to other portfolio sections are available in the footer.

### My Literary Escape (Literature) (`Literature.html`)

This section is my personal library, presented as a stylized bookshelf with interactive elements.
*   **Categorized Shelves**: Books are organized into "My Works" (my own writings), "Read Collection" (books I've read), and "Wishlist" (books recommended by others or that I want to read).
*   **Dynamic Book Covers**: Each book is represented by an interactive spine or cover, dynamically generated or fetched from Google Books API.
*   **Search & Recommend**: A search bar allows me to look for books via the Google Books API. I can then recommend books for my wishlist, providing my name for the recommendation.
*   **Recommendation System**: The backend allows me to manage my wishlist. I can mark books from my wishlist as "read" (with admin password protection), moving them to my "Read Collection."
*   **Detail Modals**: Clicking on a book opens a modal with its title, author, description, and cover image.
*   **Integrated Reader**: For items in "My Works," clicking on the book opens an immersive Turn.js-powered reader, displaying the content in a page-flipping format.
*   **Navigation Menu**: A slide-out menu provides quick access to other portfolio sections.
*   **Tailwind CSS**: The page styling utilizes Tailwind CSS for a modern and responsive design, while still maintaining an aesthetic fitting a library.

### My Creative Canvas (Art) (`art.html`)

This page transforms into an immersive 3D art gallery, where you can walk through a virtual space filled with my curated art collection.
*   **3D Environment**: Built using Three.js, it features a navigable gallery with walls, floors, and dynamic lighting.
*   **Interactive Artworks**: Various artworks are displayed on the walls, each with a generated description tag, offering details about the piece.
*   **First-Person Navigation**: I can explore the gallery using WASD keys for movement and mouse for looking around (or virtual joystick/touch for mobile).
*   **Ambient Music**: Background music plays to enhance the gallery experience, with a toggle to mute/unmute.
*   **Dynamic Ceiling**: I can toggle the ceiling between a standard cloudy sky and a starry night texture.
*   **Interactive Door/Menu**: A functional door allows entry/exit and serves as a gateway to a full navigation menu to other portfolio sections.
*   **Speed Control**: I can double my movement speed for faster exploration.
*   **Responsive Controls**: Includes virtual joysticks and buttons for mobile devices, ensuring accessibility across platforms.

### My Sporting Arena (Sport) (`Sport.html`)

This page is an arcade-style hub where I bring my passion for sports to life through interactive mini-games. It's designed to give a retro gaming experience.
*   **Arcade Menu**: A central menu allows me to select and launch different sports-themed mini-games.
*   **Playable Mini-Games**:
    *   **Basketball ("Around the World")**: A first-person perspective game where I can aim and shoot hoops from different positions on a court, featuring basic physics and scoring.
    *   **Golf ("Pro Links 9")**: A top-down golf simulation with 9 different holes, including various terrain types like grass, sand traps, and water hazards. I control power and aim to get the ball into the hole.
    *   **Martial Arts ("Dojo Legends")**: A side-scrolling fighting game where I control a character to punch and kick a heavy bag, building combos and scoring hits.
*   **Interactive Controls**: Games respond to keyboard/mouse input on desktop and virtual controls (directional pad, A/B buttons) on mobile devices.
*   **Game HUD**: Each game features a heads-up display showing score and other relevant game information.
*   **Responsive Design**: The interface adapts for mobile devices, including a landscape orientation blocker to ensure optimal gameplay.

### My XP-Themed Workbench (Projects) (`Projects.html`)

This page is a fun, retro-inspired representation of my development projects, styled like a Windows XP desktop. Here, you'll find:
*   **Desktop Icons**: Visual shortcuts to various applications and my project folders.
*   **Start Menu**: A functional Start Menu with shortcuts to common applications (like Notepad, Calculator, Command Prompt, Paint, Minesweeper, Internet Explorer) and important links (My Projects, Resume, Contact Me).
*   **Window Manager**: A custom windowing system that allows opening, minimizing, maximizing, and dragging application windows.
*   **Simulated Applications**: Interactive versions of classic Windows XP apps:
    *   **Command Prompt (CMD)**: A basic command-line interface.
    *   **Notepad**: A simple text editor.
    *   **Calculator**: A functional calculator.
    *   **Paint**: A basic drawing application with various tools and color palette.
    *   **Internet Explorer**: A simplified browser that can render HTML content or external URLs.
    *   **Minesweeper**: A playable version of the classic game.
*   **My Projects Folder**: Contains `.url` files that open detailed descriptions of my key development projects within the simulated Internet Explorer browser.

