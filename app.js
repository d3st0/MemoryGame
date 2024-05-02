const pokeAPIBaseUrl = "https://pokeapi.co/api/v2/pokemon/";
const dreamWorldBaseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/";
const game = document.getElementById('game');
const timerElement = document.getElementById('timer'); // Időmérő elem
let isPaused = false;
let firstPick;
let matches;
let timerInterval; // Időmérő intervallum
let startTime; // Mérés kezdési időpontja
let isTimerRunning = false; // Változó az időmérő állapotának nyomon követésére
const colors = {
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FD',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5'
};

const loadPokemon = async () => {
    const randomIds = new Set();
    while (randomIds.size < 8) {
        const randomNumber = Math.ceil(Math.random() * 150);
        randomIds.add(randomNumber);
    }
    const pokePromises = [...randomIds].map((id) => fetch(pokeAPIBaseUrl + id));
    const responses = await Promise.all(pokePromises);
    return await Promise.all(responses.map((res) => res.json()));
}

const displayPokemon = (pokemon) => {
    pokemon.sort(_ => Math.random() - 0.5);
    const pokemonHTML = pokemon.map(pokemon => {
        const type = pokemon.types[0]?.type?.name || 'normal';
        const color = colors[type];
        const dreamWorldImage = dreamWorldBaseUrl + pokemon.id + ".svg";
        return `
    <div class="card" style="background-color:${color}" onclick="clickCard(event)"
                data-pokename="${pokemon.name}">
                <div class="front">
                </div>
                <div class="back rotated" style="background-color:${color}">
                    <span>${pokemon.name}</span>
                    <img src="${dreamWorldImage}" alt="${pokemon.name}"/>
                </div>
            </div>
    `
    }).join('');
    game.innerHTML = pokemonHTML;
}

const clickCard = (event) => {
    const pokemonCard = event.currentTarget;
    const [front, back] = getFrontAndBackFromCard(pokemonCard);
    if (front.classList.contains("rotated") || isPaused) return;
    isPaused = true;

    rotateElements([front, back])
    if (!firstPick) {
        firstPick = pokemonCard;
        isPaused = false;
        if (!isTimerRunning) { // Az időmérő csak akkor indul el, ha még nem fut
            startTimer();
            isTimerRunning = true;
        }
    } else {
        const secondPokemonName = pokemonCard.dataset.pokename;
        const firstPokemonName = firstPick.dataset.pokename;
        if (firstPokemonName != secondPokemonName) {
            const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
            setTimeout(() => {
                rotateElements([front, back, firstFront, firstBack]);
                firstPick = null;
                isPaused = false;
            }, 500);
        } else {
            matches++;
            if (matches === 8) {
                stopTimer(); // Időmérő leállítása, ha minden kártyának megvan a párja
                setTimeout(() => {
                    alert('Gratulálok! :)'); // Ha minden párnak megtalálták a párját, akkor "Sikerült!" alert
                    window.location.href = 'index.html'; // A kívánt URL-re cseréld
                }, 1000);
            }
            firstPick = 0;
            isPaused = false;
        }
    }
}

const startTimer = () => {
    startTime = Date.now(); // Az időmérés kezdési időpontjának beállítása
    timerInterval = setInterval(updateTimer, 1000); // Az időmérő indítása, frissítés minden másodpercben
}

const stopTimer = () => {
    clearInterval(timerInterval); // Az időmérő leállítása
    isTimerRunning = false; // Az időmérő állapotának frissítése: leállt
}

const updateTimer = () => {
    const currentTime = Date.now(); // Az aktuális időpont lekérése
    const elapsedTime = Math.floor((currentTime - startTime) / 1000); // Az eltelt idő kiszámítása másodpercekben

    const hours = Math.floor(elapsedTime / 3600); // Órák számítása
    const minutes = Math.floor((elapsedTime % 3600) / 60); // Percek számítása
    const seconds = elapsedTime % 60; // Másodpercek számítása

    const formattedTime = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds); // Formázott idő készítése

    timerElement.textContent = formattedTime; // Az időmérő elem frissítése a formázott idővel
}

const pad = (value) => {
    return value < 10 ? '0' + value : value; // Kettőjegyű formátum biztosítása minden időegység számára
}

const rotateElements = (elements) => {
    if (typeof elements != 'object' || !elements.length) return;
    elements.forEach(element => element.classList.toggle('rotated'));
}

const getFrontAndBackFromCard = (card) => {
    const front = card.querySelector(".front");
    const back = card.querySelector(".back");
    return [front, back]
}

const resetGame = () => {
    game.innerHTML = '';
    isPaused = null;
    firstPick = null;
    matches = 0;
    timerElement.textContent = '00:00:00'; // Az időmérő nullázása
    stopTimer(); // Az időmérő leállítása
    setTimeout(async () => {
        const pokemon = await loadPokemon();
        displayPokemon([...pokemon, ...pokemon]);
        isPaused = false;
    }, 200);
}

resetGame();
