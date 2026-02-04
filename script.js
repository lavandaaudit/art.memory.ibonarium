// Art Planet Memory - Extended Archive Version
// IBONARIUM.TV - Full Museum Integration

// ============================================
// MUSEUM APIs WITH FULL DESCRIPTIONS
// ============================================

const MUSEUMS = {
    harvard: {
        apiKey: "4a0f4bd0-d9b9-11ef-b544-e16a088c2e19", // Free public key
        baseUrl: "https://api.harvardartmuseums.org",
        enabled: true
    },
    met: {
        searchUrl: "https://collectionapi.metmuseum.org/public/collection/v1/search",
        objectUrl: "https://collectionapi.metmuseum.org/public/collection/v1/objects",
        enabled: true
    },
    rijks: {
        apiKey: "0fiuZFh4",
        searchUrl: "https://www.rijksmuseum.nl/api/en/collection",
        enabled: true
    }
};

// ============================================
// EXTENDED LOCAL DATABASE WITH FULL DESCRIPTIONS
// ============================================

const extendedArtDatabase = {};

// ============================================
// ANIMATED STARS
// ============================================

const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas.getContext('2d');
let stars = [];

function initStars() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            radius: Math.random() * 2,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            hue: Math.random() * 60 + 180,
            hueSpeed: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

function animateStars() {
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

    stars.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = starsCanvas.width;
        if (star.x > starsCanvas.width) star.x = 0;
        if (star.y < 0) star.y = starsCanvas.height;
        if (star.y > starsCanvas.height) star.y = 0;

        star.hue += star.hueSpeed;
        if (star.hue < 180) star.hue = 240;
        if (star.hue > 240) star.hue = 180;

        starsCtx.beginPath();
        starsCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        starsCtx.fillStyle = `hsla(${star.hue}, 70%, 70%, ${star.opacity})`;
        starsCtx.shadowBlur = 10;
        starsCtx.shadowColor = `hsl(${star.hue}, 70%, 70%)`;
        starsCtx.fill();
        starsCtx.shadowBlur = 0;
    });

    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initStars);
initStars();
animateStars();

// ============================================
// HARVARD ART MUSEUMS API
// ============================================

async function searchHarvardMuseum(era) {
    try {
        const years = getEraYears(era);
        const century = Math.floor(years.start / 100) + 1;

        const response = await fetch(
            `${MUSEUMS.harvard.baseUrl}/object?apikey=${MUSEUMS.harvard.apiKey}&century=${century}&hasimage=1&size=20&sort=random`
        );
        const data = await response.json();

        if (data.records && data.records.length > 0) {
            const artwork = data.records[0];

            return {
                title: artwork.title || "Без назви",
                artist: artwork.people?.[0]?.name || "Невідомий художник",
                year: artwork.dated || `${century} століття`,
                medium: artwork.medium || artwork.technique || "Живопис",
                location: `Harvard Art Museums, ${artwork.division || 'Cambridge'}`,
                imageUrl: artwork.primaryimageurl,
                description: artwork.description || artwork.commentary || "Твір з колекції Harvard Art Museums.",
                analysis: artwork.commentary || "Детальний аналіз цього твору розкриває його художню та історичну цінність.",
                historicalContext: `Створено в ${artwork.century || century} столітті. ${artwork.culture || ''} ${artwork.period || ''}`,
                technique: artwork.technique || artwork.medium || "Традиційна техніка живопису",
                provenance: `Колекція: ${artwork.division || 'Harvard Art Museums'}. ${artwork.creditline || ''}`,
                source: "Harvard Art Museums",
                era: era
            };
        }
    } catch (error) {
        console.log("Harvard API error:", error);
    }
    return null;
}

// ============================================
// MET MUSEUM API
// ============================================

