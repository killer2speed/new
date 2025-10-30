// Audio Context Setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTickSound() {
    const o = audioContext.createOscillator(); const g = audioContext.createGain();
    o.connect(g); g.connect(audioContext.destination);
    o.frequency.value = 800; o.type='sine';
    g.gain.setValueAtTime(0.05, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    o.start(); o.stop(audioContext.currentTime + 0.05);
}

function playPopSound() {
    const o = audioContext.createOscillator(); const g = audioContext.createGain();
    o.connect(g); g.connect(audioContext.destination);
    o.frequency.value = 1200; o.type='square';
    g.gain.setValueAtTime(0.08, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    o.start(); o.stop(audioContext.currentTime + 0.1);
}

function playConnectSound() {
    const o = audioContext.createOscillator(); const g = audioContext.createGain();
    o.connect(g); g.connect(audioContext.destination);
    o.frequency.value = 440; o.type='triangle';
    g.gain.setValueAtTime(0.1, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    o.start(); o.stop(audioContext.currentTime + 0.5);
}

function playSuccessBeep() {
    [1000, 1500].forEach((freq, i) => {
        setTimeout(() => {
            const o = audioContext.createOscillator(); const g = audioContext.createGain();
            o.connect(g); g.connect(audioContext.destination);
            o.frequency.value = freq; o.type='square';
            g.gain.setValueAtTime(0.1, audioContext.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            o.start(); o.stop(audioContext.currentTime + 0.1);
        }, i * 100);
    });
}

function playErrorSound() {
    const o = audioContext.createOscillator(); const g = audioContext.createGain();
    o.connect(g); g.connect(audioContext.destination);
    o.frequency.value = 200; o.type='sawtooth';
    g.gain.setValueAtTime(0.1, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    o.start(); o.stop(audioContext.currentTime + 0.3);
}

function playStartupSound() {
    [500,700,900,1100].forEach((freq,i)=>{
        setTimeout(()=>{
            const o = audioContext.createOscillator(); const g = audioContext.createGain();
            o.connect(g); g.connect(audioContext.destination);
            o.frequency.value=freq; o.type='sine';
            g.gain.setValueAtTime(0.08, audioContext.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
            o.start(); o.stop(audioContext.currentTime + 0.15);
        }, i*80);
    });
}

let isOnline = navigator.onLine;
let wasProcessing = false;
let allIntervals = [];
let allTimeouts = [];

function stopAllProcesses(){
    allIntervals.forEach(id=>clearInterval(id));
    allTimeouts.forEach(id=>clearTimeout(id));
    allIntervals=[]; allTimeouts=[];
}

function handleOffline(){
    isOnline=false;
    playErrorSound();
    stopAllProcesses();
    document.getElementById('noInternetScreen').classList.add('active');
    document.getElementById('mainContainer').style.display='none';
    document.getElementById('serverStatus').textContent='OFFLINE';
    document.getElementById('statusDot').classList.add('offline');
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
}

function handleOnline(){
    isOnline=true;
    playStartupSound();
    document.getElementById('noInternetScreen').classList.remove('active');
    document.getElementById('mainContainer').style.display='block';
    document.getElementById('serverStatus').textContent='ACTIVE & STABLE';
    document.getElementById('statusDot').classList.remove('offline');
    initializeApp();
}

window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

async function typewriterEffect(element, text, addDot = false) {
    return new Promise(async (resolve) => {
        let dot = null;
        if (addDot) {
            dot = document.createElement("span");
            dot.classList.add("moving-dot");
            dot.textContent = ".";
            element.appendChild(dot);
        }

        const caret = document.createElement('span');
        caret.className = 'typing-caret';
        element.appendChild(caret);

        let i = 0;
        const baseSpeed = 18 + Math.random() * 45;

        function charDelay(char, nextChar) {
            if (char === '.' && nextChar === '.' ) return baseSpeed + 40;
            if (char === '.' || char === '!' || char === '?') return baseSpeed + 180;
            if (char === ',' || char === ';' || char === ':') return baseSpeed + 120;
            if (char === ' ') return baseSpeed + 10;
            return baseSpeed + Math.random() * 40;
        }

        while (i < text.length) {
            if (!isOnline) {
                if (dot) dot.remove();
                caret.remove();
                resolve();
                return;
            }

            const ch = text.charAt(i);
            const nextCh = (i + 1 < text.length) ? text.charAt(i + 1) : '';
            element.insertBefore(document.createTextNode(ch), caret);

            const delay = charDelay(ch, nextCh);
            if (ch === '\n') {
                await sleep(delay + 220);
            } else {
                await sleep(delay);
            }
            i++;
        }

        element.appendChild(document.createTextNode("\n"));
        if (dot) dot.remove();
        caret.remove();
        await sleep(350);
        resolve();
    });
}

function sleep(ms) {
    return new Promise((res) => {
        const id = setTimeout(res, ms);
        allTimeouts.push(id);
    });
}

let userIP = 'Loading...';
let currentPing = '--';

async function fetchRealIP(){
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIP = data.ip;
        document.getElementById('ipAddress').textContent = userIP;
    } catch (e) {
        userIP = '156.199.188.171';
        document.getElementById('ipAddress').textContent = userIP;
    }
}

async function measurePing(){
    if (!isOnline) return;
    const start = Date.now();
    try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
        const ping = Date.now() - start;
        currentPing = Math.min(ping, 150);
        document.getElementById('ping').textContent = currentPing + 'ms';
        playTickSound();
    } catch (e) {
        currentPing = Math.floor(25 + Math.random()*30);
        document.getElementById('ping').textContent = currentPing + 'ms';
    }
}

let onlineUsers = 1985;
let newToday = 247;
let uptime = 99.9;

function initializeStats(){
    const savedUsers = localStorage.getItem('onlineUsers');
    const savedNewToday = localStorage.getItem('newToday');
    if (savedUsers) onlineUsers = parseInt(savedUsers);
    else onlineUsers = Math.floor(1900 + Math.random() * 151);
    if (savedNewToday) newToday = parseInt(savedNewToday);
    else newToday = Math.floor(200 + Math.random() * 101);
    document.getElementById('onlineUsers').textContent = onlineUsers;
    document.getElementById('newToday').textContent = '+' + newToday;
}

function updateOnlineUsers(){
    if (!isOnline) return;
    const change = Math.random() > 0.5 ? Math.floor(Math.random()*5) + 1 : -(Math.floor(Math.random()*5)+1);
    onlineUsers = Math.max(1900, Math.min(2100, onlineUsers + change));
    document.getElementById('onlineUsers').textContent = onlineUsers;
    localStorage.setItem('onlineUsers', onlineUsers);
    playPopSound();
}

function updateNewToday(){
    if (!isOnline) return;
    const change = Math.random() > 0.5 ? 2 : 1;
    newToday += change;
    document.getElementById('newToday').textContent = '+' + newToday;
    localStorage.setItem('newToday', newToday);
    playTickSound();
}

function updateUptime(){
    if (!isOnline) return;
    uptime = (99.7 + Math.random()*0.2).toFixed(1);
    document.getElementById('uptime').textContent = uptime + '%';
}

function updateTime(){
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('serverTime').textContent = `${h}:${m}:${s}`;
}

function initializeApp(){
    stopAllProcesses();
    initializeStats();
    fetchRealIP();
    measurePing();
    const pingInterval = setInterval(measurePing, 2000); allIntervals.push(pingInterval);
    updateTime(); const timeInterval = setInterval(updateTime, 1000); allIntervals.push(timeInterval);
    const usersInterval = setInterval(updateOnlineUsers, 5000 + Math.random()*5000); allIntervals.push(usersInterval);
    const newTodayInterval = setInterval(updateNewToday, 30000 + Math.random()*30000); allIntervals.push(newTodayInterval);
    const uptimeInterval = setInterval(updateUptime, 30000); allIntervals.push(uptimeInterval);

    // check cooldown on init
    checkExistingCooldown();
}


// =================================================================
// START: Re-integrating Server Logic to Client-Side (Local Execution)
// =================================================================

function isMaintenanceTime(){
    // فترة الصيانة المطلوبة: الخميس (4) من 02:00 صباحاً حتى 08:00 صباحاً بالتوقيت العالمي المنسق (UTC)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcDay = now.getUTCDay();
    
    // الخميس (4) من 02:00 صباحاً حتى 08:00 صباحاً بالتوقيت العالمي المنسق (UTC)
    return utcDay === 4 && utcHours >= 2 && utcHours < 8;
}

function analyzePackage(){
    const rand = Math.random() * 100;
    let percentage;
    if (rand < 50) percentage = Math.floor(Math.random()*50) + 1;
    else if (rand < 80) percentage = Math.floor(Math.random()*25) + 51;
    else if (rand < 95) percentage = Math.floor(Math.random()*14) + 76;
    else percentage = Math.floor(Math.random()*6) + 90;
    
    let resultMessage;
    let resultClass;

    if (percentage <= 50){
        resultClass = 'result-bad';
        resultMessage = '😞 [النسبة غير جيدة]<br><br><strong>BAD PROBABILITY</strong><br>لا تفتح الباكج الآن<br>Do not open the package now<br><br>حاول مرة أخرى في وقت لاحق<br>Try again later for better results';
    } else if (percentage <= 75){
        resultClass = 'result-weak';
        resultMessage = '⚠️ [النسبة ضعيفة]<br><br><strong>WEAK PROBABILITY</strong><br>النسبة ليست جيدة<br>The probability is not good<br><br>يُنصح بالمحاولة مرة أخرى<br>Recommended to try again';
    } else if (percentage <= 89){
        resultClass = 'result-medium';
        resultMessage = '⚡ [النسبة متوسطة]<br><br><strong>MEDIUM PROBABILITY</strong><br>مقبول للفتح<br>Acceptable to open<br><br>لكن يُفضل المحاولة للحصول على نسبة أفضل<br>But better to try for higher percentage';
    } else {
        resultClass = 'result-good';
        resultMessage = '✅ [النسبة جيدة للفتح]<br><br><strong>GOOD PROBABILITY!</strong><br>🎉 بالتوفيق!<br>🎉 Good luck!<br><br>الوقت مناسب للفتح<br>Perfect time to open the package';
    }

    // Cooldown logic: Server generates the cooldown end time
    const now = Date.now();
    const randomCooldown = (120 + Math.random() * 180) * 1000; // 120s - 300s
    const cooldownEnd = now + Math.floor(randomCooldown);

    return { percentage, resultMessage, resultClass, cooldownEnd };
}

// =================================================================
// END: Re-integrating Server Logic to Client-Side (Local Execution)
// =================================================================


let userConfig = { deviceType: null, continent: null };
let currentScanType = '';

window.addEventListener('load', ()=>{
    if (isOnline) {
        initializeApp();
        setTimeout(()=>{
            document.getElementById('setupModal').style.display = 'flex';
            playConnectSound();
        }, 500);
    } else handleOffline();
});

function confirmSetup(){
    const deviceType = document.getElementById('deviceType').value;
    const continent = document.getElementById('continent').value;
    if (!deviceType || !continent) {
        playErrorSound();
        const message = 'يرجى اختيار نوع الهاتف والقارة\nPlease select device type and continent';
        const errorModal = document.getElementById('errorModal');
        document.getElementById('errorMessage').innerHTML = message.replace(/\n/g, '<br>');
        errorModal.style.display = 'flex';
        return;
    }
    userConfig.deviceType = deviceType;
    userConfig.continent = continent;
    document.getElementById('setupModal').style.display = 'none';
    document.getElementById('btnEpic').disabled = false;
    document.getElementById('btnShowtime').disabled = false;
    document.getElementById('btnPotw').disabled = false;
    playSuccessBeep();

    // If there's an active cooldown, immediately disable again
    checkExistingCooldown();
}

function initiateScan(type){
    if (!isOnline) { playErrorSound(); alert('لا يوجد اتصال بالإنترنت\nNo internet connection'); return; }
	
	// Check for maintenance time (now on client-side)
	if (isMaintenanceTime()) {
	    document.getElementById('maintenanceModal').style.display = 'flex';
	    playErrorSound();
	    return;
	}

    // prevent starting if cooldown active
    const cooldownEnd = parseInt(localStorage.getItem('cooldownEnd') || '0');
    if (Date.now() < cooldownEnd) {
        playErrorSound();
        alert('يوجد وقت انتظار قبل الفحص التالي. الرجاء الانتظار.');
        return;
    }

	currentScanType = type;
	startConnection(type);
}

async function startConnection(scanType){
    const modal = document.getElementById('connectionModal');
    const consoleLog = document.getElementById('consoleLog');
    const progressBar = document.getElementById('connectionProgress');

    modal.style.display = 'flex';
    consoleLog.innerHTML = '';
    progressBar.style.display = 'block';

    wasProcessing = true;
    playConnectSound();

	            const messages = [
	                'CONNECTING TO SERVER',
	                '[>] Initializing secure connection...',
	                '[>] Establishing encrypted tunnel...',
	                '[>] Connecting to ' + (userConfig.continent || 'Americas') + ' server...',
	                '[>] Device: ' + (userConfig.deviceType || 'Android') + ' detected',
	                '[>] Authenticating credentials...',
	                '[>] Spoofing user agent...',
	                '[>] Bypassing firewall restrictions...',
	                '[>] Exploiting zero-day vulnerability...',
	                '[>] Establishing backdoor access...',
	                '[>] Bypassing security protocols...',
	                '[>] Accessing game server database...',
	                '[>] Injecting analysis module...',
	                '[>] Scanning ' + scanType + ' box data...',
	                '[>] Extracting pack metadata...',
	                '[>] Running quantum probability simulation...',
	                '[>] Optimizing hack parameters...',
	                '[>] Processing server response...',
	                '[>] Decrypting package information...',
	                '[>] Analyzing probability algorithms...',
	                '[>] Calculating success rate...',
	                '[>] Finalizing connection...'
	            ];

	            // Start animation and wait for it to finish
	            await new Promise(async (resolve) => {
	                startProgressBar();
	                
	                for (let i = 0; i < messages.length; i++){
	                    if (!isOnline) return;
	                    const line = document.createElement('div');
	                    line.className = 'console-line';
	                    consoleLog.appendChild(line);
	    
	                    const isConnecting = messages[i].includes("CONNECTING TO SERVER") || messages[i].includes("Connecting to");
	                    await typewriterEffect(line, messages[i], isConnecting);
	    
	                    consoleLog.scrollTop = consoleLog.scrollHeight;
	                }
	                resolve();
	            });

	            // Once animation is done, execute local analysis
	            const result = analyzePackage();
	            connectionSuccess(result);
	        }

	        async function startProgressBar(){
	            if (!isOnline) return;
	            const progressBar = document.getElementById('connectionProgress');
	            const progressFill = document.getElementById('connectionFill');
	            const progressText = document.getElementById('connectionText');
	            progressBar.style.display = 'block';
	            // The duration is now fixed to match the animation time
	            const duration = 15000; // Fixed duration for animation
	            const steps = 100;
	            const stepDuration = duration / steps;
	            for (let progress = 0; progress <= 100; progress++){
	                if (!isOnline) return;
	                progressFill.style.width = progress + '%';
	                progressText.textContent = progress + '%';
	                if (progress % 10 === 0) playTickSound();
	                await sleep(stepDuration);
	            }
	            if (!isOnline) return;
	            // Do not call connectionSuccess() here, it's called after API call
	        }

	        function connectionSuccess(result){
	            // Success animation
	            playSuccessBeep();
	            const line = document.createElement('div');
	            line.className = 'console-line';
	            line.style.color = '#0f0';
	            line.style.fontWeight = 'bold';
	            document.getElementById('consoleLog').appendChild(line);
	            typewriterEffect(line, '[✓ CONNECTED TO GAME SERVER SUCCESSFULLY]', false).then(()=>{
	                sleep(1200).then(()=>{
	                    document.getElementById('connectionModal').style.display = 'none';
	                    wasProcessing = false;
	
	                    // Show results using local data
	                    showResults(result.percentage, result.resultMessage, result.resultClass, result.cooldownEnd);
	                });
	            });
	        }

// helper to enable/disable scan buttons
function setScanButtonsEnabled(enabled){
    document.getElementById('btnEpic').disabled = !enabled;
    document.getElementById('btnShowtime').disabled = !enabled;
    document.getElementById('btnPotw').disabled = !enabled;
}

// apply cooldown UI: show banner and disable buttons
let cooldownIntervalId = null;
function applyCooldownUI(cooldownEnd){
    setScanButtonsEnabled(false);

    const banner = document.getElementById('cooldownBanner');
    banner.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'cooldown-box';
    banner.appendChild(box);

    function update(){
        const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        box.textContent = '⏳ [COOL DOWN] ' + mins + ':' + (secs < 10 ? '0' : '') + secs + ' - Please wait';
        if (remaining <= 0) {
            clearInterval(cooldownIntervalId);
            cooldownIntervalId = null;
            banner.innerHTML = '';
            localStorage.removeItem('cooldownEnd');
            // re-enable buttons only if setup already confirmed
            if (userConfig.deviceType && userConfig.continent) setScanButtonsEnabled(true);
        }
    }

    update();
    if (cooldownIntervalId) clearInterval(cooldownIntervalId);
    cooldownIntervalId = setInterval(update, 1000);
}

// check on load if cooldown exists and apply
function checkExistingCooldown(){
    const cooldownEnd = parseInt(localStorage.getItem('cooldownEnd') || '0');
    if (Date.now() < cooldownEnd) {
        applyCooldownUI(cooldownEnd);
    } else {
        // no active cooldown: enable buttons only after setup
        if (userConfig.deviceType && userConfig.continent) {
            setScanButtonsEnabled(true);
        } else {
            setScanButtonsEnabled(false);
        }
    }
}

function showResults(percentage, resultMessage, resultClass, cooldownEnd){
    const modal = document.getElementById('resultsModal');
	    const percentageDisplay = document.getElementById('percentageDisplay');
	    const resultMessageElement = document.getElementById('resultMessage');
	    modal.style.display = 'flex';
	    percentageDisplay.textContent = percentage + '%';
	
	    // Display results from server
	    resultMessageElement.className = 'result-message ' + resultClass;
	    resultMessageElement.innerHTML = resultMessage;
	
	    // Play sound based on result class
	    if (resultClass === 'result-bad') playErrorSound();
	    else if (resultClass === 'result-weak') playTickSound();
	    else if (resultClass === 'result-medium') playPopSound();
	    else { playSuccessBeep(); setTimeout(()=>playSuccessBeep(),200); }
	
	    // ======= START: Cooldown logic (using server-provided end time) =======
	    localStorage.setItem('cooldownEnd', cooldownEnd);
	    // Apply the UI (banner + disabling buttons)
	    applyCooldownUI(cooldownEnd);
	    // ======= END: Cooldown logic =======
	
	    const autoTelegram = setTimeout(()=>{ openTelegram(); }, 4000);
	    allTimeouts.push(autoTelegram);
	
	    // keep previous cooldown-resume behavior (reload after countdown finished)
	    // (applyCooldownUI already removes cooldownEnd and re-enables buttons when done)
	}

function closeResults(){ playTickSound(); document.getElementById('resultsModal').style.display='none'; }
function rescanServer(){ 
    playSuccessBeep(); 
    document.getElementById('resultsModal').style.display='none';
    openTelegram();
}
function closeMaintenance(){ playTickSound(); document.getElementById('maintenanceModal').style.display='none'; }
function openTelegram(){ playTickSound(); window.open('https://t.me/pes224', '_blank'); }

// if offline initially
if (!isOnline) handleOffline();
