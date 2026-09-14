// Define 6 game levels according to project requirements
const gameLevels = [
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
        title: "שלב 3:  קופסאות פופקורן",
        instruction: "סדרו את קופסאות הפופקורן בטור מלמעלה למטה, ומקדו אותם לרוחב המדף במרכז.",
        items: ["🍿", "🍿", "🍿"],
        controls: ["flexDirection", "alignItems"],
        solution: { flexDirection: "column", alignItems: "center" },
        defaultValues: { flexDirection: "row", alignItems: "flex-start" }
    },
    {
        id: 4,
        title: "שלב 4: צנצנות דבש",
        instruction: "סדרו את הצנצנות מימין לשמאל בסדר הפוך והצמידו אותן לתחתית המדף.",
        items: ["🍯3", "🍯2", "🍯1"],
        controls: ["flexDirection", "alignItems"],
        solution: { flexDirection: "row-reverse", alignItems: "flex-end" },
        defaultValues: { flexDirection: "row", alignItems: "flex-start" }
    },
    {
        id: 5,
        title: "שלב 5: חפיסות שוקולד",
        instruction: "סדרו את חפיסות השוקולד בטור אנכי, ומקדו אותן במרכז הגובה של המדף.",
        items: ["🍫", "🍫", "🍫"],
        controls: ["flexDirection", "justifyContent"],
        solution: { flexDirection: "column", justifyContent: "center" },
        defaultValues: { flexDirection: "row", justifyContent: "flex-start" }
    },
    {
        id: 6,
        title: "שלב 6: עומס קרטוני מיץ",
        instruction: "הגיע משלוח גדול! אפשרו למוצרים לגלוש לשורות נוספות (wrap) ומקדו אותם במרכז המדף לרוחבו ולאורכו.",
        items: ["🧃", "🧃", "🧃", "🧃", "🧃", "🧃", "🧃", "🧃", "🧃", "🧃"],
        controls: ["flexWrap", "justifyContent", "alignItems"],
        solution: { flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
        defaultValues: { flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-start" }
    }
];

// Options for each Select dropdown
const selectOptions = {
    justifyContent: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
    alignItems: ["flex-start", "flex-end", "center", "stretch", "baseline"],
    flexDirection: ["row", "row-reverse", "column", "column-reverse"],
    flexWrap: ["nowrap", "wrap", "wrap-reverse"]
};

// State variables
let currentStageIndex = 0;
let attempts = 0;
let score = 0;
let completedStages = JSON.parse(localStorage.getItem('grocery_completed')) || [];

// Initialize game
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    renderStageNav();
    loadStage(currentStageIndex);
});

