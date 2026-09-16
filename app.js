const STAGES_CONFIG = [
    {
        id: 1,
        title: "שלב 1: קופסאות שימורים",
        instruction: "סדרו את קופסאות השימורים בשורה עם מרווח שווה ביניהן מקצה לקצה.",
        items: ["🥫", "🥫", "🥫"],
        controls: ["justifyContent"],
        solution: { justifyContent: "space-between" },
        defaultValues: { justifyContent: "flex-start" }
    },
    {
        id: 2,
        title: "שלב 2: בקבוקי שתייה",
        instruction: "הבקבוקים מרחפים באוויר! הצמידו את כל הבקבוקים לתחתית המדף.",
        items: ["🍾", "🍾", "🍾"],
        controls: ["alignItems"],
        solution: { alignItems: "flex-end" },
        defaultValues: { alignItems: "flex-start" }
    },
    {
        id: 3,
        title: "שלב 3: קופסאות פופקורן",
        instruction: "סדרו את הפופקורן בטור מלמעלה למטה, ומקדו אותם לרוחב המדף במרכז.",
        items: ["🍿", "🍿", "🍿"],
        controls: ["flexDirection", "alignItems"],
        solution: { flexDirection: "column", alignItems: "center" },
        defaultValues: { flexDirection: "row", alignItems: "flex-start" }
    },
    {
        id: 4,
        title: "שלב 4: צנצנות דבש",
        instruction: "סדרו את הצנצנות בסדר הפוך מימין לשמאל והצמידו אותן לתחתית המדף.",
        items: ["🍯 3", "🍯 2", "🍯 1"],
        controls: ["flexDirection", "alignItems"],
        solution: { flexDirection: "row-reverse", alignItems: "flex-end" },
        defaultValues: { flexDirection: "row", alignItems: "flex-start" }
    },
    {
        id: 5,
        title: "שלב 5: חפיסות שוקולד",
        instruction: "סדרו את השוקולד בטור אנכי, ומקדו אותו במרכז הגובה של המדף.",
        items: ["🍫", "🍫", "🍫"],
        controls: ["flexDirection", "justifyContent"],
        solution: { flexDirection: "column", justifyContent: "center" },
        defaultValues: { flexDirection: "row", justifyContent: "flex-start" }
    },
    {
        id: 6,
        title: "שלב 6: עומס קרטוני מיץ",
        instruction: "משלוח ענקי! איפשרו למוצרים לגלוש לשורות נוספות (wrap) ומקדו אותם במרכז המדף.",
        items: ["🧃", "🧃", "🧃", "🧃", "🧃", "🧃", "🧃", "🧃", "🧃", "🧃"],
        controls: ["flexWrap", "justifyContent", "alignItems"],
        solution: { flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
        defaultValues: { flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-start" }
    }
];

const FLEX_OPTIONS = {
    justifyContent: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
    alignItems: ["flex-start", "flex-end", "center", "stretch", "baseline"],
    flexDirection: ["row", "row-reverse", "column", "column-reverse"],
    flexWrap: ["nowrap", "wrap", "wrap-reverse"]
};

// Game State
let currentLevelIdx = 0;
let totalScore = 0;
let completedLevels = JSON.parse(localStorage.getItem('market_flex_completed')) || [];

let attemptsPerLevel = JSON.parse(localStorage.getItem('market_flex_attempts'));
if (!attemptsPerLevel || attemptsPerLevel.length !== STAGES_CONFIG.length) {
    attemptsPerLevel = Array(STAGES_CONFIG.length).fill(0);
}

function playTone(freq, type, duration) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

const sounds = {
    select: () => playTone(450, 'sine', 0.05),
    success: () => {
        playTone(523.25, 'triangle', 0.15);
        setTimeout(() => playTone(659.25, 'triangle', 0.25), 100);
    },
    fail: () => playTone(180, 'sawtooth', 0.25)
};

document.addEventListener("DOMContentLoaded", () => {
    restoreScore();
    buildNavigationDots();
    
    let startLevel = 0;
    while(completedLevels.includes(startLevel) && startLevel < STAGES_CONFIG.length - 1) {
        startLevel++;
    }
    
    mountLevel(startLevel);
});

function mountLevel(index) {
    currentLevelIdx = index;
    const level = STAGES_CONFIG[index];

    document.getElementById("stage-title").innerText = level.title;
    document.getElementById("stage-instruction").innerText = level.instruction;
    document.getElementById("stage-counter").innerText = `שלב ${index + 1}/${STAGES_CONFIG.length}`;
    document.getElementById("attempts-count").innerText = attemptsPerLevel[index];

    const controlsBox = document.getElementById("dynamic-controls");
    controlsBox.innerHTML = "";

    level.controls.forEach(property => {
        const row = document.createElement("div");
        row.className = "rule-row";

        const label = document.createElement("label");
        label.innerText = property + ":";

        const select = document.createElement("select");
        select.id = `select-${property}`;

        FLEX_OPTIONS[property].forEach(val => {
            const opt = document.createElement("option");
            opt.value = val;
            opt.innerText = `${val};`;
            if (val === level.defaultValues[property]) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener("change", () => {
            sounds.select();
            updateBoardStyles();
        });

        row.appendChild(label);
        row.appendChild(select);
        controlsBox.appendChild(row);
    });

    renderItems(level.items);
    updateBoardStyles();
    syncNavUI();
}

function renderItems(items) {
    const board = document.getElementById("pond");
    board.innerHTML = "";
    items.forEach(icon => {
        const div = document.createElement("div");
        div.className = "shelf-item";
        div.innerText = icon;
        board.appendChild(div);
    });
}

function updateBoardStyles() {
    const board = document.getElementById("pond");
    const level = STAGES_CONFIG[currentLevelIdx];

    board.style.display = "flex";
    board.style.flexDirection = "row";
    board.style.justifyContent = "flex-start";
    board.style.alignItems = "stretch";
    board.style.flexWrap = "nowrap";

    level.controls.forEach(prop => {
        const el = document.getElementById(`select-${prop}`);
        if (el) board.style[prop] = el.value;
    });
}

function checkSolution() {
    attemptsPerLevel[currentLevelIdx]++;
    document.getElementById("attempts-count").innerText = attemptsPerLevel[currentLevelIdx];
    localStorage.setItem('market_flex_attempts', JSON.stringify(attemptsPerLevel));

    const level = STAGES_CONFIG[currentLevelIdx];
    const isSolved = level.controls.every(prop => {
        return document.getElementById(`select-${prop}`).value === level.solution[prop];
    });

    const board = document.getElementById("pond");

    if (isSolved) {
        sounds.success();
        board.classList.add("success-glow");
        setTimeout(() => board.classList.remove("success-glow"), 1000);

        const isFirstTime = !completedLevels.includes(currentLevelIdx);
        let earnedPoints = 0;

        if (isFirstTime) {
            earnedPoints = Math.max(100 - (attemptsPerLevel[currentLevelIdx] - 1) * 15, 40);
            totalScore += earnedPoints;
            document.getElementById("score-display").innerText = totalScore;

            completedLevels.push(currentLevelIdx);
            localStorage.setItem('market_flex_completed', JSON.stringify(completedLevels));
            localStorage.setItem('market_flex_score', totalScore);
            syncNavUI();
        }

        setTimeout(() => {
            if (isFirstTime) {
                alert(`כל הכבוד! הסידור מושלם!\nצברת ${earnedPoints} נקודות.`);
            } else {
                alert(`כל הכבוד! הסידור מושלם!\n(כבר צברת ניקוד על שלב זה בעבר)`);
            }
            
            if (currentLevelIdx + 1 < STAGES_CONFIG.length) {
                mountLevel(currentLevelIdx + 1);
            } else if (completedLevels.length === STAGES_CONFIG.length) {
                alert("סיימת את כל השלבים בהצטיינות!");
            }
        }, 150);

    } else {
        sounds.fail();
        board.classList.add("shake");
        setTimeout(() => board.classList.remove("shake"), 350);
    }
}

function resetCurrentStage() {
    const level = STAGES_CONFIG[currentLevelIdx];
    
    // איפוס הערכים בפקדי ה-Select בלבד לערכי ברירת המחדל
    level.controls.forEach(prop => {
        const select = document.getElementById(`select-${prop}`);
        if (select) select.value = level.defaultValues[prop];
    });
    
    // עדכון תצוגת הלוח בהתאם
    updateBoardStyles();
}

function restartGame() {
    if(confirm("האם אתה בטוח שברצונך לאפס את כל המשחק ואת הניקוד?")) {
        localStorage.removeItem('market_flex_completed');
        localStorage.removeItem('market_flex_score');
        localStorage.removeItem('market_flex_attempts');
        completedLevels = [];
        totalScore = 0;
        attemptsPerLevel = Array(STAGES_CONFIG.length).fill(0);
        document.getElementById("score-display").innerText = totalScore;
        buildNavigationDots();
        mountLevel(0);
    }
}

function restoreScore() {
    const saved = localStorage.getItem('market_flex_score');
    if (saved) {
        totalScore = parseInt(saved, 10);
        document.getElementById("score-display").innerText = totalScore;
    }
}

function buildNavigationDots() {
    const nav = document.getElementById("stage-nav");
    nav.innerHTML = "";
    STAGES_CONFIG.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.className = "stage-btn";
        btn.innerText = idx + 1;
        btn.onclick = () => {
            if (completedLevels.includes(idx) || idx <= completedLevels.length) {
                mountLevel(idx);
            } else {
                alert("יש להשלים את השלבים הקודמים תחילה!");
            }
        };
        nav.appendChild(btn);
    });
}

function syncNavUI() {
    const btns = document.querySelectorAll(".stage-btn");
    btns.forEach((btn, idx) => {
        btn.classList.remove("active", "completed");
        if (idx === currentLevelIdx) btn.classList.add("active");
        if (completedLevels.includes(idx)) btn.classList.add("completed");
    });
}
