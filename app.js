// Puvi OS - macOS & iOS Simulator Portfolio Logic Engine

// Global State
let activeWindows = [];
let dragObj = null;
let dragX = 0, dragY = 0;
let isIphoneLocked = true;
let isIphonePowered = true;
let currentActiveIphoneApp = null;
let projectsData = []; // Combined GitHub + Local projects
let activeIphoneWallpaper = 'wp1';
let swiftVariables = {}; // For simulated Swift REPL
let isSwiftReplActive = false;

// Wallpaper URLs — must match exactly with wallpaper-preview thumbnails in index.html
const wallpapers = {
  wp1: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  wp2: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop',
  wp3: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Start Clocks
  startClocks();
  
  // Initialize Terminal date
  const loginDate = document.getElementById('terminal-login-time');
  if (loginDate) loginDate.textContent = new Date().toString().slice(0, 24);
  
  // Set up Terminal Event Listener
  const termInput = document.getElementById('terminal-input');
  if (termInput) {
    termInput.addEventListener('keydown', handleTerminalKeydown);
  }
  
  // Initialize Antigravity Canvas
  initAntigravityCanvas();
  
  // Initialize Projects
  initProjects();
  
  // Window click front behavior
  document.querySelectorAll('.mac-window').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win.id));
  });
  
  // Add global mouse up for dragging
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('mousemove', dragMove);
  
  // Initialize antigravity hover tilt effects
  initTiltHoverEffect();
});

