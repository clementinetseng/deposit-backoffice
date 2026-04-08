// ===== BONUS OFFERS DATA =====
const BONUS_OFFERS = [
  {
    id: 'b1', icon: '🎁', percent: 100,
    title: '100% First Deposit Bonus',
    subtitle: 'Up to ₱5,000 · 40x Turnover',
    minDep: 500, maxBonus: 5000, turnover: 40,
    desc: 'Your deposit amount and bonus will be credited to your <strong>Casino Bonus Wallet</strong> with a <strong>40x wager requirement</strong>.',
    tncs: [
      'Minimum deposit: ₱500',
      'Maximum bonus amount: ₱5,000',
      'Wager requirement: 40x (deposit + bonus amount)',
      'Valid on Slots and E-games only',
      'Offer valid for first-time deposits only',
      'Bonus expires within 30 days of activation',
      'Cannot be combined with other promotions',
    ],
  },
  {
    id: 'b2', icon: '💰', percent: 80,
    title: '80% Second Deposit Bonus',
    subtitle: 'Up to ₱8,000 · 30x Turnover',
    minDep: 1000, maxBonus: 8000, turnover: 30,
    desc: 'Your deposit amount and bonus will be credited to your <strong>Casino Bonus Wallet</strong> with a <strong>30x wager requirement</strong>. Valid for all casino games.',
    tncs: [
      'Minimum deposit: ₱1,000',
      'Maximum bonus amount: ₱8,000',
      'Wager requirement: 30x (deposit + bonus amount)',
      'Valid for all casino games',
      'Bonus expires within 30 days of activation',
    ],
  },
  {
    id: 'b3', icon: '🎰', percent: 50,
    title: '50% Bonus + 30 Free Spins',
    subtitle: 'Up to ₱3,000 · 35x Turnover',
    minDep: 500, maxBonus: 3000, turnover: 35,
    desc: 'Get a <strong>50% bonus + 30 Free Spins</strong> credited to your Casino Bonus Wallet with a <strong>35x wager requirement</strong>. Free Spins valid on selected slot games.',
    tncs: [
      'Minimum deposit: ₱500',
      'Maximum bonus amount: ₱3,000',
      '30 Free Spins on selected slot games only',
      'Wager requirement: 35x (deposit + bonus amount)',
      'Free Spins winnings subject to 30x wager',
      'Bonus expires within 14 days of activation',
    ],
  },
  {
    id: 'b4', icon: '🔄', percent: 30,
    title: '30% Cashback Bonus',
    subtitle: 'Up to ₱2,000 · 20x Turnover',
    minDep: 300, maxBonus: 2000, turnover: 20,
    desc: 'Enjoy a <strong>30% cashback</strong> on your deposit credited to your <strong>Bonus Wallet</strong> with a low <strong>20x wager requirement</strong>. Valid for all games.',
    tncs: [
      'Minimum deposit: ₱300',
      'Maximum bonus amount: ₱2,000',
      'Wager requirement: 20x',
      'Valid for all game types',
      'Bonus expires within 30 days of activation',
    ],
  },
  {
    id: 'b0', icon: '🚫', percent: 0,
    title: 'No Bonus',
    subtitle: 'Direct deposit · No restrictions',
    minDep: 500, maxBonus: 0, turnover: 0,
    desc: 'Your deposit will be credited directly to your <strong>Main Wallet</strong> with <strong>no wager requirement</strong>. You may withdraw anytime.',
    tncs: [],
  },
];

// ===== STATE =====
const S = {
  page: 'lobby',
  walletTab: 'deposit',
  recTab: 'transactions',
  sidebarCol: false,
  mobSidebar: false,
  banner: 0,
  bannerTimer: null,
  depAmt: null,
  depMethod: 'qrph',
  wdMethod: null,
  lobbyCategory: 'egame',
};

// ===== INIT =====
function init() {
  renderSidebar();
  renderTopNav();
  renderBanners();
  renderLobby();
  renderWallet();
  initBonus();
  renderRecord();
  initTurnover();
  initRewards();
  startBannerTimer();
  bindGlobalEvents();
  navigateTo('lobby');
}

