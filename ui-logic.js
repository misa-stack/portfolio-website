// --- NETWORK SHADER BACKGROUND ---
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let points = [];
    const init = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        points = Array.from({ length: 45 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4
        }));
    };
    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
        points.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            points.slice(i + 1).forEach(p2 => {
                let d = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (d < 180) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            });
        });
        requestAnimationFrame(draw);
    };
    init(); draw();
    window.addEventListener('resize', init);
}

// --- FAST GSAP REVEAL ---
window.addEventListener('load', () => {
    gsap.to(".reveal", { 
        duration: 0.6,    // Fast duration
        opacity: 1, 
        y: 0, 
        stagger: 0.05,    // Fast sequence
        ease: "power2.out",
        delay: 0.1
    });
});

// --- NAV HIGHLIGHTING ---
function highlightActivePage() {
    const path = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-item');

    navLinks.forEach(link => {
        // Get the href and clean it (e.g., "works.html" -> "works")
        const href = link.getAttribute('href').toLowerCase();
        const cleanHref = href.replace('.html', '').replace('./', '');

        // Reset classes
        link.classList.remove('active-page', 'text-indigo-400', 'font-bold');
        link.classList.add('text-zinc-400');

        // Logic:
        // 1. If path is "/" and link is "index", it's Home.
        // 2. If the path contains the link's name (e.g., "/works" contains "works"), it's a match.
        const isHome = (path === '/' || path.includes('index')) && cleanHref === 'index';
        const isMatch = path.includes(cleanHref) && cleanHref !== 'index';
    });
}

// --- PING SIMULATOR ---
function updatePing() {
    const pingElement = document.getElementById('ping-stat');
    if(pingElement) {
        const jitter = Math.floor(Math.random() * 15);
        pingElement.innerText = `${24 + jitter}ms`;
    }
}

async function getIPLocation() {
    const locElement = document.getElementById('location-stat');
    if (!locElement) return;

    // List of reliable, free APIs that don't require keys
    const apis = [
        'https://ipapi.co/json/',
        'https://ipwho.is/',
        'https://freeipapi.com/api/json'
    ];

    for (let api of apis) {
        try {
            const response = await fetch(api);
            if (!response.ok) continue;
            const data = await response.json();
            
            // Handle different data formats from different APIs
            const city = data.city || data.cityName || "Unknown";
            const country = data.country_code || data.countryCode || "Node";
            
            locElement.innerText = `${city.toUpperCase()}, ${country}`;
            return; // Exit function if successful
        } catch (e) {
            console.warn(`Failed to fetch from ${api}, trying next...`);
        }
    }
    locElement.innerText = "LOCAL_HOST";
}

// Initialize System
document.addEventListener('DOMContentLoaded', () => {
    highlightActivePage();
    getIPLocation();
    setInterval(updatePing, 1500);
});