// ----------------------------------------------------
// TIME & DATE MANAGEMENT
// ----------------------------------------------------
function startClocks() {
  const updateTime = () => {
    const now = new Date();
    
    // Top bar clock format: Sun Jul 5 1:57 PM
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    const timeStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${hours}:${minutes} ${ampm}`;
    const topClock = document.getElementById('top-bar-clock');
    if (topClock) topClock.textContent = timeStr;
    
    // iPhone clock format: 13:57 or 01:57
    const iphoneHours = String(now.getHours()).padStart(2, '0');
    const iphoneMinutes = String(now.getMinutes()).padStart(2, '0');
    const iphoneTimeStr = `${iphoneHours}:${iphoneMinutes}`;
    
    const iphoneClock = document.getElementById('iphone-time');
    const iphoneLockClock = document.getElementById('lock-time');
    
    if (iphoneClock) iphoneClock.textContent = iphoneTimeStr;
    if (iphoneLockClock) iphoneLockClock.textContent = iphoneTimeStr;
    
    // iPhone Lock screen Date: Sunday, July 5
    const daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsFull = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
    const lockDateStr = `${daysFull[now.getDay()]}, ${monthsFull[now.getMonth()]} ${now.getDate()}`;
    
    const iphoneLockDate = document.getElementById('lock-date');
    if (iphoneLockDate) iphoneLockDate.textContent = lockDateStr;
  };
  
  updateTime();
  setInterval(updateTime, 1000);
}

// ----------------------------------------------------
// DRAGGABLE WINDOWS (macOS STYLE)
// ----------------------------------------------------
function dragStart(e, id) {
  if (e.target.classList.contains('ctrl-btn')) return; // Ignore window buttons
  const win = document.getElementById(id);
  if (!win) return;
  
  bringToFront(id);
  
  dragObj = win;
  // Get initial offsets
  const rect = win.getBoundingClientRect();
  dragX = e.clientX - rect.left;
  dragY = e.clientY - rect.top;
  
  e.preventDefault();
}

// Drag actions
function dragMove(e) {
  if (!dragObj) return;
  
  const workspace = document.getElementById('desktop-workspace');
  const wsRect = workspace.getBoundingClientRect();
  
  let newLeft = e.clientX - wsRect.left - dragX;
  let newTop = e.clientY - wsRect.top - dragY;
  
  newTop = Math.max(0, Math.min(newTop, wsRect.height - 40));
  newLeft = Math.max(-100, Math.min(newLeft, wsRect.width - 100));
  
  dragObj.style.left = `${newLeft}px`;
  dragObj.style.top = `${newTop}px`;
}

function dragEnd() {
  dragObj = null;
}

function bringToFront(id) {
  const win = document.getElementById(id);
  if (!win) return;
  
  activeWindows = activeWindows.filter(wId => wId !== id);
  activeWindows.push(id);
  
  activeWindows.forEach((wId, idx) => {
    const el = document.getElementById(wId);
    if (el) el.style.zIndex = 10 + idx;
  });
}

function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  
  win.classList.remove('hidden');
  win.classList.remove('minimized');
  
  if (!win.style.left) {
    const workspace = document.getElementById('desktop-workspace');
    const wsRect = workspace.getBoundingClientRect();
    const winRect = win.getBoundingClientRect();
    win.style.left = `${(wsRect.width - winRect.width) / 3}px`;
    win.style.top = `${(wsRect.height - winRect.height) / 4}px`;
  }
  
  bringToFront(id);
  
  let dockTip = '';
  if (id === 'about-window') dockTip = 'About Me';
  else if (id === 'terminal-window') dockTip = 'Terminal';
  else if (id === 'contact-window') dockTip = 'Contact Me';
  
  if (dockTip) {
    const dockItem = document.querySelector(`.dock-item[data-tooltip="${dockTip}"]`);
    if (dockItem) dockItem.classList.add('running');
  }
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.classList.add('hidden');
  }
  
  let dockTip = '';
  if (id === 'about-window') dockTip = 'About Me';
  else if (id === 'terminal-window') dockTip = 'Terminal';
  else if (id === 'contact-window') dockTip = 'Contact Me';
  
  if (dockTip) {
    const dockItem = document.querySelector(`.dock-item[data-tooltip="${dockTip}"]`);
    if (dockItem) dockItem.classList.remove('running');
  }
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.classList.add('minimized');
  }
}

function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  
  const workspace = document.getElementById('desktop-workspace');
  const wsRect = workspace.getBoundingClientRect();
  
  if (win.style.width === '100%') {
    win.style.width = '550px';
    win.style.height = '400px';
    win.style.left = '100px';
    win.style.top = '100px';
  } else {
    win.style.width = '100%';
    win.style.height = `${wsRect.height}px`;
    win.style.left = '0';
    win.style.top = '0';
  }
}

// ----------------------------------------------------
// IPHONE SIMULATOR INTERACTION LOGIC
// ----------------------------------------------------
function toggleScreenPower() {
  const screen = document.getElementById('iphone-screen');
  isIphonePowered = !isIphonePowered;
  
  if (isIphonePowered) {
    screen.style.filter = 'brightness(1)';
    isIphoneLocked = true;
    document.getElementById('iphone-lock-screen').classList.remove('unlocked');
    goHome();
  } else {
    screen.style.filter = 'brightness(0)';
  }
}

function expandDynamicIsland() {
  const island = document.getElementById('dynamic-island');
  island.classList.toggle('expanded');
}

function triggerDynamicIslandEvent(type, text1, text2) {
  const island = document.getElementById('dynamic-island');
  const content = document.getElementById('dynamic-island-content');
  
  island.className = 'dynamic-island';
  content.innerHTML = '';
  
  if (type === 'charging') {
    island.classList.add('charging', 'expanded');
    content.innerHTML = `
      <span style="font-size:10px; font-weight:600;">Charging</span>
      <span class="charging-icon">
        100%
        <svg width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
      </span>
    `;
  } else if (type === 'unlocked') {
    island.classList.add('unlocked', 'expanded');
    content.innerHTML = `
      <div class="faceid-animation"></div>
      <span style="font-size:10px; font-weight:600;">Face ID Approved</span>
    `;
  }
  
  setTimeout(() => {
    island.classList.remove('expanded');
    setTimeout(() => {
      island.className = 'dynamic-island';
      content.innerHTML = '';
    }, 350);
  }, 2500);
}

function unlockIphone() {
  triggerDynamicIslandEvent('unlocked');
  
  setTimeout(() => {
    const lockScreen = document.getElementById('iphone-lock-screen');
    lockScreen.classList.add('unlocked');
    isIphoneLocked = false;
    
    const lockIcon = document.getElementById('lock-icon');
    if (lockIcon) lockIcon.style.transform = 'scale(0.8) translateY(-5px)';
  }, 1000);
}

function launchApp(appId) {
  if (isIphoneLocked) return;
  
  if (currentActiveIphoneApp) {
    document.getElementById(currentActiveIphoneApp).classList.remove('active');
  }
  
  const appWin = document.getElementById(appId);
  if (appWin) {
    appWin.classList.add('active');
    currentActiveIphoneApp = appId;
    
    if (appId === 'app-projects') {
      initProjects();
    }
  }
}

function closeApp(appId) {
  const appWin = document.getElementById(appId);
  if (appWin) {
    appWin.classList.remove('active');
    if (currentActiveIphoneApp === appId) {
      currentActiveIphoneApp = null;
    }
  }
}

function goHome() {
  if (currentActiveIphoneApp) {
    closeApp(currentActiveIphoneApp);
  }
  closeApp('app-project-detail');
}

// ----------------------------------------------------
// PROJECTS APP (GITHUB INTEGRATION)
// ----------------------------------------------------
function initProjects() {
  projectsData = [...localProjects];
  renderProjectsList(projectsData);
}

function formatRepoName(name) {
  return name.split(/[-_]/)
             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
             .join(' ');
}

function renderProjectsList(projects) {
  const container = document.getElementById('project-cards-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (projects.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; font-size: 13px;">No projects found</p>';
    return;
  }
  
  projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-item-card';
    card.onclick = () => viewProjectDetails(proj.id);
    
    const techHTML = proj.technologies.slice(0, 3).map(tech => `<span class="project-tech-pill">${tech}</span>`).join('');
    
    let statsHTML = '';
    if (proj.githubUrl && proj.stats.stars > 0) {
      statsHTML = `
        <span style="display:flex; align-items:center; gap:3px;">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          ${proj.stats.stars}
        </span>
      `;
    }
    
    card.innerHTML = `
      <div class="project-card-header">
        <span class="project-card-title">${proj.title}</span>
        <span class="project-card-badge">${proj.category}</span>
      </div>
      <p class="project-card-desc">${proj.description}</p>
      <div class="project-card-footer">
        <div class="project-tech-pills">${techHTML}</div>
        ${statsHTML}
      </div>
    `;
    container.appendChild(card);
  });
  
  initTiltHoverEffect();
}

function filterProjects(query) {
  const q = query.toLowerCase();
  const filtered = projectsData.filter(proj => 
    proj.title.toLowerCase().includes(q) || 
    proj.description.toLowerCase().includes(q) ||
    proj.technologies.some(tech => tech.toLowerCase().includes(q))
  );
  renderProjectsList(filtered);
}

function viewProjectDetails(id) {
  const proj = projectsData.find(p => p.id === id);
  if (!proj) return;
  
  const content = document.getElementById('project-detail-content');
  if (!content) return;
  
  let icon = '📱';
  if (proj.id.includes('construction')) icon = '🏗️';
  else if (proj.id.includes('timecard')) icon = '⏱️';
  else if (proj.id.includes('color')) icon = '🎨';
  else if (proj.id.includes('calendar')) icon = '📅';
  else if (proj.id.includes('architecture')) icon = '⚙️';
  
  let actionButtons = '';
  if (proj.appStoreUrl && proj.appStoreUrl !== '#') {
    actionButtons += `<a href="${proj.appStoreUrl}" target="_blank" class="store-btn-get">App Store</a>`;
  } else if (proj.id === 'linarc-construction' || proj.id === 'linarc-timecard') {
    actionButtons += `<button onclick="viewStoreApp('${proj.id}')" class="store-btn-get">View in App Store</button>`;
  }
  
  if (proj.githubUrl) {
    actionButtons += `<a href="${proj.githubUrl}" target="_blank" class="store-btn-get" style="background:#24292e; margin-left: 8px;">GitHub Repository</a>`;
  }
  
  let ratingRow = '';
  if (proj.stats.rating) {
    ratingRow = `
      <div class="store-stats-strip">
        <div class="store-stat-column">
          <div class="store-stat-top">${proj.stats.rating} ★</div>
          <div class="store-stat-bottom">Rating</div>
        </div>
        <div class="store-stat-column">
          <div class="store-stat-top">${proj.stats.reviews}</div>
          <div class="store-stat-bottom">Reviews</div>
        </div>
        <div class="store-stat-column">
          <div class="store-stat-top">4+</div>
          <div class="store-stat-bottom">Age</div>
        </div>
      </div>
    `;
  } else if (proj.githubUrl) {
    ratingRow = `
      <div class="store-stats-strip">
        <div class="store-stat-column">
          <div class="store-stat-top">${proj.stats.stars}</div>
          <div class="store-stat-bottom">Stars</div>
        </div>
        <div class="store-stat-column">
          <div class="store-stat-top">${proj.stats.forks}</div>
          <div class="store-stat-bottom">Forks</div>
        </div>
        <div class="store-stat-column">
          <div class="store-stat-top">${proj.timeline}</div>
          <div class="store-stat-bottom">Year</div>
        </div>
      </div>
    `;
  }
  
  const featuresHTML = proj.features.map(f => `<li>${f}</li>`).join('');
  
  content.innerHTML = `
    <div class="store-listing-header">
      <div class="store-app-icon">${icon}</div>
      <div class="store-app-details">
        <div class="store-app-name">${proj.title}</div>
        <div class="store-app-developer">${proj.role}</div>
        <div style="margin-top: 8px; display:flex;">${actionButtons}</div>
      </div>
    </div>
    
    ${ratingRow}
    
    <div class="store-app-description">
      ${proj.longDescription}
    </div>
    
    <div class="store-app-features-title">Key Contributions</div>
    <ul class="store-app-features-list">
      ${featuresHTML}
    </ul>
    
    <div style="margin-top: 20px;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); display:block; margin-bottom: 8px;">Stack</span>
      <div class="skill-items">
        ${proj.technologies.map(tech => `<span class="skill-tag" style="font-size:11px; padding: 4px 10px;">${tech}</span>`).join('')}
      </div>
    </div>
  `;
  
  launchApp('app-project-detail');
}

function navigateBackToProjects() {
  closeApp('app-project-detail');
  launchApp('app-projects');
}

function openIphoneAppStore() {
  if (isIphoneLocked) {
    unlockIphone();
    setTimeout(() => launchApp('app-store'), 1100);
  } else {
    launchApp('app-store');
  }
}

function viewStoreApp(appId) {
  viewProjectDetails(appId);
}

// ----------------------------------------------------
// SETTINGS APP LOGIC
// ----------------------------------------------------
function toggleBatteryPercent(checked) {
  const percentText = document.querySelector('.battery-status');
  if (percentText) {
    percentText.style.display = checked ? 'inline' : 'none';
  }
}

function setWallpaper(wpId, el) {
  const wallpaperUrl = wallpapers[wpId];
  if (!wallpaperUrl) return;
  
  activeIphoneWallpaper = wpId;
  
  document.getElementById('iphone-screen').style.backgroundImage = `url('${wallpaperUrl}')`;
  document.getElementById('iphone-lock-screen').style.backgroundImage = `url('${wallpaperUrl}')`;
  
  document.querySelectorAll('.wallpaper-preview').forEach(preview => {
    preview.classList.remove('selected');
  });
  el.classList.add('selected');
  
  const island = document.getElementById('dynamic-island');
  const content = document.getElementById('dynamic-island-content');
  island.classList.add('expanded');
  content.innerHTML = `<span style="font-size:10px; font-weight:600; text-align:center; width:100%;">Wallpaper Updated</span>`;
  setTimeout(() => {
    island.classList.remove('expanded');
  }, 1500);
}

// ----------------------------------------------------
// TERMINAL.APP PARSER & LOGIC
// ----------------------------------------------------
function focusTerminalInput() {
  document.getElementById('terminal-input').focus();
}

function handleTerminalKeydown(e) {
  if (e.key === 'Enter') {
    const inputField = e.target;
    const commandLine = inputField.value.trim();
    inputField.value = '';
    
    if (commandLine) {
      executeCommand(commandLine);
    }
  }
}

function executeCommand(cmdLine) {
  const history = document.getElementById('terminal-history');
  
  const promptRow = document.createElement('div');
  promptRow.className = 'terminal-line';
  promptRow.innerHTML = `<span class="terminal-prompt">puvi@macbook:~$</span> <span>${cmdLine}</span>`;
  history.appendChild(promptRow);
  
  const outputRow = document.createElement('div');
  outputRow.className = 'terminal-output';
  
  const tokens = cmdLine.split(/\s+/);
  const command = tokens[0].toLowerCase();
  const args = tokens.slice(1);
  
  if (isSwiftReplActive) {
    if (command === ':exit' || command === 'exit' || command === 'exit()') {
      isSwiftReplActive = false;
      outputRow.textContent = 'Leaving Swift REPL. Returning to bash shell.';
      outputRow.className = 'terminal-output success';
      document.querySelector('.terminal-prompt').textContent = 'puvi@macbook:~$';
    } else {
      const replResult = evaluateSwiftRepl(cmdLine);
      outputRow.textContent = replResult.output;
      if (replResult.error) outputRow.className = 'terminal-output error';
    }
    history.appendChild(outputRow);
    autoScrollTerminal();
    return;
  }
  
  switch(command) {
    case 'help':
      outputRow.innerHTML = `
Available commands:
  <span style="color:var(--accent-blue)">about</span>        - Short biography of Puviyarasan P.
  <span style="color:var(--accent-blue)">skills</span>       - List detailed technical skillset.
  <span style="color:var(--accent-blue)">experience</span>   - Print professional history & achievements.
  <span style="color:var(--accent-blue)">projects</span>     - List highlighted iOS apps and frameworks.
  <span style="color:var(--accent-blue)">contact</span>      - Display contact emails, phone, and links.
  <span style="color:var(--accent-blue)">swift</span>        - Launch a simulated Swift interactive REPL!
  <span style="color:var(--accent-blue)">theme [t]</span>    - Change terminal theme (dark, light, matrix).
  <span style="color:var(--accent-blue)">clear</span>        - Clear terminal screen output.
  <span style="color:var(--accent-blue)">exit</span>         - Close the terminal window.
`;
      break;
      
    case 'about':
      outputRow.textContent = `Puviyarasan P - iOS Engineer
iOS Engineer with 4 years of experience building and maintaining production mobile applications using Swift, UIKit, and SwiftUI. Skilled in designing scalable architectures, building reusable UI components, and integrating REST APIs. Experienced in MVVM architecture, offline-first mobile systems, and enterprise application development with a strong focus on clean architecture, maintainability, and performance.`;
      break;
      
    case 'skills':
      outputRow.textContent = `Technical Skill Set:
  • Languages: Swift
  • iOS Frameworks: UIKit, SwiftUI, Auto Layout, MapKit, Push Notifications, Combine Framework
  • Architecture: MVC, MVVM, Dependency Injection, SOLID
  • Networking & Backend: REST APIs, URLSession, JSON, Async/Await, GCD, Supabase
  • Storage: Realm, UserDefaults, Keychain, File Manager
  • Tools: Xcode, Git, Postman, Swift Package Manager, XCTest, TestFlight`;
      break;
      
    case 'experience':
      outputRow.textContent = `Professional Experience:
  iOS Developer — Linarc Inc (2022 - 2026)
    • Developed enterprise construction management & time-tracking iOS applications.
    • Built modular color frameworks and custom UI libraries in Swift Package Manager.
    • Designed offline-first caching infrastructures utilizing Realm DB.
    • Optimized search performance through debounced Combine handlers.
    • Implemented Jailbreak detection filters and Keychain storage.`;
      break;
      
    case 'projects':
      let projList = 'Highlighted Projects:\n';
      projectsData.forEach(p => {
        projList += `  • ${p.title} (${p.category}) - ${p.description}\n`;
      });
      outputRow.textContent = projList;
      break;
      
    case 'contact':
      outputRow.textContent = `Contact Info:
  • Email: puviiosdev@gmail.com
  • Phone: +91 9488464231
  • LinkedIn: linkedin.com/in/puvi10
  • GitHub: github.com/puviiosdev`;
      break;
      
    case 'swift':
      isSwiftReplActive = true;
      swiftVariables = {};
      document.querySelector('.terminal-prompt').textContent = 'swift>';
      outputRow.innerHTML = `*** Welcome to simulated Swift REPL (version 6.0) ***
Type Swift statements or assignments (e.g. <span style="color:var(--accent-orange)">let x = 10</span>, <span style="color:var(--accent-orange)">var y = "Swift"</span>).
Type <span style="color:var(--accent-orange)">:exit</span> or <span style="color:var(--accent-orange)">exit</span> to quit.`;
      outputRow.className = 'terminal-output success';
      break;
      
    case 'theme':
      const theme = args[0] ? args[0].toLowerCase() : '';
      const termBody = document.querySelector('.terminal-body');
      
      if (theme === 'light') {
        termBody.style.background = '#e5e5ea';
        termBody.style.color = '#1c1c1e';
        outputRow.textContent = 'Theme set to light.';
      } else if (theme === 'matrix') {
        termBody.style.background = '#0d0208';
        termBody.style.color = '#00ff41';
        outputRow.textContent = 'System theme shifted. Welcome to the Matrix.';
        outputRow.className = 'terminal-output success';
      } else {
        termBody.style.background = 'rgba(10, 10, 16, 0.45)';
        termBody.style.color = '#a9b1d6';
        outputRow.textContent = 'Theme reset to default dark.';
      }
      break;
      
    case 'clear':
      history.innerHTML = '';
      return;
      
    case 'exit':
      closeWindow('terminal-window');
      return;
      
    default:
      outputRow.textContent = `bash: command not found: ${command}. Type 'help' for directions.`;
      outputRow.className = 'terminal-output error';
  }
  
  history.appendChild(outputRow);
  autoScrollTerminal();
}

function autoScrollTerminal() {
  const content = document.querySelector('.terminal-body');
  if (content) {
    content.scrollTop = content.scrollHeight;
  }
}

// ----------------------------------------------------
// MINI SWIFT REPL INTERPRETER (UNIQUE PORTFOLIO FEATURE)
// ----------------------------------------------------
function evaluateSwiftRepl(line) {
  line = line.trim();
  let output = '';
  let error = false;
  
  try {
    const assignMatch = line.match(/^(let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (assignMatch) {
      const name = assignMatch[2];
      let valExpr = assignMatch[3].trim();
      const val = parseReplExpr(valExpr);
      swiftVariables[name] = val;
      
      output = `${name}: ${typeof val === 'string' ? `String = "${val}"` : `${Number.isInteger(val) ? 'Int' : 'Double'} = ${val}`}`;
      return { output, error };
    }
    
    const printMatch = line.match(/^print\((.+)\)$/);
    if (printMatch) {
      const expr = printMatch[1].trim();
      const val = parseReplExpr(expr);
      output = String(val);
      return { output, error };
    }
    
    if (swiftVariables.hasOwnProperty(line)) {
      output = String(swiftVariables[line]);
    } else {
      const result = parseReplExpr(line);
      output = String(result);
    }
  } catch (e) {
    output = `error: ${e.message}`;
    error = true;
  }
  
  return { output, error };
}

function parseReplExpr(expr) {
  if (expr.startsWith('"') && expr.endsWith('"')) {
    return expr.slice(1, -1);
  }
  
  if (swiftVariables.hasOwnProperty(expr)) {
    return swiftVariables[expr];
  }
  
  if (/^[0-9+\-*/().\s]+$/.test(expr)) {
    let parsedExpr = expr;
    Object.keys(swiftVariables).forEach(v => {
      if (typeof swiftVariables[v] === 'number') {
        const regex = new RegExp(`\\b${v}\\b`, 'g');
        parsedExpr = parsedExpr.replace(regex, swiftVariables[v]);
      }
    });
    
    try {
      const result = Function(`"use strict"; return (${parsedExpr})`)();
      if (result !== undefined && !isNaN(result)) {
        return result;
      }
    } catch(err) {
      throw new Error(`cannot evaluate expression '${expr}'`);
    }
  }
  
  if (!expr.startsWith('"') && isNaN(Number(expr))) {
    throw new Error(`use of unresolved identifier '${expr}'`);
  }
  
  return Number(expr);
}

// ----------------------------------------------------
// DYNAMIC CANVAS ANTIGRAVITY PARTICLE ENGINE
// ----------------------------------------------------
function initAntigravityCanvas() {
  const canvas = document.getElementById('antigravity-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  let mouse = { x: null, y: null, radius: 150 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  const particles = [];
  const particleCount = 80;
  
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }
    
    reset() {
      this.x = Math.random() * width;
      this.y = height + 10;
      this.size = Math.random() * 8 + 6;
      
      this.speedY = -(Math.random() * 0.8 + 0.4);
      this.speedX = (Math.random() * 0.4 - 0.2) - 0.1;
      this.opacity = Math.random() * 0.4 + 0.3;
      this.angle = Math.random() * Math.PI * 2;
      this.speedAngle = Math.random() * 0.015 - 0.0075;
      
      const symbols = ['', '✦', '<>'];
      this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      const colors = [
        'rgba(66, 133, 244, ',
        'rgba(234, 67, 53, ',
        'rgba(251, 188, 5, ',
        'rgba(52, 168, 83, ',
        'rgba(162, 0, 255, ',
        'rgba(255, 109, 0, '
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.angle += this.speedAngle;
      
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const forceX = (dx / distance) * force * 2.8;
          const forceY = (dy / distance) * force * 2.8;
          
          this.x += forceX;
          this.y += forceY;
        }
      }
      
      if (this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }
    
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      const isLight = document.body.classList.contains('light-mode');
      const finalColor = isLight ? `rgba(0, 0, 0, ${this.opacity * 0.4})` : `rgba(255, 255, 255, ${this.opacity * 0.4})`;
      ctx.fillStyle = finalColor;
      ctx.font = `${this.size}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(this.symbol, -this.size / 2, this.size / 2);
      ctx.restore();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

function initTiltHoverEffect() {
  const items = document.querySelectorAll('.desktop-icon');
  items.forEach(item => {
    if (item.classList.contains('has-tilt')) return;
    item.classList.add('has-tilt');
    
    item.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out';
    item.style.transformStyle = 'preserve-3d';
    
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const maxRotation = 10;
      const angleX = -((y - yc) / yc) * maxRotation;
      const angleY = ((x - xc) / xc) * maxRotation;
      
      item.style.transform = `perspective(500px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-5px) scale(1.05)`;
      
      if (item.classList.contains('desktop-icon')) {
        item.style.filter = 'drop-shadow(0 10px 15px rgba(255, 255, 255, 0.15))';
      }
    });
    
    item.style.cursor = 'pointer';
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) translateY(0deg) scale(1)';
      item.style.boxShadow = '';
      item.style.filter = '';
    });
  });
}