// Load stage
function loadStage(index) {
    currentStageIndex = index;
    attempts = 0;
    const stage = gameLevels[index];

    document.getElementById("stage-title").innerText = stage.title;
    document.getElementById("stage-instruction").innerText = stage.instruction;
    document.getElementById("stage-counter").innerText = `שלב ${index + 1} מתוך ${gameLevels.length}`;
    document.getElementById("attempts-count").innerText = attempts;

    // Build select controls
    const controlsContainer = document.getElementById("dynamic-controls");
    controlsContainer.innerHTML = "";

    stage.controls.forEach(prop => {
        const group = document.createElement("div");
        group.className = "control-group";

        const label = document.createElement("label");
        label.innerText = prop + ":";

        const select = document.createElement("select");
        select.id = `select-${prop}`;
        select.dataset.property = prop;

        selectOptions[prop].forEach(val => {
            const opt = document.createElement("option");
            opt.value = val;
            opt.innerText = val + ";"; // Appends semicolon visually
            if (val === stage.defaultValues[prop]) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener("change", applyStylesToBoard);
        group.appendChild(label);
        group.appendChild(select);
        controlsContainer.appendChild(group);
    });

    renderBoardItems(stage.items);
    applyStylesToBoard();
    updateStageNavUI();
}

// Create shelf items
function renderBoardItems(items) {
    const shelf = document.getElementById("shelf-board");
    shelf.innerHTML = "";
    items.forEach(text => {
        const item = document.createElement("div");
        item.className = "shelf-item";
        item.innerText = text;
        shelf.appendChild(item);
    });
}

// Apply selected CSS properties + reset defaults to prevent style leaks between stages
function applyStylesToBoard() {
    const shelf = document.getElementById("shelf-board");
    const stage = gameLevels[currentStageIndex];

    // Explicitly reset all Flexbox properties to CSS default values
    shelf.style.display = "flex";
    shelf.style.flexDirection = "row";
    shelf.style.justifyContent = "flex-start";
    shelf.style.alignItems = "stretch";
    shelf.style.flexWrap = "nowrap";

    // Apply current user selections
    stage.controls.forEach(prop => {
        const select = document.getElementById(`select-${prop}`);
        if (select) {
            shelf.style[prop] = select.value;
        }
    });
}

// Solution verification
function checkSolution() {
    attempts++;
    document.getElementById("attempts-count").innerText = attempts;

    const stage = gameLevels[currentStageIndex];
    let isCorrect = true;

    stage.controls.forEach(prop => {
        const val = document.getElementById(`select-${prop}`).value;
        if (val !== stage.solution[prop]) {
            isCorrect = false;
        }
    });

    const shelf = document.getElementById("shelf-board");

    if (isCorrect) {
        shelf.classList.add("success-glow");
        setTimeout(() => shelf.classList.remove("success-glow"), 1000);

        const stageScore = Math.max(100 - (attempts - 1) * 15, 40);
        score += stageScore;
        document.getElementById("score-display").innerText = score;

        if (!completedStages.includes(currentStageIndex)) {
            completedStages.push(currentStageIndex);
            localStorage.setItem('grocery_completed', JSON.stringify(completedStages));
            localStorage.setItem('grocery_score', score);
        }

        alert(`כל הכבוד! סדרת את המדף בהצלחה! 🎉\nצברת ${stageScore} נקודות.`);

        if (currentStageIndex + 1 < gameLevels.length) {
            currentStageIndex++;
            loadStage(currentStageIndex);
        } else {
            alert("🏆 ברכות! סיימת את כל השלבים בהצלחה והפכת לסדרן מצטיין!");
        }
    } else {
        shelf.classList.add("shake");
        setTimeout(() => shelf.classList.remove("shake"), 400);
        alert("הסידור אינו נכון עדיין. נסו לשנות את הערכים ולנסות שוב! ❌");
    }
}

// Reset stage to default values
function resetCurrentStage() {
    const stage = gameLevels[currentStageIndex];
    stage.controls.forEach(prop => {
        const select = document.getElementById(`select-${prop}`);
        if (select) {
            select.value = stage.defaultValues[prop];
        }
    });
    applyStylesToBoard();
}

// Load saved progress
function loadProgress() {
    const savedScore = localStorage.getItem('grocery_score');
    if (savedScore) {
        score = parseInt(savedScore, 10);
        document.getElementById("score-display").innerText = score;
    }
}

// Stage navigation
function renderStageNav() {
    const nav = document.getElementById("stage-nav");
    nav.innerHTML = "";
    gameLevels.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.className = "stage-btn";
        btn.innerText = idx + 1;
        btn.onclick = () => {
            if (completedStages.includes(idx) || idx <= completedStages.length) {
                loadStage(idx);
            } else {
                alert("יש להשלים את השלבים הקודמים תחילה!");
            }
        };
        nav.appendChild(btn);
    });
}

function updateStageNavUI() {
    const buttons = document.querySelectorAll(".stage-btn");
    buttons.forEach((btn, idx) => {
        btn.classList.remove("active", "completed");
        if (idx === currentStageIndex) btn.classList.add("active");
        if (completedStages.includes(idx)) btn.classList.add("completed");
    });
}