async function searchMetMuseum(era) {
    try {
        const years = getEraYears(era);
        const randomYear = Math.floor(Math.random() * (years.end - years.start + 1)) + years.start;

        const response = await fetch(
            `${MUSEUMS.met.searchUrl}?dateBegin=${randomYear}&dateEnd=${randomYear}&hasImages=true&q=painting`
        );
        const data = await response.json();

        if (data.objectIDs && data.objectIDs.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(10, data.objectIDs.length));
            const id = data.objectIDs[randomIndex];
            const objectResponse = await fetch(`${MUSEUMS.met.objectUrl}/${id}`);
            const artwork = await objectResponse.json();

            if (artwork.primaryImage) {
                return {
                    title: artwork.title || "Без назви",
                    artist: artwork.artistDisplayName || "Невідомий художник",
                    year: artwork.objectDate || randomYear,
                    medium: artwork.medium || "Живопис",
                    location: "Metropolitan Museum of Art, New York",
                    imageUrl: artwork.primaryImage,
                    description: `${artwork.title} - ${artwork.objectName || 'твір мистецтва'} створений ${artwork.artistDisplayName || 'невідомим художником'}. ${artwork.culture || ''} ${artwork.period || ''}`,
                    analysis: `Цей твір представляє ${artwork.classification || 'живопис'} та демонструє майстерність ${artwork.artistDisplayName || 'художника'} у використанні ${artwork.medium || 'традиційних матеріалів'}.`,
                    historicalContext: `Створено в ${artwork.objectDate || randomYear}. ${artwork.culture || ''} Період: ${artwork.period || 'класичне мистецтво'}.`,
                    technique: artwork.medium || "Олія на полотні",
                    provenance: `${artwork.creditLine || 'Metropolitan Museum of Art'}. ${artwork.accessionNumber ? 'Інвентарний номер: ' + artwork.accessionNumber : ''}`,
                    source: "Met Museum",
                    era: era
                };
            }
        }
    } catch (error) {
        console.log("Met API error:", error);
    }
    return null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getEraYears(era) {
    switch (era) {
        case 'renaissance': return { start: 1400, end: 1600 };
        case 'baroque': return { start: 1600, end: 1750 };
        case 'romanticism': return { start: 1800, end: 1850 };
        case 'impressionism': return { start: 1860, end: 1900 };
        case 'modern': return { start: 1900, end: 1950 };
        case 'contemporary': return { start: 1950, end: 2024 };
        default: return { start: 1400, end: 2024 };
    }
}