function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.toggle('light-mode');
  const icon = document.getElementById('theme-toggle-icon');
  
  if (isLight) {
    icon.innerHTML = `<path fill="currentColor" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zM4.22 4.22a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 1 1-1.41 1.42L4.22 5.64a1 1 0 0 1 0-1.42zm11.32 11.32a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 0 1-1.42 1.41l-1.41-1.41a1 1 0 0 1 0-1.42zM2 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm15 0a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zM5.64 19.78a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 0 1 1.42 1.41l-1.41 1.42a1 1 0 0 1-1.42 0zm11.32-11.32a1 1 0 0 1 0-1.42l1.42-1.41a1 1 0 0 1 1.41 1.41l-1.42 1.42a1 1 0 0 1-1.41 0z"/>`;
    icon.style.transform = 'rotate(180deg)';
  } else {
    icon.innerHTML = `<path fill="currentColor" d="M12.1 22c-5 0-9.1-4.1-9.1-9.1C3 7.8 7.2 3.5 12.5 3c.3 0 .5.2.5.5v.3c-.6 2.3.1 4.7 1.7 6.4s4 2.3 6.4 1.7c.1 0 .3.1.4.3.1.2.1.4-.1.5-1.9 4.8-6.5 8.1-11.3 9.3z" />`;
    icon.style.transform = 'rotate(0deg)';
  }
}
