// preloader hide on load
window.addEventListener("load", () => {
  const pre = document.getElementById("preloader");
  if (pre) {
    pre.style.opacity = "0";
    setTimeout(() => { if (pre) pre.style.display = "none"; }, 600);
  }
});

// mobile nav
const mobileToggle = document.querySelector(".mobile-toggle");
const mobileSidebar = document.querySelector(".mobile-sidebar");
const mobileLinks = document.querySelectorAll(".mobile-link, .mobile-actions .btn");

function closeMobileMenu() {
  mobileSidebar.classList.remove("open");
}

if (mobileToggle && mobileSidebar) {
  mobileToggle.addEventListener("click", () => mobileSidebar.classList.add("open"));
}

mobileLinks.forEach(link => link.addEventListener("click", closeMobileMenu));

document.addEventListener("click", e => {
  if (
    mobileSidebar.classList.contains("open") &&
    !mobileSidebar.contains(e.target) &&
    !mobileToggle.contains(e.target)
  ) closeMobileMenu();
});

// starfield bg canvas
const starCanvas = document.createElement("canvas");
starCanvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;";
document.body.appendChild(starCanvas);

const ctx = starCanvas.getContext("2d");
let stars = [];

function resizeCanvas() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) stars.push({
    x: Math.random() * starCanvas.width,
    y: Math.random() * starCanvas.height,
    radius: Math.random() * 1.5,
    alpha: Math.random(),
    speed: Math.random() * 0.02 + 0.005
  });
}
createStars(150);

function drawStars() {
  ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  ctx.fillStyle = "#fff";
  stars.forEach(star => {
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    star.alpha += star.speed;
    if (star.alpha >= 1 || star.alpha <= 0) star.speed *= -1;
  });
  requestAnimationFrame(drawStars);
}
drawStars();

// load json data
function loadJSON(url, callback) {
  fetch(url)
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => console.error(`Error loading ${url}:`, err));
}

// features render
function renderFeatures(features) {
  const container = document.getElementById("featuresGrid");
  if (!container) return;
  
  container.innerHTML = features.map(feature => {
    const isGradient = feature.name.includes('<gradient=');
    const hasStaticColor = feature.name.includes('<color=');
    
    let titleStyle = '';
    if (isGradient) {
      const gradientMatch = feature.name.match(/<gradient=([^>]+)>/);
      if (gradientMatch && gradientMatch[1]) {
        const stopglow = feature.stopglow;
        titleStyle = `
          background: linear-gradient(90deg, ${gradientMatch[1]});
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          width: fit-content;
          --glow-color: ${stopglow};
        `;
      }
    } else if (hasStaticColor) {
      const color = feature.name.match(/<color=#([A-F0-9]{6})>/i)[1];
      titleStyle = `color: #${color};`;
    }
    
    const cleanName = feature.name.replace(/<[^>]*>/g, '');
    
    return `
      <div class="card">
        <h3 style="${titleStyle}">${cleanName}</h3>
        <p>${feature.description}</p>
      </div>
    `;
  }).join('');
}

// ranks render
function renderRanks(ranks) {
  const container = document.getElementById("ranksGrid");
  if (!container) return;
  
  container.innerHTML = ranks.map(rank => {
    const isGradient = rank.name.includes('<gradient=');
    const hasStaticColor = rank.name.includes('<color=');
    
    let titleStyle = '';
    if (isGradient) {
      const gradientMatch = rank.name.match(/<gradient=([^>]+)>/);
      if (gradientMatch && gradientMatch[1]) {
        const stopglow = rank.stopglow;
        titleStyle = `
          background: linear-gradient(90deg, ${gradientMatch[1]});
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          width: fit-content;
          --glow-color: ${stopglow};
        `;
      }
    } else if (hasStaticColor) {
      const color = rank.name.match(/<color=#([A-F0-9]{6})>/i)[1];
      titleStyle = `
        color: #${color};
        background: none !important;
        -webkit-text-fill-color: initial !important;
      `;
    }
    
    let priceStyle = '';
    let priceText = rank.price;
    if (rank.price.includes('<color=')) {
      const priceColor = rank.price.match(/<color=#([A-F0-9]{6})>/i)[1];
      priceStyle = `color: #${priceColor} !important;`;
      priceText = rank.price.replace(/<[^>]*>/g, '');
    }
    
    const featuresList = rank.features.map(f => `<li>${f}</li>`).join('');
    
    return `
      <div class="card">
        <h3 style="${titleStyle}">${rank.name.replace(/<[^>]*>/g, '')}</h3>
        <div class="rank-price" style="${priceStyle}">${priceText}</div>
        <div class="rank-features"><ul>${featuresList}</ul></div>
      </div>
    `;
  }).join('');
}

// commands render
let allCommands = [];

function renderCommands(commands) {
  const container = document.getElementById("commandsGrid");
  if (!container) return;
  
  container.innerHTML = commands.map(command => {
    const color = command.name.match(/<color=#([A-F0-9]{6})>/i)[1];
    const nameStyle = `color: #${color};`;
    const cleanName = command.name.replace(/<[^>]*>/g, '');
    
    return `
      <div class="card">
        <h3 style="${nameStyle}">${cleanName}</h3>
        <p><strong>Usage:</strong> <code>${command.usage}</code></p>
        <p><strong>Example:</strong> <code>${command.example}</code></p>
        <p>${command.description}</p>
      </div>
    `;
  }).join('');
}

// filter commands
const searchInput = document.getElementById("commandSearch");
const categoryFilter = document.getElementById("commandCategory");

function filterCommands() {
  if (!searchInput || !categoryFilter) return;
  const sv = searchInput.value.toLowerCase();
  const cv = categoryFilter.value;
  const filtered = allCommands.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(sv) || c.description.toLowerCase().includes(sv);
    const matchCat = cv === "" || c.category === cv;
    return matchSearch && matchCat;
  });
  renderCommands(filtered);
}

if (searchInput) searchInput.addEventListener("input", filterCommands);
if (categoryFilter) categoryFilter.addEventListener("change", filterCommands);

// init load
loadJSON("data/features.json", renderFeatures);
loadJSON("data/ranks.json", renderRanks);
loadJSON("data/commands.json", data => {
  allCommands = data.sort((a, b) => {
    const nameA = a.name.replace(/<[^>]*>/g, "");
    const nameB = b.name.replace(/<[^>]*>/g, "");
    return nameA.localeCompare(nameB);
  });
  renderCommands(allCommands);
  
  if (categoryFilter) {
    let cats = [...new Set(data.map(c => c.category))];
    cats = cats.filter(c => c.toLowerCase() !== "others").sort((a, b) => a.localeCompare(b));
    if (cats.includes("Others") || data.some(c => c.category.toLowerCase() === "others")) {
      cats.push("Others");
    }
    cats.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }
});

// if URL has a #, scroll to that section on load
window.addEventListener("load", function() {
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});