// ===== TOP NAV =====
function renderTopNav() {
  document.getElementById('navTabs').innerHTML = NAV_CATS.map(cat =>
    `<button class="nav-tab" data-cat="${cat.toLowerCase()}" onclick="filterLobby('${cat.toLowerCase()}')">${cat}</button>`
  ).join('');
  document.getElementById('navBalance').textContent = `${USER.currency}${fmtNum(USER.balance)}`;
  document.getElementById('navAvatarName').textContent = USER.name;
  document.getElementById('navAvatarInitial').textContent = USER.name[0].toUpperCase();
}

// ===== SIDEBAR =====
function renderSidebar() {
  document.getElementById('sbUserName').textContent = USER.name;
  document.getElementById('sbUserId').textContent = USER.uid;
  document.getElementById('sbBal').textContent = `${USER.currency}${fmtNum(USER.balance)}`;
  document.getElementById('sbAvatarInitial').textContent = USER.name[0].toUpperCase();
}

function toggleSidebar() {
  if (window.innerWidth <= 767) {
    S.mobSidebar = !S.mobSidebar;
    document.getElementById('sidebar').classList.toggle('mob-open', S.mobSidebar);
    document.getElementById('overlay').classList.toggle('show', S.mobSidebar);
  } else {
    S.sidebarCol = !S.sidebarCol;
    document.getElementById('sidebar').classList.toggle('collapsed', S.sidebarCol);
    document.querySelector('.main').classList.toggle('collapsed', S.sidebarCol);
    document.querySelector('.top-nav').classList.toggle('collapsed', S.sidebarCol);
  }
}

function closeSidebar() {
  S.mobSidebar = false;
  document.getElementById('sidebar').classList.remove('mob-open');
  document.getElementById('overlay').classList.remove('show');
}

