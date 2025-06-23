// Background animation logic extracted from scripts.js

// Create enhanced twinkling stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    const config = NYMPH_CONFIG.ANIMATIONS.STARS;

    for (let i = 0; i < config.COUNT; i++) {
        const star = document.createElement('div');

        const rand = Math.random();
        if (rand < config.SIZES.SMALL_CHANCE) {
            star.className = 'star small';
        } else if (rand < config.SIZES.MEDIUM_CHANCE) {
            star.className = 'star medium';
        } else {
            star.className = 'star large';
        }

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * config.TWINKLE.MAX_DELAY + 's';
        star.style.animationDuration = (config.TWINKLE.MIN_DURATION + Math.random() * (config.TWINKLE.MAX_DURATION - config.TWINKLE.MIN_DURATION)) / 1000 + 's';
        starsContainer.appendChild(star);
    }
}

// Create distant galaxies
function createGalaxies() {
    const galaxiesContainer = document.getElementById('galaxies');
    const config = NYMPH_CONFIG.ANIMATIONS.GALAXIES;

    for (let i = 0; i < config.COUNT; i++) {
        const galaxy = document.createElement('div');
        const type = config.TYPES[Math.floor(Math.random() * config.TYPES.length)];
        galaxy.className = `galaxy ${type}`;

        const size = config.SIZE.MIN + Math.random() * (config.SIZE.MAX - config.SIZE.MIN);
        const heightFactor = config.SIZE.HEIGHT_FACTOR.MIN + Math.random() * (config.SIZE.HEIGHT_FACTOR.MAX - config.SIZE.HEIGHT_FACTOR.MIN);
        galaxy.style.width = size + 'px';
        galaxy.style.height = size * heightFactor + 'px';

        galaxy.style.left = Math.random() * 100 + '%';
        galaxy.style.top = Math.random() * 100 + '%';
        galaxy.style.animationDelay = Math.random() * config.PULSE_DELAY_MAX + 's';
        galaxiesContainer.appendChild(galaxy);
    }
}

// Create falling meteors
function createMeteor() {
    const meteorsContainer = document.getElementById('meteors');
    const config = NYMPH_CONFIG.ANIMATIONS.METEORS;
    const meteor = document.createElement('div');
    meteor.className = 'meteor';

    meteor.style.left = (100 + Math.random() * 10) + '%';
    meteor.style.top = (Math.random() * 50 - 10) + '%';

    const duration = config.DURATION_MIN + Math.random() * (config.DURATION_MAX - config.DURATION_MIN);
    meteor.style.animation = `meteorFall ${duration / 1000}s linear`;

    meteorsContainer.appendChild(meteor);

    setTimeout(() => {
        if (meteor.parentNode) {
            meteor.parentNode.removeChild(meteor);
        }
    }, config.CLEANUP_DELAY);
}

function startMeteorShower() {
    const config = NYMPH_CONFIG.ANIMATIONS.METEORS;
    setInterval(() => {
        if (Math.random() < config.SPAWN_CHANCE) {
            createMeteor();
        }
    }, config.INTERVAL);
}

function randomizePlanets() {
    for (let i = 1; i <= 5; i++) {
        const orbit = document.getElementById(`orbit-${i}`);
        if (orbit) {
            const randomRotation = Math.random() * 360;
            orbit.style.transform = `translate(-50%, -50%) rotate(${randomRotation}deg)`;
        }
    }
}

export function initBackground() {
    createGalaxies();
    createStars();
    startMeteorShower();
    randomizePlanets();
}
