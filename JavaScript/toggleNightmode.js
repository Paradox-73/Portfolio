function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    
    var moonImage = document.getElementById("night-mode-toggle");
    
    if (moonImage.src.includes("moon.png")) {
        moonImage.src = "Images/sun.png";
    } else {
        moonImage.src = "Images/moon.png";
    }
    
    var html = document.documentElement;
    html.classList.toggle("dark");
}