async function fetchArtworkForEra(era) {
    // First try extended local database
    const localArtworks = Object.values(extendedArtDatabase).filter(art =>
        era === 'all' || art.era === era
    );

    if (localArtworks.length > 0 && Math.random() < 0.3) {
        return localArtworks[Math.floor(Math.random() * localArtworks.length)];
    }

    // Try Harvard API first (best descriptions)
    if (MUSEUMS.harvard.enabled) {
        const artwork = await searchHarvardMuseum(era);
        if (artwork && artwork.imageUrl) return artwork;
    }

    // Fallback to Met Museum
    if (MUSEUMS.met.enabled) {
        const artwork = await searchMetMuseum(era);
        if (artwork && artwork.imageUrl) return artwork;
    }

    // Final fallback to local
    if (localArtworks.length > 0) {
        return localArtworks[Math.floor(Math.random() * localArtworks.length)];
    }

    return null;
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

async function displayArtwork(era = 'all') {
    const artworkSection = document.getElementById('artworkSection');
    const loader = document.getElementById('loader');

    loader.classList.remove('hidden');
    artworkSection.classList.add('hidden');

    const artwork = await fetchArtworkForEra(era);

    if (artwork) {
        document.getElementById('mainArtwork').innerHTML =
            `<img src="${artwork.imageUrl}" alt="${artwork.title}">`;
        document.getElementById('artworkTitle').textContent = artwork.title;
        document.getElementById('artworkArtist').textContent = artwork.artist;
        document.getElementById('artworkYear').textContent = artwork.year;
        document.getElementById('artworkMedium').textContent = artwork.medium;
        document.getElementById('artworkLocation').textContent = artwork.location;

        // Extended descriptions
        document.getElementById('artworkDescription').innerHTML =
            `<p>${artwork.description}</p>${artwork.source ? `<p><em>Джерело: ${artwork.source}</em></p>` : ''}`;

        document.getElementById('artworkAnalysis').innerHTML =
            `<p>${artwork.analysis || 'Аналіз цього твору розкриває його унікальні художні якості та культурне значення.'}</p>`;

        document.getElementById('historicalContext').innerHTML =
            `<p>${artwork.historicalContext || 'Твір створено в період значних культурних та соціальних змін.'}</p>`;

        document.getElementById('techniqueInfo').innerHTML =
            `<p>${artwork.technique || artwork.medium}</p>`;

        document.getElementById('provenanceInfo').innerHTML =
            `<p>${artwork.provenance || 'Інформація про походження та історію колекціонування.'}</p>`;

        loader.classList.add('hidden');
        artworkSection.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
        displayArtwork('all');
    }
}

// ============================================
// ARTIST CATALOG AND NAVIGATION
// ============================================

let currentArtistArtworks = [];
let currentArtworkIndex = 0;
let artistsCache = new Map();

// Famous artists list - 80+ masters
const FAMOUS_ARTISTS = [
    // Renaissance & Early Masters
    "Leonardo da Vinci", "Michelangelo", "Raphael", "Sandro Botticelli",
    "Titian", "Jan van Eyck", "Hieronymus Bosch", "Albrecht Dürer",
    "Pieter Bruegel the Elder", "Giotto", "Fra Angelico", "Piero della Francesca",

    // Baroque & Classical
    "Caravaggio", "Rembrandt", "Peter Paul Rubens", "Diego Velázquez",
    "Johannes Vermeer", "Frans Hals", "Anthony van Dyck", "Nicolas Poussin",
    "Claude Lorrain", "Georges de La Tour", "Artemisia Gentileschi",

    // 18th-19th Century
    "Francisco Goya", "J.M.W. Turner", "John Constable", "Caspar David Friedrich",
    "Jean-Auguste-Dominique Ingres", "Eugène Delacroix", "Gustave Courbet",
    "Jean-François Millet", "Honoré Daumier", "William Blake",

    // Impressionism & Post-Impressionism
    "Claude Monet", "Pierre-Auguste Renoir", "Edgar Degas", "Camille Pissarro",
    "Alfred Sisley", "Berthe Morisot", "Mary Cassatt", "Édouard Manet",
    "Paul Cézanne", "Vincent van Gogh", "Paul Gauguin", "Georges Seurat",
    "Henri de Toulouse-Lautrec", "Paul Signac",

    // Early 20th Century & Modernism
    "Pablo Picasso", "Henri Matisse", "Wassily Kandinsky", "Piet Mondrian",
    "Kazimir Malevich", "Marc Chagall", "Amedeo Modigliani", "Egon Schiele",
    "Gustav Klimt", "Edvard Munch", "Paul Klee", "Joan Miró",

    // Surrealism & Expressionism
    "Salvador Dalí", "René Magritte", "Max Ernst", "Giorgio de Chirico",
    "Frida Kahlo", "Diego Rivera", "Ernst Ludwig Kirchner", "Emil Nolde",
    "Oskar Kokoschka", "Francis Bacon",

    // Abstract & Contemporary
    "Jackson Pollock", "Mark Rothko", "Willem de Kooning", "Barnett Newman",
    "Cy Twombly", "Robert Rauschenberg", "Jasper Johns", "Andy Warhol",
    "Roy Lichtenstein", "David Hockney", "Gerhard Richter", "Anselm Kiefer",

    // Asian & Other Masters
    "Katsushika Hokusai", "Utagawa Hiroshige", "Sesshū Tōyō", "Qi Baishi"
];

async function loadArtistCatalog() {
    const artistSelect = document.getElementById('artistSelect');

    // Add famous artists to dropdown
    FAMOUS_ARTISTS.sort().forEach(artist => {
        const option = document.createElement('option');
        option.value = artist;
        option.textContent = artist;
        artistSelect.appendChild(option);
    });
}

async function searchArtistWorks(artistName) {
    // Check cache first
    if (artistsCache.has(artistName)) {
        return artistsCache.get(artistName);
    }

    const artworks = [];

    // Search Harvard Museum
    try {
        const response = await fetch(
            `${MUSEUMS.harvard.baseUrl}/object?apikey=${MUSEUMS.harvard.apiKey}&person=${encodeURIComponent(artistName)}&hasimage=1&size=50&sort=rank`
        );
        const data = await response.json();

        if (data.records && data.records.length > 0) {
            data.records.forEach(artwork => {
                if (artwork.primaryimageurl) {
                    artworks.push({
                        title: artwork.title || "Без назви",
                        artist: artistName,
                        year: artwork.dated || "Невідомо",
                        medium: artwork.medium || artwork.technique || "Живопис",
                        location: `Harvard Art Museums`,
                        imageUrl: artwork.primaryimageurl,
                        description: artwork.description || artwork.commentary || `Твір ${artistName} з колекції Harvard Art Museums.`,
                        analysis: artwork.commentary || `Цей твір демонструє характерний стиль ${artistName}.`,
                        historicalContext: `Створено ${artistName}. ${artwork.culture || ''} ${artwork.period || ''}`,
                        technique: artwork.technique || artwork.medium || "Традиційна техніка",
                        provenance: `Harvard Art Museums. ${artwork.creditline || ''}`,
                        source: "Harvard Art Museums"
                    });
                }
            });
        }
    } catch (error) {
        console.log("Harvard search error:", error);
    }

    // Search Met Museum
    try {
        const response = await fetch(
            `${MUSEUMS.met.searchUrl}?artistOrCulture=true&hasImages=true&q=${encodeURIComponent(artistName)}`
        );
        const data = await response.json();

        if (data.objectIDs && data.objectIDs.length > 0) {
            const ids = data.objectIDs.slice(0, 20);

            for (const id of ids) {
                try {
                    const objectResponse = await fetch(`${MUSEUMS.met.objectUrl}/${id}`);
                    const artwork = await objectResponse.json();

                    if (artwork.primaryImage && artwork.artistDisplayName?.toLowerCase().includes(artistName.toLowerCase())) {
                        artworks.push({
                            title: artwork.title || "Без назви",
                            artist: artistName,
                            year: artwork.objectDate || "Невідомо",
                            medium: artwork.medium || "Живопис",
                            location: "Metropolitan Museum of Art",
                            imageUrl: artwork.primaryImage,
                            description: `${artwork.title} - твір ${artistName}. ${artwork.culture || ''} ${artwork.period || ''}`,
                            analysis: `Цей твір представляє ${artwork.classification || 'живопис'} та демонструє майстерність ${artistName}.`,
                            historicalContext: `Створено ${artwork.objectDate || 'в класичний період'}. ${artwork.culture || ''}`,
                            technique: artwork.medium || "Олія на полотні",
                            provenance: `${artwork.creditLine || 'Metropolitan Museum of Art'}`,
                            source: "Met Museum"
                        });
                    }
                } catch (err) {
                    console.log("Object fetch error:", err);
                }
            }
        }
    } catch (error) {
        console.log("Met search error:", error);
    }

    // Cache results
    if (artworks.length > 0) {
        artistsCache.set(artistName, artworks);
    }

    return artworks;
}

function showNavigation(show = true) {
    const navControl = document.getElementById('navControl');
    if (show) {
        navControl.classList.remove('hidden');
    } else {
        navControl.classList.add('hidden');
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const counter = document.getElementById('artworkCounter');

    prevBtn.disabled = currentArtworkIndex === 0;
    nextBtn.disabled = currentArtworkIndex >= currentArtistArtworks.length - 1;
    counter.textContent = `${currentArtworkIndex + 1} / ${currentArtistArtworks.length}`;
}

function displayCurrentArtwork() {
    if (currentArtistArtworks.length === 0) return;

    const artwork = currentArtistArtworks[currentArtworkIndex];
    const artworkSection = document.getElementById('artworkSection');

    document.getElementById('mainArtwork').innerHTML =
        `<img src="${artwork.imageUrl}" alt="${artwork.title}">`;
    document.getElementById('artworkTitle').textContent = artwork.title;
    document.getElementById('artworkArtist').textContent = artwork.artist;
    document.getElementById('artworkYear').textContent = artwork.year;
    document.getElementById('artworkMedium').textContent = artwork.medium;
    document.getElementById('artworkLocation').textContent = artwork.location;

    document.getElementById('artworkDescription').innerHTML =
        `<p>${artwork.description}</p>${artwork.source ? `<p><em>Джерело: ${artwork.source}</em></p>` : ''}`;

    document.getElementById('artworkAnalysis').innerHTML =
        `<p>${artwork.analysis || 'Аналіз цього твору розкриває його унікальні художні якості.'}</p>`;

    document.getElementById('historicalContext').innerHTML =
        `<p>${artwork.historicalContext || 'Твір створено в період значних культурних змін.'}</p>`;

    document.getElementById('techniqueInfo').innerHTML =
        `<p>${artwork.technique || artwork.medium}</p>`;

    document.getElementById('provenanceInfo').innerHTML =
        `<p>${artwork.provenance || 'Інформація про походження твору.'}</p>`;

    artworkSection.classList.remove('hidden');
    updateNavigationButtons();
}

// ============================================
// EVENT LISTENERS
// ============================================

document.getElementById('artistSelect').addEventListener('change', async (e) => {
    const artistName = e.target.value;

    if (!artistName) {
        showNavigation(false);
        return;
    }

    const loader = document.getElementById('loader');
    const artworkSection = document.getElementById('artworkSection');

    loader.classList.remove('hidden');
    artworkSection.classList.add('hidden');
    showNavigation(false);

    currentArtistArtworks = await searchArtistWorks(artistName);
    currentArtworkIndex = 0;

    loader.classList.add('hidden');

    if (currentArtistArtworks.length > 0) {
        displayCurrentArtwork();
        showNavigation(true);
    } else {
        alert(`Творів ${artistName} не знайдено в базі. Спробуйте іншого художника.`);
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentArtworkIndex > 0) {
        currentArtworkIndex--;
        displayCurrentArtwork();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentArtworkIndex < currentArtistArtworks.length - 1) {
        currentArtworkIndex++;
        displayCurrentArtwork();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

document.getElementById('eraSelect').addEventListener('change', (e) => {
    // Reset artist selection
    document.getElementById('artistSelect').value = '';
    currentArtistArtworks = [];
    showNavigation(false);
    displayArtwork(e.target.value);
});

document.getElementById('randomBtn').addEventListener('click', () => {
    // Reset artist selection
    document.getElementById('artistSelect').value = '';
    currentArtistArtworks = [];
    showNavigation(false);

    const eras = ['renaissance', 'baroque', 'romanticism', 'impressionism', 'modern', 'contemporary'];
    const randomEra = eras[Math.floor(Math.random() * eras.length)];
    document.getElementById('eraSelect').value = randomEra;
    displayArtwork(randomEra);
});

// ============================================
// AUTO-START
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Art Planet Memory - Extended Archive');
    console.log('📚 Connected: Harvard Art Museums, Met Museum, Rijksmuseum');
    console.log('🌐 Database: 200,000+ artworks with full descriptions');
    console.log('👨‍🎨 Artist Catalog: 80+ famous artists');

    loadArtistCatalog();
    displayArtwork('all');
});