// ===== NAVIGATE =====
function navigateTo(page) {
  S.page = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item[data-page]').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  document.querySelectorAll('.mob-nav-item[data-page]').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  if (S.mobSidebar) closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== BANNERS =====
function renderBanners() {
  document.getElementById('bannerTrack').innerHTML = BANNERS.map(b => `
    <div class="banner-slide">
      <div class="banner-bg ${b.cls}">
        <div class="banner-info">
          <span class="banner-tag">${b.tag}</span>
          <h2 class="banner-title">${b.title}</h2>
          <p class="banner-desc">${b.desc}</p>
        </div>
        <div class="banner-illus">${b.icon}</div>
      </div>
    </div>`).join('');

  document.getElementById('bannerDots').innerHTML = BANNERS.map((_,i) =>
    `<div class="bdot${i===0?' active':''}" onclick="goBanner(${i})"></div>`).join('');
}

function goBanner(idx) {
  S.banner = idx;
  document.getElementById('bannerTrack').style.transform = `translateX(-${idx * 100}%)`;
  document.querySelectorAll('.bdot').forEach((d,i) => d.classList.toggle('active', i===idx));
}
function prevBanner() { goBanner((S.banner - 1 + BANNERS.length) % BANNERS.length); resetBannerTimer(); }
function nextBanner() { goBanner((S.banner + 1) % BANNERS.length); resetBannerTimer(); }
function startBannerTimer() { S.bannerTimer = setInterval(nextBanner, 4200); }
function resetBannerTimer() { clearInterval(S.bannerTimer); startBannerTimer(); }

// ===== LOBBY =====
function renderLobby() {
  const sections = ['egame','slot','fish','live','feature','combo'];
  document.getElementById('gameSections').innerHTML = sections.map(cat => `
    <section class="game-sec" id="sec-${cat}">
      <div class="sec-head">
        <h3 class="sec-title">${cat.charAt(0).toUpperCase()+cat.slice(1)}</h3>
        <div class="sec-line"></div>
        <button class="view-all" onclick="showToast('Coming soon!','info')">All ›</button>
      </div>
      <div class="game-grid">
        ${(GAMES[cat]||[]).map(g => `
          <div class="game-card" onclick="showToast('Launching ${g.name}...','info')">
            <div class="card-img ${g.gc}">${g.icon}</div>
            <div class="card-label">${g.name}</div>
          </div>`).join('')}
      </div>
    </section>`).join('');
}

function filterLobby(cat) {
  S.lobbyCategory = cat;
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  const target = document.getElementById('sec-' + cat);
  if (target) {
    navigateTo('lobby');
    setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

// ===== WALLET =====
function renderWallet() {
  // Deposit amounts
  document.getElementById('depAmtGrid').innerHTML = DEP_AMOUNTS.map(a =>
    `<button class="amt-btn" onclick="selectDepAmt(${a},this)">${a>=1000?(a/1000)+'K':a}</button>`).join('');

  // Deposit methods
  document.getElementById('depMethods').innerHTML =
    `<button class="pay-btn active" id="pm-qrph" onclick="selectDepMethod('qrph',this)">
       <span class="pay-ico" style="background:#E8F0FE;color:#1a56db">QR</span> QRPh
     </button>`;

  // Withdraw methods
  document.getElementById('wdMethods').innerHTML = [
    { id:'gcash',  name:'GCash',   color:'#007DC5', bg:'#E8F4FD', ico:'G' },
    { id:'paymaya',name:'PayMaya', color:'#00C27A', bg:'#E6FAF3', ico:'M' },
  ].map(m =>
    `<button class="pay-btn" id="pm-${m.id}" onclick="selectWdMethod('${m.id}',this)">
       <span class="pay-ico" style="background:${m.bg};color:${m.color}">${m.ico}</span> ${m.name}
     </button>`).join('');
}

function switchWalletTab(tab) {
  S.walletTab = tab;
  document.querySelectorAll('.w-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tc-'+tab));
}

function selectDepAmt(amt, btn) {
  S.depAmt = amt;
  document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('depAmtInput').value = amt;
}

function selectDepMethod(id, btn) {
  S.depMethod = id;
  document.querySelectorAll('#depMethods .pay-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectWdMethod(id, btn) {
  S.wdMethod = id;
  document.querySelectorAll('#wdMethods .pay-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function submitDeposit() {
  const val = document.getElementById('depAmtInput').value;
  if (!val || isNaN(val) || Number(val) < 500) {
    showToast('Please enter a valid amount (min ₱500)', 'error');
    return;
  }
  showToast(`Deposit request of ₱${fmtNum(Number(val))} submitted!`, 'success');
}

function submitWithdraw() {
  // Check turnover first
  const t = currentTurnover;
  const pct = t.required > 0 ? (t.wagered / t.required) * 100 : 100;
  if (pct < 100) {
    const left = (t.required - t.wagered).toLocaleString();
    showToast(`Complete wager requirement first. ₱${left} left to wager.`, 'error');
    return;
  }
  if (!S.wdMethod) { showToast('Please select a payment method', 'error'); return; }
  const val = document.getElementById('wdAmtInput').value;
  if (!val || isNaN(val) || Number(val) < 50) {
    showToast('Please enter a valid amount (min ₱50)', 'error');
    return;
  }
  showToast('Withdrawal request submitted!', 'success');
}

// ===== RECORD CENTER =====
const MOCK_PROMOTIONS = [
  { id: '1b8fA9ZxE', title: '100% First Deposit Bonus', date: 'Apr 8, 10:16 AM', status: 'active', pct: 75, amt: '₱5,000.00' },
  { id: '9kNyLhQaP', title: 'Reload Bonus', date: 'Apr 2, 5:12 PM', status: 'completed', pct: 100, amt: '₱2,500.00' },
  { id: 'ay3vUdMnL', title: 'Free Spins Promo', date: 'Mar 31, 11:18 AM', status: 'failed', pct: 0, amt: '₱0.00' },
  { id: 'hvvH2iUzJ', title: 'Cashback Bonus', date: 'Mar 26, 5:20 PM', status: 'completed', pct: 100, amt: '₱1,200.00' },
];

function renderRecord() {
  document.getElementById('dateFrom').value = daysAgo(6);
  document.getElementById('dateTo').value = today();

  const rcPromotions = document.getElementById('rc-promotions');
  if (rcPromotions) {
    let html = '<div class="rec-table-list">';
    MOCK_PROMOTIONS.forEach(p => {
      let icon = '', statusText = '', iconClass = '';
      if (p.status === 'active') { icon = '⟳'; statusText = 'Working'; iconClass = 'r-active'; }
      else if (p.status === 'completed') { icon = '✓'; statusText = 'Complete'; iconClass = 'r-complete'; }
      else { icon = '✕'; statusText = 'Failed'; iconClass = 'r-failed'; }

      html += `
        <div class="rec-row">
          <div class="rec-col-status">
            <div class="rec-status-circ ${iconClass}">${icon}</div>
            <div class="rec-st-text">
              <div class="rst-head ${iconClass}">${statusText}</div>
              <div class="rst-id">${p.id}...</div>
            </div>
          </div>
          <div class="rec-col-title">
            <span class="rec-t-icon">🎁</span>
            <span class="rec-t-name">${p.title}</span>
          </div>
          <div class="rec-col-amt">
            <div class="ra-val">${p.amt}</div>
            <div class="ra-date">${p.date}</div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    rcPromotions.innerHTML = html;
  }
}

function switchRecTab(tab) {
  S.recTab = tab;
  document.querySelectorAll('.rec-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.rec-content').forEach(c => c.classList.toggle('active', c.id === 'rc-'+tab));
}

// ===== TOAST =====
function showToast(msg, type='info') {
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(20px)'; t.style.transition='all 0.3s'; setTimeout(()=>t.remove(), 300); }, 2800);
}

// ===== GLOBAL EVENTS =====
function bindGlobalEvents() {
  document.getElementById('overlay').addEventListener('click', closeSidebar);
  document.getElementById('depAmtInput').addEventListener('input', () => {
    document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('active'));
    S.depAmt = null;
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && S.mobSidebar) closeSidebar();
  });
  // Close bonus dropdown on outside click
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('bonusDropdownWrap');
    if (wrap && !wrap.contains(e.target) && S.bonusOpen) {
      closeBonusDropdown();
    }
  });
}

window.addEventListener('DOMContentLoaded', init);

// ===== BONUS SELECTOR =====
let selectedBonus = null;

function initBonus() {
  selectedBonus = BONUS_OFFERS[0];
  S.bonusOpen = false;
  renderBonusOptions();
  applyBonusSelection();
}

function renderBonusOptions() {
  document.getElementById('bonusOptions').innerHTML = BONUS_OFFERS.map(b => `
    <button class="bonus-option${selectedBonus && b.id === selectedBonus.id ? ' selected' : ''}"
            onclick="selectBonus('${b.id}')">
      <span class="bonus-opt-icon">${b.icon}</span>
      <span class="bonus-opt-info">
        <span class="bonus-opt-title">${b.percent > 0 ? b.percent + '% &bull; ' : ''}${b.title}</span>
        <span class="bonus-opt-sub">${b.subtitle}</span>
      </span>
      ${selectedBonus && b.id === selectedBonus.id ? '<span class="bonus-opt-check">&#10003;</span>' : ''}
    </button>`).join('');
}

function applyBonusSelection() {
  if (!selectedBonus) return;
  // Update trigger button
  document.getElementById('bonusTriggerIcon').textContent = selectedBonus.icon;
  document.getElementById('bonusTriggerText').textContent =
    (selectedBonus.percent > 0 ? selectedBonus.percent + '% \u00b7 ' : '') + selectedBonus.title;
  // Update min deposit
  document.getElementById('bonusMinDep').textContent =
    'Min.deposit: \u20b1' + selectedBonus.minDep.toLocaleString();
  // Update info box
  const infoBox = document.getElementById('bonusInfoBox');
  const infoText = document.getElementById('bonusInfoText');
  const tncLink = document.getElementById('bonusTncLink');
  infoText.innerHTML = selectedBonus.desc;
  infoBox.classList.add('show');
  if (tncLink) tncLink.style.display = selectedBonus.tncs.length ? 'inline-block' : 'none';
  // Highlight no-bonus state
  infoBox.classList.toggle('no-bonus', selectedBonus.id === 'b0');
}

function selectBonus(id) {
  selectedBonus = BONUS_OFFERS.find(b => b.id === id) || BONUS_OFFERS[0];
  closeBonusDropdown();
  renderBonusOptions();
  applyBonusSelection();
  // Update deposit min based on chosen bonus
  document.getElementById('depAmtInput').placeholder =
    `Enter Amount: min \u20b1${selectedBonus.minDep.toLocaleString()}`;
}

function toggleBonusDropdown() {
  S.bonusOpen = !S.bonusOpen;
  document.getElementById('bonusTrigger').classList.toggle('open', S.bonusOpen);
  document.getElementById('bonusOptions').classList.toggle('show', S.bonusOpen);
}

function closeBonusDropdown() {
  S.bonusOpen = false;
  const t = document.getElementById('bonusTrigger');
  const o = document.getElementById('bonusOptions');
  if (t) t.classList.remove('open');
  if (o) o.classList.remove('show');
}

function closeBonusInfo() {
  document.getElementById('bonusInfoBox').classList.remove('show');
}

// ===== T&C MODAL =====
function openTnCModal() {
  if (!selectedBonus || !selectedBonus.tncs.length) return;
  document.getElementById('tncModalBody').innerHTML = `
    <div class="modal-bonus-name">${selectedBonus.icon} ${selectedBonus.title}</div>
    <div class="modal-bonus-meta">
      <span class="modal-meta-chip">${selectedBonus.percent > 0 ? selectedBonus.percent+'% bonus' : 'No Bonus'}</span>
      ${selectedBonus.turnover > 0 ? `<span class="modal-meta-chip">${selectedBonus.turnover}x Turnover</span>` : ''}
      ${selectedBonus.maxBonus > 0 ? `<span class="modal-meta-chip">Max \u20b1${selectedBonus.maxBonus.toLocaleString()}</span>` : ''}
    </div>
    <ul class="modal-tc-list">
      ${selectedBonus.tncs.map(tc => `<li class="modal-tc-item">${tc}</li>`).join('')}
    </ul>
    <div class="modal-tc-note">
      &#9888;&#65039; Jackpot Combo reserves the right to amend, suspend or cancel any bonus
      at any time without prior notice. Please contact our support team for any enquiries.
    </div>`;
  document.getElementById('tncModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeTnCModal() {
  document.getElementById('tncModal').classList.remove('show');
  document.body.style.overflow = '';
}

// ============================================================
// TURNOVER / WAGER REQUIREMENT
// ============================================================
const TURNOVER_SCENARIOS = {
  no_bonus_0: {
    label: 'Standard Deposit · 1x',
    type: 'deposit',
    bonusTitle: null,
    depositAmt: 1000, bonusAmt: 0, multiplier: 1,
    required: 1000, wagered: 0,
    balance: 1000,
    reason: 'To comply with <strong>Anti-Money Laundering (AML)</strong> regulations, all deposits require a minimum <strong>1x wager</strong> before withdrawal can be processed.',
    rules: [
      'All deposits require at least 1x the deposited amount to be wagered',
      'This applies regardless of whether a bonus was accepted',
      'Wager progress is tracked across all game types',
      'Once completed, withdrawal is available immediately',
    ],
  },
  no_bonus_partial: {
    label: 'Standard Deposit · 1x',
    type: 'deposit',
    bonusTitle: null,
    depositAmt: 1000, bonusAmt: 0, multiplier: 1,
    required: 1000, wagered: 600,
    balance: 1000,
    reason: 'To comply with <strong>Anti-Money Laundering (AML)</strong> regulations, all deposits require a minimum <strong>1x wager</strong> before withdrawal can be processed.',
    rules: [
      'All deposits require at least 1x the deposited amount to be wagered',
      'This applies regardless of whether a bonus was accepted',
      'Wager progress is tracked across all game types',
      'Once completed, withdrawal is available immediately',
    ],
  },
  bonus_partial: {
    label: '100% First Deposit Bonus · 40x',
    type: 'bonus',
    bonusTitle: '100% First Deposit Bonus',
    depositAmt: 1000, bonusAmt: 1000, multiplier: 40,
    required: 80000, wagered: 26000,
    balance: 2000,
    reason: 'You accepted the <strong>100% First Deposit Bonus</strong>. To protect the integrity of the bonus system, a <strong>40x wager requirement</strong> must be completed before funds can be withdrawn.',
    rules: [
      '40x wager applies on total wallet balance (deposit ₱1,000 + bonus ₱1,000 = ₱2,000 × 40)',
      'Your entire wallet balance is locked from withdrawal until the requirement is met',
      'Valid wagers on Slots and E-games only',
      'Bonus expires within 30 days if requirement is not completed',
    ],
  },
  bonus_high: {
    label: '80% Second Deposit Bonus · 30x',
    type: 'bonus',
    bonusTitle: '80% Second Deposit Bonus',
    depositAmt: 2000, bonusAmt: 1600, multiplier: 30,
    required: 108000, wagered: 81000,
    balance: 3600,
    reason: 'You accepted the <strong>80% Second Deposit Bonus</strong>. A <strong>30x wager requirement</strong> must be completed before funds can be withdrawn.',
    rules: [
      '30x wager applies on total wallet balance (deposit ₱2,000 + bonus ₱1,600 = ₱3,600 × 30)',
      'Your entire wallet balance is locked from withdrawal until the requirement is met',
      'Valid for all casino games',
      'Bonus expires within 30 days if requirement is not completed',
    ],
  },
  complete: {
    label: 'Standard Deposit · 1x',
    type: 'deposit',
    bonusTitle: null,
    depositAmt: 1000, bonusAmt: 0, multiplier: 1,
    required: 1000, wagered: 1000,
    balance: 1000,
    reason: '',
    rules: [],
  },
};

let currentTurnover = TURNOVER_SCENARIOS.bonus_high;
let toExplainOpen = false;

function initTurnover() {
  applyTurnoverScenario('bonus_high');
}

function applyTurnoverScenario(scenarioId) {
  currentTurnover = TURNOVER_SCENARIOS[scenarioId] || TURNOVER_SCENARIOS.no_bonus_0;
  renderTurnover();
}

function renderTurnover() {
  const t = currentTurnover;
  const pct = t.required > 0 ? Math.min((t.wagered / t.required) * 100, 100) : 100;
  const isComplete = pct >= 100;
  const left = Math.max(t.required - t.wagered, 0);

  // ---- Wallet Breakdown ----
  const totalLock = document.getElementById('wbTotalLock');
  const totalEl = document.getElementById('wbTotal');
  if (totalEl) totalEl.textContent = '\u20b1' + t.balance.toLocaleString();
  if (totalLock) totalLock.style.display = isComplete ? 'none' : 'inline';

  const avail = isComplete ? t.balance : 0;
  const availEl = document.getElementById('wbAvail');
  if (availEl) {
    availEl.textContent = '\u20b1 ' + avail.toLocaleString() + '.00';
    availEl.className = 'wb-avail-amt' + (isComplete ? ' wb-avail-open' : ' wb-avail-locked');
  }

  // Update Top Nav / Sidebar Balance
  const navAvailEl = document.getElementById('navBalance');
  if (navAvailEl) navAvailEl.textContent = '\u20b1' + avail.toLocaleString();
  const sideAvailEl = document.getElementById('sbBalance');
  if (sideAvailEl) sideAvailEl.textContent = '₱' + avail.toLocaleString() + '.00';

  // ---- Toggle cards ----
  document.getElementById('toCard').style.display = isComplete ? 'none' : 'block';

  // ---- Lock / unlock withdraw UI ----
  const locked = !isComplete;
  const submitBtn = document.getElementById('wdSubmitBtn');
  const amtWrap = document.getElementById('wdAmtWrap');
  const wdInput = document.getElementById('wdAmtInput');
  if (submitBtn) { submitBtn.disabled = locked; submitBtn.classList.toggle('submit-locked', locked); }
  if (wdInput) wdInput.disabled = locked;
  if (amtWrap) amtWrap.classList.toggle('input-disabled', locked);

  if (isComplete) return;

  // ---- Simplified to-card fields ----
  const pctRound = Math.round(pct * 10) / 10;
  const reqEl = document.getElementById('toReqAmount');
  const descEl = document.getElementById('toProgressDesc');
  const pctTxtEl = document.getElementById('toPctTxt');
  if (reqEl) reqEl.textContent = '\u20b1' + t.required.toLocaleString();
  if (descEl) descEl.textContent = 'Wager \u20b1' + t.required.toLocaleString() + ' to withdraw';
  if (pctTxtEl) pctTxtEl.textContent = pctRound.toFixed(2) + '%';

  // ---- Progress bar (colour) ----
  const fill = document.getElementById('toBarFill');
  fill.style.width = pctRound + '%';
  fill.className = 'to-bar-fill';
  if (pctRound >= 85) fill.classList.add('fill-green');
  else if (pctRound >= 60) fill.classList.add('fill-yellow');
  else if (pctRound >= 30) fill.classList.add('fill-orange');
  else fill.classList.add('fill-red');
}

function openLearnMoreModal() {
  const t = currentTurnover;
  const left = Math.max(t.required - t.wagered, 0);
  const pct = t.required > 0 ? Math.min((t.wagered / t.required) * 100, 100) : 100;
  const body = document.getElementById('learnMoreBody');
  body.innerHTML = `
    <div class="lm-reason">${t.reason}</div>
    <div class="lm-progress-summary">
      <div class="lm-ps-row">
        <span>Wagered so far</span><strong>\u20b1${t.wagered.toLocaleString()}</strong>
      </div>
      <div class="lm-ps-row">
        <span>Total required</span><strong>\u20b1${t.required.toLocaleString()}</strong>
      </div>
      <div class="lm-ps-row lm-ps-highlight">
        <span>Still needed</span><strong>\u20b1${left.toLocaleString()}</strong>
      </div>
      <div class="lm-bar-mini">
        <div class="lm-bar-fill" style="width:${pct.toFixed(1)}%"></div>
      </div>
      <div style="text-align:right;font-size:0.75rem;color:var(--t2);margin-top:4px">${pct.toFixed(1)}% complete</div>
    </div>
    ${t.rules && t.rules.length ? `
      <div class="lm-rules-title">Rules that apply to your account</div>
      <ul class="modal-tc-list">
        ${t.rules.map(r => `<li class="modal-tc-item">${r}</li>`).join('')}
      </ul>
    ` : ''}
    <div class="lm-support">
      Still have questions?
      <button class="to-support-link" onclick="showToast('Support coming soon!','info'); closeLearnMoreModal()">Contact support \u2192</button>
    </div>`;
  document.getElementById('learnMoreModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeLearnMoreModal() {
  document.getElementById('learnMoreModal').classList.remove('show');
  document.body.style.overflow = '';
}

// ============================================================
// REWARDS PANEL & PAGE
// ============================================================
const REWARDS_MOCK = {
  offers: [
    { id: 'r1', icon: '\ud83c\udf81', tag: 'FIRST DEPOSIT', title: '100% First Deposit Bonus',
      desc: 'Deposit and get up to \u20b15,000 bonus with 40x turnover.' },
    { id: 'r2', icon: '\ud83d\udcb0', tag: 'RELOAD',        title: '80% Reload Bonus',
      desc: 'Get up to \u20b18,000 on your next deposit with 30x turnover.' },
    { id: 'r3', icon: '\ud83c\udfb0', tag: 'SLOTS',         title: '50% Bonus + 30 Free Spins',
      desc: 'Slots special: up to \u20b13,000 + 30 Free Spins with 35x turnover.' },
    { id: 'r4', icon: '\ud83d\udd04', tag: 'CASHBACK',      title: '30% Cashback Bonus',
      desc: 'Low requirement cashback up to \u20b12,000 with 20x turnover.' },
  ],
};

let rewardsPanelOpen = false;

function initRewards() {
  rewardsPanelOpen = false;
  renderRewardsPanel();
  renderRewardsPage();
  // Close on outside click
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('rewardsWrap');
    if (wrap && !wrap.contains(e.target) && rewardsPanelOpen) closeRewardsPanel();
  });
}

function toggleRewardsPanel() {
  rewardsPanelOpen = !rewardsPanelOpen;
  document.getElementById('rewardsPanel').classList.toggle('open', rewardsPanelOpen);
  if (rewardsPanelOpen) renderRewardsPanel();
}

function closeRewardsPanel() {
  rewardsPanelOpen = false;
  document.getElementById('rewardsPanel').classList.remove('open');
}

function renderRewardsPanel() {
  const t = currentTurnover;
  const hasActive = t && t.wagered >= 0 && t.required > 0 && (t.wagered / t.required) < 1;
  const pct = t.required > 0 ? Math.min((t.wagered / t.required) * 100, 100) : 0;

  let html = '';

  // Active bonus section
  if (hasActive) {
    html += `
      <div class="rp-section-lbl">Active WR Progress</div>
      <div class="to-card" style="margin: 0 16px 12px; max-width: none;">
        <div class="to-hdr-simple">
          <span class="to-warn-ico">⚠️</span>
          <span class="to-hdr-title">Wager Requirement</span>
        </div>
        <div class="to-req-amount">₱${t.required.toLocaleString()}</div>
        <div class="to-progress-wrap">
          <div class="to-progress-row">
            <span class="to-progress-desc">Wager ₱${t.required.toLocaleString()} to withdraw</span>
            <span class="to-pct-txt">${pct.toFixed(2)}%</span>
          </div>
          <div class="to-bar-track">
            <div class="to-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <button class="to-learn-more-btn" onclick="closeRewardsPanel(); openLearnMoreModal();">Learn more →</button>
      </div>`;
  }

  // Available offers
  html += `<div class="rp-section-lbl">${hasActive && t.wagered > 0 ? 'More Offers' : 'Available Offers'}</div>`;
  REWARDS_MOCK.offers.forEach(o => {
    html += `
      <div class="rp-offer-item" onclick="navigateTo('wallet'); switchWalletTab('deposit'); closeRewardsPanel()">
        <span class="rp-offer-icon">${o.icon}</span>
        <div class="rp-offer-body">
          <div class="rp-offer-tag">${o.tag}</div>
          <div class="rp-offer-title">${o.title}</div>
        </div>
        <span class="rp-offer-arrow">›</span>
      </div>`;
  });

  document.getElementById('rpBody').innerHTML = html;
}

function renderRewardsPage() {
  const t = currentTurnover;
  const pct = t.required > 0 ? Math.min((t.wagered / t.required) * 100, 100) : 0;
  const hasActive = t.wagered > 0 && pct < 100;

  let html = '';

  if (hasActive) {
    html += `
      <div class="rwd-section">
        <div class="rwd-section-hdr">Active WR Progress</div>
        <div class="to-card" style="max-width: 500px; margin: 0;">
          <div class="to-hdr-simple">
            <span class="to-warn-ico">⚠️</span>
            <span class="to-hdr-title">Wager Requirement</span>
          </div>
          <div class="to-req-amount">₱${t.required.toLocaleString()}</div>
          <div class="to-progress-wrap">
            <div class="to-progress-row">
              <span class="to-progress-desc">Wager ₱${t.required.toLocaleString()} to withdraw</span>
              <span class="to-pct-txt">${pct.toFixed(2)}%</span>
            </div>
            <div class="to-bar-track">
              <div class="to-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>
          <button class="to-learn-more-btn" onclick="openLearnMoreModal()">Learn more →</button>
        </div>
      </div>`;
  }

  html += `<div class="rwd-section">
    <div class="rwd-section-hdr">All Promotions</div>
    <div class="rwd-offers-grid">`;
  REWARDS_MOCK.offers.forEach(o => {
    html += `
      <div class="rwd-offer-card" onclick="navigateTo('wallet'); switchWalletTab('deposit')">
        <div class="rwd-offer-icon">${o.icon}</div>
        <div class="rwd-offer-tag">${o.tag}</div>
        <div class="rwd-offer-title">${o.title}</div>
        <div class="rwd-offer-desc">${o.desc}</div>
        <button class="rwd-offer-cta">Deposit Now \u2192</button>
      </div>`;
  });
  html += '</div></div>';

  const wrap = document.getElementById('rewardsPageWrap');
  if (wrap) wrap.innerHTML = html;
}
