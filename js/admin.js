const MOCK_PROMOTIONS = [
  { id: 'PRM-20260408-0001', name: 'Welcome Bonus 100%', type: 'Deposit Bonus', start: '2026-03-15', end: '2026-12-31', cost: '$125,000.00', claims: '1250 / 1180', status: true, createdBy: 'Admin', updatedAt: '2026-04-08 10:25:44', remark: 'Initial release' },
  { id: 'PRM-20260408-0002', name: 'Reload Bonus 50%', type: 'Deposit Bonus', start: '2026-03-20', end: '2026-06-01', cost: '$57,500.00', claims: '890 / 756', status: true, createdBy: 'Admin', updatedAt: '2026-04-08 11:12:10', remark: 'Spring promotion' },
  { id: 'PRM-20260408-0003', name: 'VIP Exclusive Bonus', type: 'Deposit Bonus', start: '2026-04-01', end: '2026-05-01', cost: '$15,000.00', claims: '23 / 18', status: false, createdBy: 'Admin', updatedAt: '2026-04-08 14:05:30', remark: 'Inactive' },
];

function navigateTo(route, event) {
  if (event) event.preventDefault();
  
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-route="${route}"]`)?.classList.add('active');

  const content = document.getElementById('contentArea');

  switch (route) {
    case 'promotions':
      renderPromotionsList(content);
      break;
    case 'reward-history':
      renderRewardHistory(content);
      break;
    case 'create-promo':
      renderCreateStepper(content);
      break;
    default:
      renderPromotionsList(content);
  }
}

function renderPromotionsList(container) {
  const filters = {
    search: document.getElementById('filterSearch')?.value || '',
    start: document.getElementById('filterStart')?.value || '',
    end: document.getElementById('filterEnd')?.value || '',
    type: document.getElementById('filterType')?.value || 'All',
    status: document.getElementById('filterStatus')?.value || 'All'
  };

  const filtered = MOCK_PROMOTIONS.filter(p => {
    // Search
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    // Type
    if (filters.type !== 'All' && p.type !== filters.type) return false;
    // Status
    if (filters.status !== 'All') {
      const s = filters.status === 'Enabled';
      if (p.status !== s) return false;
    }
    // Date Overlap logic: (PStart <= FEnd) && (PEnd >= FStart)
    if (filters.start || filters.end) {
      const pStart = new Date(p.start);
      const pEnd = new Date(p.end);
      const fStart = filters.start ? new Date(filters.start) : new Date('1900-01-01');
      const fEnd = filters.end ? new Date(filters.end) : new Date('2100-12-31');
      if (!(pStart <= fEnd && pEnd >= fStart)) return false;
    }
    return true;
  });

  let rows = filtered.map((p, i) => {
    const actionIcons = p.status 
      ? `
        <span class="action-icon" onclick="duplicatePromotion('${p.id}')" title="Duplicate">👯</span>
        <span class="action-icon" onclick="viewPromotion('${p.id}')" title="View">👁️</span>
      `
      : `
        <span class="action-icon" onclick="editPromotion('${p.id}')" title="Edit">📝</span>
        <span class="action-icon" onclick="duplicatePromotion('${p.id}')" title="Duplicate">👯</span>
        <span class="action-icon" onclick="viewPromotion('${p.id}')" title="View">👁️</span>
      `;

    return `
      <tr>
        <td style="font-family:monospace;font-size:0.75rem;color:var(--text-gray)">${p.id}</td>
        <td>
          <a class="promo-title-link" onclick="viewPromotion('${p.id}')">${p.name}</a>
        </td>
        <td>${p.type}</td>
        <td style="font-size:0.8rem">${p.start} ~ ${p.end}</td>
        <td>${p.cost}</td>
        <td>${p.claims}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <label class="toggle">
              <input type="checkbox" ${p.status ? 'checked' : ''} onchange="toggleStatusRequest('${p.id}', ${p.status}, this)">
              <span class="slider"></span>
            </label>
            <span style="font-size:0.8rem;color:${p.status ? '#10B981' : 'var(--text-light)'}; font-weight:500">
              ${p.status ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </td>
        <td style="font-size:0.8rem">${p.createdBy}</td>
        <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.75rem; color:var(--text-gray)" title="${p.remark || ''}">
          ${p.remark || '-'}
        </td>
        <td style="font-size:0.75rem;color:var(--text-gray)">${p.updatedAt}</td>
        <td>
          <div style="display:flex;gap:4px;color:var(--text-gray);">
            ${actionIcons}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="sp-header">
      <div>
        <h2 class="sp-title">Promotion List</h2>
        <div class="sp-subtitle">Manage promotion configurations and eligibility rules.</div>
      </div>
      <button class="btn btn-primary" onclick="navigateTo('create-promo')">
        <span style="font-size:1.1em;font-weight:400;line-height:1">+</span> Create Promotion
      </button>
    </div>
    
    <div class="filter-section" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px">
      <div class="filter-item" style="grid-column: span 2">
        <label>Search Promotion</label>
        <input type="text" id="filterSearch" class="filter-input" placeholder="🔍 Search name or ID..." value="${filters.search}" oninput="renderPromotionsList(document.getElementById('contentArea'))" />
      </div>
      
      <div class="filter-item">
        <label>Promotion Type</label>
        <select id="filterType" class="filter-input" onchange="renderPromotionsList(document.getElementById('contentArea'))">
          <option ${filters.type === 'All' ? 'selected' : ''}>All</option>
          <option ${filters.type === 'Deposit Bonus' ? 'selected' : ''}>Deposit Bonus</option>
          <option ${filters.type === 'Reload Bonus' ? 'selected' : ''}>Reload Bonus</option>
        </select>
      </div>

      <div class="filter-item">
        <label>Status</label>
        <select id="filterStatus" class="filter-input" onchange="renderPromotionsList(document.getElementById('contentArea'))">
          <option ${filters.status === 'All' ? 'selected' : ''}>All</option>
          <option ${filters.status === 'Enabled' ? 'selected' : ''}>Enabled</option>
          <option ${filters.status === 'Disabled' ? 'selected' : ''}>Disabled</option>
        </select>
      </div>

      <div class="filter-item">
        <label>Start From</label>
        <input type="date" id="filterStart" class="filter-input" value="${filters.start}" onchange="renderPromotionsList(document.getElementById('contentArea'))" />
      </div>
      <div class="filter-item">
        <label>End Before</label>
        <input type="date" id="filterEnd" class="filter-input" value="${filters.end}" onchange="renderPromotionsList(document.getElementById('contentArea'))" />
      </div>

      <div class="filter-item" style="grid-column: span 2; justify-content: flex-end; display: flex; padding-top: 8px; border-top: 1px dashed var(--border)">
        <button class="btn btn-primary" style="width:200px" onclick="renderPromotionsList(document.getElementById('contentArea'))">Apply Filters</button>
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="tech-table">
          <thead>
            <tr>
              <th>Promotion ID</th>
              <th>Promotion Name</th>
              <th>Type</th>
              <th>Period</th>
              <th>Bonus Cost</th>
              <th>Claims / Participants</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Remark</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows : '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-light)">No promotions found matching filters</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/** 
 * Status Toggle & Confirmation Modal Logic
 */
function toggleStatusRequest(id, currentStatus, checkbox) {
  // Prevent immediate toggle
  checkbox.checked = currentStatus;
  
  const promo = MOCK_PROMOTIONS.find(p => p.id === id);
  if (!promo) return;

  const modalContainer = document.getElementById('modalContainer');
  const modalBox = document.getElementById('modalBox');
  
  if (currentStatus) {
    // Attempting to DISABLE
    modalContainer.className = 'modal-overlay modal-warning open';
    modalBox.innerHTML = `
      <div class="modal-header">⚠️ Confirm Deactivation</div>
      <div class="modal-body">
        <p style="margin-bottom:12px">Are you sure you want to deactivate <strong>"${promo.name}"</strong>?</p>
        <ul style="font-size:0.85rem; color:var(--text-gray); margin-bottom:20px">
          <li>• <b>Immediate stop</b> for new player participation</li>
          <li>• <b>Prevent</b> creation of new promotion instances</li>
          <li>• <span style="color:#ef4444">Existing active instances will NOT be affected and can still be completed</span></li>
        </ul>
        
        <div style="margin-bottom:20px">
          <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:8px">Internal Remark (Reason) *</label>
          <textarea id="statusRemark" class="filter-input" style="width:100%; height:80px; padding:10px" placeholder="Explain why this promotion is being disabled... (Min 2 chars)"></textarea>
        </div>

        <div class="info-box" style="background:#fefce8; border:1px solid #fef08a; padding:12px; font-size:0.8rem; color:#854d0e">
          <strong>Notice:</strong><br>
          Disabling a promotion settings does NOT terminate active player instances. To force-close specific player wagering, please use the <strong>Reward History</strong> page.
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" style="background:#d97706; border-color:#d97706" onclick="confirmStatusChange('${id}', false)">Confirm Disable</button>
      </div>
    `;
  } else {
    // Attempting to ENABLE
    modalContainer.className = 'modal-overlay modal-success open';
    modalBox.innerHTML = `
      <div class="modal-header">✅ Confirm Activation</div>
      <div class="modal-body">
        <p style="margin-bottom:12px">Are you sure you want to activate <strong>"${promo.name}"</strong>?</p>
        <ul style="font-size:0.85rem; color:var(--text-gray); margin-bottom:20px">
          <li>✓ Enable promotion for eligible new players</li>
          <li>✓ Allow qualified players to claim this reward</li>
          <li>✓ Display promotion on player front-end</li>
        </ul>

        <div style="margin-bottom:20px">
          <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:8px">Activation Remark (Optional)</label>
          <textarea id="statusRemark" class="filter-input" style="width:100%; height:80px; padding:10px" placeholder="Notes for activation..."></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" style="background:#10B981; border-color:#10B981" onclick="confirmStatusChange('${id}', true)">Confirm Enable</button>
      </div>
    `;
  }
}

function confirmStatusChange(id, newStatus) {
  const remark = document.getElementById('statusRemark').value.trim();
  
  if (!newStatus && remark.length < 2) {
    alert('Please provide a remark for deactivation (minimum 2 characters).');
    return;
  }

  const promo = MOCK_PROMOTIONS.find(p => p.id === id);
  if (promo) {
    promo.status = newStatus;
    promo.remark = remark || promo.remark;
    promo.updatedAt = new Date().toLocaleString();
  }
  closeModal();
  renderPromotionsList(document.getElementById('contentArea'));
}

function closeModal() {
  const modal = document.getElementById('modalContainer');
  if (modal) modal.classList.remove('open');
}

/**
 * Promotion Action Functions
 */
function editPromotion(id) {
  const promo = MOCK_PROMOTIONS.find(p => p.id === id);
  if (promo.status) {
    alert("Active promotions cannot be edited directly. Please use 'Duplicate' to create a draft for modifications.");
    return;
  }
  navigateTo('create-promo');
  // In a real app, populate form with promo data
}

function viewPromotion(id) {
  navigateTo('create-promo');
  // In a real app, set form to read-only mode
  setTimeout(() => {
    const title = document.getElementById('f_title');
    if (title) {
      title.value = MOCK_PROMOTIONS.find(p => p.id === id).name;
      // Disable all inputs for "View" mode
      document.querySelectorAll('.form-control, .radio-input, .checkbox-label input').forEach(el => el.disabled = true);
    }
  }, 50);
}

function duplicatePromotion(id) {
  const promo = MOCK_PROMOTIONS.find(p => p.id === id);
  const newPromo = { 
    ...promo, 
    id: 'PRM-' + Date.now().toString().slice(-8), 
    name: promo.name + ' (Copy)', 
    status: false,
    claims: '0 / 0',
    cost: '$0.00',
    remark: 'Draft - Duplicated from ' + promo.id
  };
  MOCK_PROMOTIONS.unshift(newPromo);
  renderPromotionsList(document.getElementById('contentArea'));
  alert("Promotion duplicated and saved as Disabled draft. You may now perform further edits.");
}

let currentStep = 1;

function renderCreateStepper(container) {
  currentStep = 1;
  updateStepperUI(container);
}

function updateStepperUI(container) {
  const steps = [
    { num: 1, title: 'Basic Setup' },
    { num: 2, title: 'Condition' },
    { num: 3, title: 'Reward & WR' },
    { num: 4, title: 'Info / Announcement' }
  ];

  let stepperNav = `<div class="stepper-nav">`;
  steps.forEach((s, i) => {
    let stateClass = '';
    if (s.num === currentStep) stateClass = 'active';
    else if (s.num < currentStep) stateClass = 'completed';
    
    stepperNav += `
      <div class="step-item ${stateClass}">
        <div class="step-circle">${s.num < currentStep ? '✓' : s.num}</div>
        <span>${s.title}</span>
      </div>
    `;
    if (i < steps.length - 1) {
      stepperNav += `<div class="step-line ${s.num < currentStep ? 'completed' : ''}"></div>`;
    }
  });
  stepperNav += `</div>`;

  // Step 1: Basic Setup (Figma 2)
  const step1 = `
    <div class="step-content ${currentStep === 1 ? 'active' : ''}">
      <h3 style="font-size:1.25rem;margin-bottom:4px">Basic Setup</h3>
      <p style="color:var(--text-gray);font-size:0.85rem;margin-bottom:24px">Define the basic information and timeline for this promotion</p>
      
      <div class="form-group">
        <label class="form-label">Promotion Name <span class="req">*</span></label>
        <input type="text" class="form-control" placeholder="e.g. Welcome Bonus 100%" id="f_title" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Promotion Type <span class="req">*</span></label>
        <input type="text" class="form-control" value="Deposit Bonus" readonly style="background:#f8fafc" />
        <span class="form-sublabel">V1 MVP only supports Deposit Bonus. New promotions are created as Disabled by default.</span>
      </div>
      
      <div class="form-group">
        <label class="form-label">Promotion Period Type <span class="req">*</span></label>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" name="period" value="longterm" checked class="radio-input" onchange="togglePeriodFields(this)"> No End Date (Long-term)</label>
          <label class="radio-label"><input type="radio" name="period" value="custom" class="radio-input" onchange="togglePeriodFields(this)"> Custom Period</label>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Start Time <span class="req">*</span></label>
          <input type="datetime-local" class="form-control" value="2026-04-08T06:34" />
        </div>
        <div class="form-group" id="endTimeGroup" style="display:none">
          <label class="form-label">End Time <span class="req">*</span></label>
          <input type="datetime-local" class="form-control" />
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Internal Remark</label>
        <textarea class="form-control" rows="3" placeholder="Internal notes (not visible to players)"></textarea>
      </div>
    </div>
  `;

  // Step 2: Condition (Figma 3)
  const step2 = `
    <div class="step-content ${currentStep === 2 ? 'active' : ''}">
      <h3 style="font-size:1.25rem;margin-bottom:4px">Condition</h3>
      <p style="color:var(--text-gray);font-size:0.85rem;margin-bottom:24px">Define eligibility criteria and player scope for this promotion</p>
      
      <div class="form-group">
        <label class="form-label">Deposit Count Condition <span class="req">*</span></label>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" name="dep_cond" checked class="radio-input"> Any Deposit</label>
          <label class="radio-label"><input type="radio" name="dep_cond" class="radio-input"> First Deposit</label>
          <label class="radio-label" style="color:var(--text-light)"><input type="radio" disabled class="radio-input"> Nth Deposit (Coming soon)</label>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Min Deposit <span class="req">*</span></label>
          <input type="number" class="form-control" value="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Max Deposit</label>
          <input type="number" class="form-control" />
        </div>
      </div>
      
      <div class="form-group" style="max-width:320px">
        <label class="form-label">Max Claims Per User <span class="req">*</span></label>
        <input type="number" class="form-control" value="1" />
      </div>
      
      <div class="form-group">
        <label class="form-label">Eligible Payment Methods</label>
        <div class="checkbox-group">
          <label class="checkbox-label"><input type="checkbox"> Credit Card</label>
          <label class="checkbox-label"><input type="checkbox"> E-Wallet</label>
          <label class="checkbox-label"><input type="checkbox"> Bank Transfer</label>
          <label class="checkbox-label"><input type="checkbox"> Crypto</label>
          <label class="checkbox-label"><input type="checkbox"> PayPal</label>
          <label class="checkbox-label"><input type="checkbox"> Other</label>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Player Scope <span class="req">*</span></label>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" name="scope" value="all" checked class="radio-input" onchange="toggleScopeFields(this)"> All Players</label>
          <label class="radio-label"><input type="radio" name="scope" value="include" class="radio-input" onchange="toggleScopeFields(this)"> Include Specific Players</label>
          <label class="radio-label"><input type="radio" name="scope" value="exclude" class="radio-input" onchange="toggleScopeFields(this)"> Exclude Specific Players</label>
        </div>
      </div>

      <div class="form-group" id="playerListGroup" style="display:none">
        <label class="form-label" id="playerListLabel">Player IDs (one per line)</label>
        <textarea class="form-control" rows="5" id="f_player_ids" placeholder="Enter Player IDs to include/exclude, one per line"></textarea>
        <div id="playerScopeNote" style="font-size:0.8rem; color:var(--text-gray); margin-top:8px"></div>
      </div>
    </div>
  `;


  // Step 3: Reward & WR (Figma 4 & 5)
  const step3 = `
    <div class="step-content ${currentStep === 3 ? 'active' : ''}">
      <h3 style="font-size:1.25rem;margin-bottom:4px">Reward & WR</h3>
      <p style="color:var(--text-gray);font-size:0.85rem;margin-bottom:24px">Configure bonus rewards, wagering requirements, and game contribution rates</p>
      
      <div style="font-weight:600;font-size:0.95rem;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px">Bonus Configuration</div>
      <div class="form-group">
        <label class="form-label">Bonus Value Type <span class="req">*</span></label>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" name="bval" value="fixed" class="radio-input" onchange="toggleBonusType(this)"> Fixed Amount</label>
          <label class="radio-label"><input type="radio" name="bval" value="percent" checked class="radio-input" onchange="toggleBonusType(this)"> Percentage</label>
        </div>
      </div>

      <div id="bonusFixedGroup" style="display:none">
        <div class="form-group">
          <label class="form-label">Bonus Amount <span class="req">*</span></label>
          <input type="number" class="form-control" placeholder="e.g. 500" id="f_bonus_amt" />
        </div>
      </div>

      <div id="bonusPercentGroup">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Bonus Percentage <span class="req">*</span></label>
            <div style="position:relative">
              <input type="number" class="form-control" style="padding-right:30px" id="f_bonus_pct" value="100" />
              <span style="position:absolute;right:12px;top:10px;color:var(--text-gray)">%</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Bonus Cap</label>
            <input type="number" class="form-control" id="f_bonus_cap" placeholder="e.g. 5000" />
          </div>
        </div>
      </div>
      
      <div style="font-weight:600;font-size:0.95rem;margin-top:32px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px">Wagering Requirements</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">WR Model <span class="req">*</span></label>
          <select class="form-control" id="f_wr_model">
            <option>Principal + Bonus</option>
            <option>Principal</option>
            <option>Bonus</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">WR Multiplier <span class="req">*</span></label>
          <div style="position:relative">
            <input type="number" class="form-control" value="30" style="padding-right:30px" id="f_wr_mult" onkeyup="previewCard()" />
            <span style="position:absolute;right:12px;top:10px;color:var(--text-gray)">x</span>
          </div>
        </div>
      </div>
      
      <div style="font-weight:600;font-size:0.95rem;margin-top:32px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px">Contribution Configuration</div>
      <label class="form-label">Category Defaults <span class="req">*</span></label>
      <div style="background:#f8fafc;padding:16px;border-radius:var(--radius-sm);border:1px solid var(--border);margin-bottom:8px">
        <div class="form-row" style="margin-bottom:16px">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-sublabel" style="margin-bottom:4px">Slots</label>
            <div style="position:relative">
              <input type="number" class="form-control" value="100"/>
              <span style="position:absolute;right:12px;top:10px;color:var(--text-gray);font-size:0.8rem">%</span>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-sublabel" style="margin-bottom:4px">Table Games</label>
            <div style="position:relative">
              <input type="number" class="form-control" value="20"/>
              <span style="position:absolute;right:12px;top:10px;color:var(--text-gray);font-size:0.8rem">%</span>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-sublabel" style="margin-bottom:4px">Live Casino</label>
            <div style="position:relative">
              <input type="number" class="form-control" value="10"/>
              <span style="position:absolute;right:12px;top:10px;color:var(--text-gray);font-size:0.8rem">%</span>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-sublabel" style="margin-bottom:4px">Virtual Sports</label>
            <div style="position:relative">
              <input type="number" class="form-control" value="0"/>
              <span style="position:absolute;right:12px;top:10px;color:var(--text-gray);font-size:0.8rem">%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <label class="form-label" style="margin:0">Provider Overrides</label>
        <button class="btn btn-outline" style="padding:4px 12px;border-radius:20px; font-size:0.8rem" onclick="addProviderRow()">+ Add Provider</button>
      </div>
      <div id="providerOverridesContainer" style="margin-bottom:16px">
        <div style="font-size:0.85rem; color:var(--text-light); padding:8px 0;">No provider overrides added.</div>
      </div>
      
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <label class="form-label" style="margin:0">Game Overrides</label>
        <button class="btn btn-outline" style="padding:4px 12px;border-radius:20px; font-size:0.8rem" onclick="addGameRow()">+ Add Game</button>
      </div>
      <div id="gameOverridesContainer" style="margin-bottom:16px">
        <div style="font-size:0.85rem; color:var(--text-light); padding:8px 0;">No game overrides added.</div>
      </div>
      
      <div class="info-box">
        Override Priority: 1. Game | 2. Provider | 3. Category Default
      </div>
    </div>
  `;

  // Step 4: Info / Announcement (Complete Content & Rich Text Editor)
  const step4 = `
    <div class="step-content ${currentStep === 4 ? 'active' : ''}">
      <h3 style="font-size:1.25rem;margin-bottom:4px">Info / Announcement</h3>
      <p style="color:var(--text-gray);font-size:0.85rem;margin-bottom:24px">Customize promotion appearance and detailed terms. Supports Markdown for complex clauses.</p>
      
      <div style="display:flex;gap:32px;align-items:flex-start">
        <div style="flex:1;">
          <!-- Field 1,2,3: Basic Card Info -->
          <div style="font-weight:600;font-size:0.95rem;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px">Card Appearance</div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">Promotion Tag <small>(e.g. RELOAD)</small></label>
              <input type="text" class="form-control" placeholder="FIRST DEPOSIT" id="f_promo_tag" onkeyup="previewCard()" />
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">Card Icon</label>
              <select class="form-control" id="f_icon" onchange="previewCard()">
                <option>🎁</option><option>💰</option><option>🎰</option><option>🃏</option><option>🏆</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Main Title <span class="req">*</span></label>
            <input type="text" class="form-control" placeholder="e.g. 100% First Deposit Bonus" id="f_tag" onkeyup="previewCard()" />
          </div>
          <div class="form-group">
            <label class="form-label">Subtext / Summary <span class="req">*</span></label>
            <input type="text" class="form-control" placeholder="e.g. Up to ₱5,000 &middot; 40x Turnover" id="f_desc" onkeyup="previewCard()" />
          </div>

          <!-- Field 4: Info Box -->
          <div style="font-weight:600;font-size:0.95rem;margin:32px 0 16px;border-bottom:1px solid var(--border);padding-bottom:8px">ℹ️ Deposit Page Info Box</div>
          <div class="form-group">
             <textarea class="form-control" rows="2" id="f_info_box" placeholder="Your deposit and bonus will be credited..." onkeyup="previewCard()"></textarea>
             <span class="form-sublabel">This descriptive text will appear in the info box on the deposit page.</span>
          </div>

          <!-- Field 5: Bonus T&Cs Rich Editor -->
          <div style="font-weight:600;font-size:0.95rem;margin:32px 0 16px;border-bottom:1px solid var(--border);padding-bottom:8px">Promotion Terms & Conditions (Detail Modal)</div>
          <div class="editor-container">
             <div class="editor-toolbar">
                <button title="Bold" class="editor-btn" onclick="insertMarkdown('**', '**')">B</button>
                <button title="Italic" class="editor-btn" onclick="insertMarkdown('*', '*')"><i>I</i></button>
                <div style="height:20px; width:1px; background:var(--border); margin:0 4px"></div>
                <select class="editor-select" id="editorSize">
                  <option value="1rem">Normal</option>
                  <option value="1.25rem">Medium</option>
                  <option value="1.5rem">Large</option>
                </select>
                <button class="btn btn-primary" style="padding:4px 8px; font-size:0.75rem" onclick="applyEditorStyle('size')">Apply</button>
                <div style="height:20px; width:1px; background:var(--border); margin:0 4px"></div>
                <input type="color" class="editor-color" id="editorColor" value="#1D4ED8">
                <button class="btn btn-primary" style="padding:4px 8px; font-size:0.75rem" onclick="applyEditorStyle('color')">Apply Color</button>
                <button title="Link" class="editor-btn" onclick="insertMarkdown('[', '](https://)')">🔗</button>
             </div>
             <textarea class="editor-area" id="f_tnc_md" placeholder="Enter promotion terms and conditions..." onkeyup="previewCard()"></textarea>
             <div class="editor-footer">Formatting Guide: **bold**, *italic*, [text](url). Use Apply to insert styled spans.</div>
          </div>
        </div>
        
        <!-- Live Preview Panel (Refined Card) -->
        <div class="preview-panel" style="position:sticky; top:20px; width:340px; background:#f8fafc; border:1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <h4 style="margin-bottom:16px;color:var(--text-dark);font-size:0.95rem">App Overall Preview</h4>
          <div style="background:#f1f5f9; padding:20px; border-radius:12px; display:flex; flex-direction:column; gap:16px">
             <!-- Card Section -->
             <div>
                <p style="font-size:0.7rem; color:var(--text-gray); margin-bottom:8px; font-weight:600">Promotion Card (在列表頁)</p>
                <div class="preview-card" style="display:flex; flex-direction:column; gap:8px; padding:16px; border:1px solid #e2e8f0; position:relative; overflow:hidden; background:#fff">
                    <div id="p_badge" class="promo-badge">FIRST DEPOSIT</div>
                    <div style="display:flex; gap:12px; align-items:center; margin-top:8px">
                      <div id="p_card_icon" style="font-size:1.8rem">🎁</div>
                      <div style="flex:1">
                          <div style="font-weight:800; font-size:1rem; color:#1e293b; line-height:1.2" id="p_tag">Card Title</div>
                          <div style="font-size:0.8rem; color:#64748b; margin-top:4px" id="p_desc">Card Subtext</div>
                      </div>
                    </div>
                    <div style="background:var(--primary); color:#fff; text-align:center; padding:10px; border-radius:8px; font-size:0.85rem; font-weight:700; margin-top:12px">
                      Deposit Now →
                    </div>
                </div>
             </div>
             
             <!-- Info Box Section -->
             <div>
                <p style="font-size:0.7rem; color:var(--text-gray); margin-bottom:8px; font-weight:600">Deposit Info Box (在存款頁)</p>
                <div style="padding:12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; font-size:0.75rem; color:#1e40af; display:flex; gap:8px">
                    <div style="font-weight:bold">ℹ️</div>
                    <div id="p_info_box">Deposit info box text appears here...</div>
                </div>
             </div>

             <!-- T&C Detail Section -->
             <div>
                <p style="font-size:0.7rem; color:var(--text-gray); margin-bottom:8px; font-weight:600">Detailed T&C (彈窗內文)</p>
                <div id="p_tnc_content" style="background:#fff; border:1px solid var(--border); border-radius:8px; padding:12px; font-size:0.7rem; line-height:1.6; min-height:100px; max-height:200px; overflow-y:auto; color:var(--text-dark)">
                   Markdown Content Preview...
                </div>
             </div>
          </div>
          <p style="font-size:0.7rem; color:var(--text-light); text-align:center; margin-top:12px">手機端前台同步預覽 (如 Image 3, 4, 5)</p>
        </div>
      </div>
    </div>
  `;



  container.innerHTML = `
    <div class="sp-header" style="align-items:flex-start;margin-bottom:16px">
      <div>
        <a href="#" onclick="navigateTo('promotions')" style="color:var(--text-gray);text-decoration:none;font-size:0.85rem;display:inline-flex;align-items:center;gap:4px;margin-bottom:8px">← Back to Promotion List</a>
        <h2 class="sp-title">Create Promotion</h2>
        <div class="sp-subtitle">Complete the following steps to set up your Deposit Bonus promotion</div>
      </div>
    </div>
    
    <div class="card" style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;">
      <div style="padding: 32px 40px">
        ${stepperNav}
        <div style="width:100%;max-width:800px;margin:0 auto">
          ${step1}
          ${step2}
          ${step3}
          ${step4}
        </div>
      </div>
      
      <div style="padding: 20px 40px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center">
        <button class="btn btn-outline" onclick="${currentStep > 1 ? 'changeStep(-1)' : 'navigateTo(&#39;promotions&#39;)'}">
          ${currentStep > 1 ? '← Back' : 'Cancel'}
        </button>
        <div style="display:flex;gap:12px">
          <button class="btn btn-outline">Save</button>
          ${currentStep < 4 ? `<button class="btn btn-primary" onclick="changeStep(1)">Next →</button>` : `<button class="btn btn-primary" style="background:#10B981;border-color:#10B981" onclick="submitPromotion()">Publish</button>`}
        </div>
      </div>
    </div>
  `;
  
  if(currentStep === 4) previewCard();
}

/**
 * Step Interaction Logic
 */
function toggleBonusType(radio) {
  document.getElementById('bonusFixedGroup').style.display = radio.value === 'fixed' ? 'block' : 'none';
  document.getElementById('bonusPercentGroup').style.display = radio.value === 'percent' ? 'block' : 'none';
}

function togglePeriodFields(radio) {
  const endTimeGroup = document.getElementById('endTimeGroup');
  if (endTimeGroup) {
    endTimeGroup.style.display = radio.value === 'custom' ? 'block' : 'none';
  }
}

function toggleScopeFields(radio) {
  const playerListGroup = document.getElementById('playerListGroup');
  const playerListLabel = document.getElementById('playerListLabel');
  const playerScopeNote = document.getElementById('playerScopeNote');
  if (playerListGroup && playerListLabel) {
    if (radio.value === 'all') {
      playerListGroup.style.display = 'none';
    } else {
      playerListGroup.style.display = 'block';
      playerListLabel.textContent = radio.value === 'include' ? 'Player IDs to Include (one per line)' : 'Player IDs to Exclude (one per line)';
      playerScopeNote.textContent = radio.value === 'include' ? 'Only players in this list can claim this promotion' : 'Players in this list cannot claim this promotion';
    }
  }
}

function addProviderRow() {
  const container = document.getElementById('providerOverridesContainer');
  if (container.querySelector('div[style*="var(--text-light)"]')) {
    container.innerHTML = '';
  }
  
  const div = document.createElement('div');
  div.className = 'form-row';
  div.style.marginBottom = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <select class="form-control" style="flex:2">
      <option disabled selected>Select Provider</option>
      <option>Pragmatic Play</option>
      <option>Evolution</option>
      <option>NetEnt</option>
      <option>Play'n GO</option>
      <option>Microgaming</option>
      <option>Playtech</option>
    </select>
    <div style="position:relative; flex:1">
      <input type="number" class="form-control" value="100" />
      <span style="position:absolute;right:12px;top:10px;color:var(--text-gray);font-size:0.8rem">%</span>
    </div>
    <button class="btn" style="color:#ef4444; border:none; background:none; font-size:1.2rem; cursor:pointer" onclick="this.parentElement.remove()">🗑️</button>
  `;
  container.appendChild(div);
}

function addGameRow() {
  const container = document.getElementById('gameOverridesContainer');
  if (container.querySelector('div[style*="var(--text-light)"]')) {
    container.innerHTML = '';
  }
  
  const div = document.createElement('div');
  div.className = 'form-row';
  div.style.marginBottom = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="form-control" placeholder="GAME CODE" style="flex:3" />
    <div style="position:relative; flex:1">
      <input type="number" class="form-control" value="100" />
      <span style="position:absolute;right:12px;top:10px;color:var(--text-gray);font-size:0.8rem">%</span>
    </div>
    <button class="btn" style="color:#ef4444; border:none; background:none; font-size:1.2rem; cursor:pointer" onclick="this.parentElement.remove()">🗑️</button>
  `;
  container.appendChild(div);
}

function addRuleRow() {
  const container = document.getElementById('rulesContainer');
  if (!container) return;
  const div = document.createElement('div');
  div.style.marginBottom = '8px';
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.innerHTML = `
    <input type="text" class="form-control f-rule" placeholder="Enter rule text..." />
    <button class="btn" style="color:#ef4444;border:none;background:none" onclick="this.parentElement.remove()">🗑️</button>
  `;
  container.appendChild(div);
}

function changeStep(dir) {
  currentStep += dir;
  if(currentStep < 1) currentStep = 1;
  if(currentStep > 4) currentStep = 4;
  updateStepperUI(document.getElementById('contentArea'));
}

function previewCard() {
  const pTag = document.getElementById('p_tag');
  const pDesc = document.getElementById('p_desc');
  const pIcon = document.getElementById('p_card_icon');
  const pInfoArr = document.getElementById('p_info_box');
  const pBadge = document.getElementById('p_badge');
  const pTnc = document.getElementById('p_tnc_content');
  
  if (document.getElementById('f_tag') && pTag) {
    pTag.textContent = document.getElementById('f_tag').value || 'Promotion Title';
  }
  if (document.getElementById('f_desc') && pDesc) {
    pDesc.textContent = document.getElementById('f_desc').value || 'Promotion details here...';
  }
  if (document.getElementById('f_icon') && pIcon) {
    pIcon.textContent = document.getElementById('f_icon').value;
  }
  if (document.getElementById('f_promo_tag') && pBadge) {
    pBadge.textContent = document.getElementById('f_promo_tag').value || 'FIRST DEPOSIT';
  }
  if (document.getElementById('f_info_box') && pInfoArr) {
    pInfoArr.textContent = document.getElementById('f_info_box').value || 'Deposit info box text...';
  }
  
  // Sync T&C Content with simple Markdown rendering
  if (document.getElementById('f_tnc_md') && pTnc) {
    const rawMatch = document.getElementById('f_tnc_md').value;
    if (!rawMatch) {
      pTnc.innerHTML = '<span style="color:var(--text-light)">Markdown Content Preview...</span>';
    } else {
      // Simple Markdown to HTML logic
      let html = rawMatch
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
        .replace(/\*(.*?)\*/g, '<i>$1</i>')   // Italic
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:var(--primary)">$1</a>') // Links
        .replace(/\n/g, '<br>');              // New lines
        
      // Also handle the custom span tags if added via Apply size/color
      // Since they are already valid HTML, we just keep them, but let's sanitize slightly if needed
      // For this prototype, we'll assume they are safe spans
      
      pTnc.innerHTML = html;
    }
  }
}

/**
 * Markdown Editor Helpers
 */
function insertMarkdown(openTag, closeTag) {
  const textarea = document.getElementById('f_tnc_md');
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);
  const before = text.substring(0, start);
  const after = text.substring(end);
  
  textarea.value = before + openTag + selectedText + closeTag + after;
  textarea.focus();
  textarea.setSelectionRange(start + openTag.length, end + openTag.length);
}

function applyEditorStyle(type) {
  if (type === 'size') {
    const size = document.getElementById('editorSize').value;
    insertMarkdown(`<span style="font-size: ${size}">`, '</span>');
  } else if (type === 'color') {
    const color = document.getElementById('editorColor').value;
    insertMarkdown(`<span style="color: ${color}">`, '</span>');
  }
}

function generateUniqueID() {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PRM-${date}-${random}`;
}

function submitPromotion() {
  const promoId = generateUniqueID();
  const now = new Date();
  const timestamp = now.getFullYear() + '-' + 
                    (now.getMonth()+1).toString().padStart(2, '0') + '-' + 
                    now.getDate().toString().padStart(2, '0') + ' ' + 
                    now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0') + ':' + 
                    now.getSeconds().toString().padStart(2, '0');

  const payload = {
    id: promoId,
    name: document.getElementById('f_tag')?.value || 'Title',
    type: 'Deposit Bonus',
    start: document.getElementById('f_start_date')?.value || new Date().toISOString().split('T')[0],
    end: document.getElementById('f_end_date')?.value || '2099-12-31',
    cost: '$0.00',
    claims: '0 / 0',
    ui: {
      tag: document.getElementById('f_promo_tag')?.value || 'FIRST DEPOSIT',
      icon: document.getElementById('f_icon')?.value || '🎁',
      title: document.getElementById('f_tag')?.value || 'Title',
      subtitle: document.getElementById('f_desc')?.value || 'Subtitle',
      infoBox: document.getElementById('f_info_box')?.value || '',
      tncMarkdown: document.getElementById('f_tnc_md')?.value || ''
    },
    reward: { 
      type: document.querySelector('input[name="bval"]:checked')?.value || 'percent',
      amount: document.getElementById('f_bonus_amt')?.value || 0,
      percentage: document.getElementById('f_bonus_pct')?.value || 100,
      cap: document.getElementById('f_bonus_cap')?.value || 0
    },
    wagering: {
      model: document.getElementById('f_wr_model')?.value || 'Principal + Bonus',
      multiplier: document.getElementById('f_wr_mult')?.value || 30
    },
    status: true,
    createdBy: 'Admin',
    updatedAt: timestamp
  };

  alert('Publish Success! Generated ID: ' + payload.id + '\n\nPayload structured for database:\n' + JSON.stringify(payload, null, 2));
  
  MOCK_PROMOTIONS.unshift(payload);
  navigateTo('promotions');
}

// =============================================================================
// REWARD HISTORY MODULE (PRD reward report.md)
// =============================================================================

// REWARD HISTORY MODULE (Optimized for PRD requirements)
const MOCK_REWARDS = [
  { 
    id: 'REC-001', 
    playerID: 'P-10001', 
    username: 'john_player', 
    type: 'Deposit Bonus', 
    name: 'First Deposit Bonus 100%', 
    source: 'Promotion Engine',
    hasWR: 'Yes', 
    amount: 1000, 
    principalAmount: 1000,
    bonusAmount: 1000,
    currentState: 'ACTIVE', 
    progress: 1250.50,
    target: 3000,
    grantedAt: '2024-04-06 14:30:00',
    endedAt: '-',
    operator: 'Admin',
    createdByType: 'System',
    instanceID: 'INS-778899',
    maxStakeLimit: '₱500.00',
    excludeRebate: 'No',
    remark: 'Auto-triggered by deposit',
    updatedBy: 'Admin', 
    lastUpdate: '2024-04-08 10:25:44' 
  },
  { 
    id: 'REC-002', 
    playerID: 'P-10002', 
    username: 'lucky_88', 
    type: 'Manual Bonus', 
    name: 'Loyalty Reward', 
    source: 'Manual Adjust',
    hasWR: 'No', 
    amount: 500, 
    principalAmount: 0,
    bonusAmount: 500,
    currentState: 'GRANTED', 
    progress: 0,
    target: 0,
    grantedAt: '2024-04-07 09:15:00',
    endedAt: '2024-04-07 09:15:00',
    operator: 'Admin',
    createdByType: 'Admin',
    instanceID: 'INS-VIP-01',
    maxStakeLimit: '-',
    excludeRebate: 'Yes',
    remark: 'VIP birthday bonus',
    updatedBy: 'Admin', 
    lastUpdate: '2024-04-07 09:15:00' 
  },
  { 
    id: 'REC-003', 
    playerID: 'P-10001', 
    username: 'john_player', 
    type: 'VIP Reward', 
    name: 'Monthly Bonus 75%', 
    source: 'VIP System',
    hasWR: 'Yes', 
    amount: 750, 
    principalAmount: 1000,
    bonusAmount: 750,
    currentState: 'PENDING', 
    progress: 0,
    target: 4000,
    grantedAt: '2024-04-01 00:00:00',
    endedAt: '-',
    operator: 'Admin',
    createdByType: 'System',
    instanceID: 'INS-778899',
    maxStakeLimit: '₱500.00',
    excludeRebate: 'No',
    remark: 'VIP Level 3 Reward',
    updatedBy: 'Admin', 
    lastUpdate: '2024-04-01 00:00:00' 
  }
];

function renderRewardHistory(container) {
  let rows = MOCK_REWARDS.map(r => {
    const isCloseable = r.hasWR === 'Yes' && r.currentState === 'ACTIVE';
    return `
      <tr>
        <td style="font-family:monospace;font-size:0.75rem">${r.id}</td>
        <td style="font-family:monospace;font-size:0.75rem">${r.playerID}</td>
        <td style="font-weight:600">${r.username}</td>
        <td><span class="status-badge" style="background:#f1f5f9;color:#475569;font-size:0.7rem">${r.type}</span></td>
        <td style="font-weight:500">${r.name}</td>
        <td style="text-align:center">${r.hasWR === 'Yes' ? '<span style="color:#10b981">● Yes</span>' : '<span style="color:var(--text-gray)">○ No</span>'}</td>
        <td style="font-weight:700">₱${r.amount.toLocaleString()}</td>
        <td>
          <span class="status-badge" style="background:${getStatusColor(r.currentState).bg};color:${getStatusColor(r.currentState).text}">
            ${r.currentState}
          </span>
        </td>
        <td style="font-size:0.75rem; color:var(--text-gray)">
          ${r.hasWR === 'Yes' ? `₱${r.progress.toLocaleString()} / ₱${r.target.toLocaleString()}` : '-'}
        </td>
        <td style="font-size:0.7rem">${r.grantedAt}</td>
        <td style="font-size:0.7rem">${r.endedAt}</td>
        <td>
          <div style="display:flex;gap:8px">
            <span class="action-icon" onclick="openRewardDetailDrawer('${r.id}')" title="View Detail">👁️</span>
            ${isCloseable ? `<span class="action-icon" style="color:#ef4444" onclick="showManualCloseModal('${r.id}')" title="Manual Close">⊗</span>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="sp-header">
      <div>
        <h2 class="sp-title">Reward History</h2>
        <div class="sp-subtitle">Unified reporting for player rewards and wagering status.</div>
      </div>
      <button class="btn btn-outline" onclick="alert('Export functionality coming soon.')">Export CSV</button>
    </div>

    <div class="filter-section" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px">
      <!-- Row 1: Combined Search & Core Filters -->
      <div class="filter-item" style="grid-column: span 2">
        <label>Search Record</label>
        <div style="display:flex; gap:0">
          <select class="filter-input" style="width:160px; border-radius:var(--radius-sm) 0 0 var(--radius-sm); border-right:none">
            <option>Player ID</option>
            <option>Promotion ID</option>
            <option>Reward Name</option>
          </select>
          <input type="text" class="filter-input" style="flex:1; border-radius:0 var(--radius-sm) var(--radius-sm) 0" placeholder="Enter keyword...">
        </div>
      </div>
      
      <div class="filter-item">
        <label>Has WR (Single)</label>
        <select class="filter-input">
          <option>All</option>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      ${createMultiSelectHTML('Reward Type (Multi)', ['Deposit Bonus', 'VIP Reward', 'Manual Bonus'], 'rewardType')}

      <!-- Row 2: Multi Selects & Dates -->
      ${createMultiSelectHTML('Current State (Multi)', ['ACTIVE', 'PENDING', 'COMPLETED', 'CLOSED', 'GRANTED'], 'currentState')}
      ${createMultiSelectHTML('Created By Type', ['System', 'Admin', 'Player'], 'createdBy')}

      <div class="filter-item">
        <label>Granted At Range</label>
        <div style="display:flex;gap:4px">
          <input type="date" class="filter-input" style="flex:1">
          <input type="date" class="filter-input" style="flex:1">
        </div>
      </div>
      <div class="filter-item">
        <label>Ended At Range</label>
        <div style="display:flex;gap:4px">
          <input type="date" class="filter-input" style="flex:1">
          <input type="date" class="filter-input" style="flex:1">
        </div>
      </div>

      <!-- Row 3: Action -->
      <div class="filter-item" style="grid-column: span 4; justify-content: flex-end; display: flex; padding-top: 8px; border-top: 1px dashed var(--border)">
        <button class="btn btn-primary" style="width:200px" onclick="renderRewardHistory(document.getElementById('contentArea'))">Search Records</button>
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="tech-table">
          <thead>
            <tr>
              <th>Reward ID</th>
              <th>Player ID</th>
              <th>Username</th>
              <th>Reward Type</th>
              <th>Reward Name</th>
              <th style="text-align:center">Has WR</th>
              <th>Reward Amount</th>
              <th>Current State</th>
              <th>WR Progress / Target</th>
              <th>Granted At</th>
              <th>Ended At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows : '<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--text-light)">No reward records found matching filters</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getStatusColor(status) {
  switch (status) {
    case 'ACTIVE': return { bg: '#d1fae5', text: '#065f46' };
    case 'PENDING': return { bg: '#fffbeb', text: '#92400e' };
    case 'GRANTED': return { bg: '#e0f2fe', text: '#0369a1' };
    case 'COMPLETED': return { bg: '#dcfce7', text: '#15803d' };
    case 'CLOSED': return { bg: '#fee2e2', text: '#991b1b' };
    default: return { bg: '#f1f5f9', text: '#475569' };
  }
}

function openRewardDetailDrawer(recordId) {
  const drawer = document.getElementById('drawerContainer');
  const content = document.getElementById('drawerContent');
  const reward = MOCK_REWARDS.find(r => r.id === recordId);

  if (!reward) return;

  drawer.classList.add('open');
  
  content.innerHTML = `
    <div style="padding:24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:#fff">
      <h3 style="margin:0">Reward Details</h3>
      <button onclick="closeDrawer()" style="background:none; border:none; font-size:1.5rem; cursor:pointer">×</button>
    </div>
    
    <div style="padding:24px">
      <!-- Section A: Basic Summary -->
      <div class="card" style="padding:24px; margin-bottom:24px; border:none; box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <h4 style="margin:0 0 16px 0; font-size:0.8rem; color:var(--text-gray); text-transform:uppercase; letter-spacing:1px">Section A: Basic Summary</h4>
        <div class="tech-item-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px">
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Reward ID</label><div style="font-weight:600; font-family:monospace">${reward.id}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Player ID</label><div style="font-weight:600">${reward.playerID}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Username</label><div style="font-weight:600">${reward.username}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Reward Type</label><div style="font-weight:600">${reward.type}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Reward Name</label><div style="font-weight:400">${reward.name}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Source Module</label><div style="font-weight:600">${reward.source}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Has WR</label><div style="font-weight:600">${reward.hasWR}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Current State</label><div><span class="status-badge" style="background:${getStatusColor(reward.currentState).bg};color:${getStatusColor(reward.currentState).text}">${reward.currentState}</span></div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Reward Amount</label><div style="font-weight:700; color:var(--primary)">₱${reward.amount.toLocaleString()}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Principal Amount</label><div style="font-weight:600">₱${reward.principalAmount.toLocaleString()}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Granted At</label><div style="font-weight:600">${reward.grantedAt}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Ended At</label><div style="font-weight:600">${reward.endedAt}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Promotion ID</label><div style="font-weight:600; font-family:monospace">${reward.instanceID}</div></div>
          <div><label style="font-size:0.7rem; color:var(--text-gray)">Operator</label><div style="font-weight:600">${reward.operator}</div></div>
          <div style="grid-column: span 2"><label style="font-size:0.7rem; color:var(--text-gray)">Remark</label><div style="font-weight:400; font-size:0.85rem">${reward.remark}</div></div>
        </div>
      </div>

      <!-- Section B: WR Details -->
      ${reward.hasWR === 'Yes' ? `
        <div class="card" style="padding:24px; margin-bottom:24px; border:none; border-left:4px solid var(--primary)">
          <h4 style="margin:0 0 16px 0; font-size:0.8rem; color:var(--text-gray); text-transform:uppercase; letter-spacing:1px">Section B: WR Details</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px">
            <div><label style="font-size:0.7rem; color:var(--text-gray)">WR Model</label><div style="font-weight:600">Principal + Bonus</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">WR Multiplier</label><div style="font-weight:600">20x</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">WR Target</label><div style="font-weight:600; font-family:monospace">₱${reward.target.toLocaleString()}</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">WR Progress</label><div style="font-weight:700">₱${reward.progress.toLocaleString()}</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">Remaining WR</label><div style="font-weight:600; color:#ef4444">₱${(reward.target - reward.progress).toLocaleString()}</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">Bonus Amount</label><div style="font-weight:600">₱${reward.bonusAmount.toLocaleString()}</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">Principal Amount</label><div style="font-weight:600">₱${reward.principalAmount.toLocaleString()}</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">Max Stake Limit</label><div style="font-weight:600">${reward.maxStakeLimit}</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">Exclude From Rebate</label><div style="font-weight:600">${reward.excludeRebate}</div></div>
          </div>
        </div>
      ` : ''}

      <!-- Section C: Action & Audit -->
      <div style="margin-top:24px">
        <h4 style="margin:0 0 16px 0; font-size:0.8rem; color:var(--text-gray); text-transform:uppercase; letter-spacing:1px">Section C: Action & Audit</h4>
        
        <div class="card" style="padding:16px; background:#f8fafc; border:1px solid #e2e8f0; font-size:0.85rem; margin-bottom:16px">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px">
            <div><label style="font-size:0.7rem; color:var(--text-gray)">Close Reason</label><div style="font-weight:600">${reward.closeReason || '-'}</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">Updated By</label><div style="font-weight:600">${reward.updatedBy || '-'}</div></div>
            <div><label style="font-size:0.7rem; color:var(--text-gray)">Last Update Time</label><div style="font-weight:600">${reward.lastUpdate || '-'}</div></div>
            <div style="grid-column: span 2"><label style="font-size:0.7rem; color:var(--text-gray)">Internal Remark</label><div style="font-weight:400; color:var(--text-light)">${reward.remark || '-'}</div></div>
          </div>
        </div>

        ${reward.currentState === 'ACTIVE' ? `
          <button class="btn" style="width:100%; background:#ef4444; color:#fff; border:none; padding:12px" onclick="showManualCloseModal('${reward.id}')">Closed (Manual Close)</button>
        ` : ''}
      </div>
    </div>
  `;
}

function showManualCloseModal(recordId) {
  const reward = MOCK_REWARDS.find(r => r.id === recordId);
  if (!reward) {
    console.error('Reward record not found:', recordId);
    return;
  }
  const modalContainer = document.getElementById('modalContainer');
  const modalBox = document.getElementById('modalBox');

  if (modalContainer && modalBox) {
    modalContainer.classList.add('open');
    modalBox.innerHTML = `
    <div style="margin-bottom:24px">
      <h3 style="margin:0; color:#b91c1c; display:flex; align-items:center; gap:8px">
         ⚠️ Manual Close Reward
      </h3>
      <p style="color:var(--text-gray); font-size:0.85rem; margin-top:8px">
        This action will manually terminate the wagering instance. This cannot be undone.
      </p>
    </div>

    <div style="background:#fef2f2; border:1px solid #fee2e2; border-radius:8px; padding:16px; margin-bottom:24px">
      <div style="color:#991b1b; font-size:0.8rem; font-weight:700; margin-bottom:4px">ADMINISTRATIVE TERMINATION WARNING</div>
      <div style="color:#b91c1c; font-size:0.8rem; line-height:1.4">
        Performing a "Manual Close" will have the following effects:<br>
        1. This instance will be switched to <b>CLOSED</b> and the <b>player's wallet balance will be zeroed</b>.<br>
        2. All associated PENDING reward instances for this player will also be switched to <b>CLOSED</b>.
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:24px; font-size:0.85rem">
      <div><span style="color:var(--text-gray)">Instance ID:</span> <span style="font-weight:600">${reward.id}</span></div>
      <div><span style="color:var(--text-gray)">Player:</span> <span style="font-weight:600">${reward.username}</span></div>
      <div><span style="color:var(--text-gray)">Amount:</span> <span style="font-weight:600">₱${reward.amount}</span></div>
      <div><span style="color:var(--text-gray)">State:</span> <span style="font-weight:600; color:#065f46">${reward.currentState}</span></div>
    </div>

    <div style="margin-bottom:20px">
      <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:8px">Reason *</label>
      <select class="filter-input" id="closeReason" style="width:100%">
        <option value="">Select a reason...</option>
        <option>Player Requested Cancellation</option>
        <option>Compliance Issue</option>
        <option>Technical Issue</option>
        <option>Fraud Detection</option>
        <option>Other</option>
      </select>
    </div>

    <div style="margin-bottom:24px">
      <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:8px">Internal Remark</label>
      <textarea id="closeRemark" class="filter-input" style="width:100%; height:80px; padding:10px" placeholder="Add notes for audit trail..."></textarea>
    </div>

    <div style="display:flex; gap:12px; justify-content:flex-end">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn" style="background:#ef4444; color:#fff; border:none" onclick="confirmManualClose('${recordId}')">Confirm Manual Close</button>
    </div>
  `;
  }
}

// Global Close Functions (Deduplicated)
// Note: We use 'open' as the standard visibility class across all SPA modules.
function closeModal() {
  const modal = document.getElementById('modalContainer');
  if (modal) modal.classList.remove('open');
}

function closeDrawer(e) {
  const drawer = document.getElementById('drawerContainer');
  // If event exists, only close if clicking the overlay itself
  if (e && e.target !== drawer) return;
  if (drawer) drawer.classList.remove('open');
}

function confirmManualClose(id) {
  const reason = document.getElementById('closeReason').value;
  if (!reason) {
    alert('Please select a reason.');
    return;
  }
  
  // Find player target
  const target = MOCK_REWARDS.find(x => x.id === id);
  if (!target) return;

  // PRD 10.3 & 9.5: Close Active, Close ALL PENDING for same player, Zero Balance
  MOCK_REWARDS.forEach(r => {
    if (r.playerID === target.playerID) {
      if (r.currentState === 'ACTIVE' || r.currentState === 'PENDING') {
        r.currentState = 'CLOSED';
        r.closeReason = reason;
        r.endedAt = new Date().toLocaleString();
        r.updatedBy = 'Admin';
        r.lastUpdate = new Date().toLocaleString();
        r.remark += ` | Force Closed by Admin. Reason: ${reason}`;
      }
    }
  });

  alert('Instance closed successfully (PRD 10.3 & 9.5):\n1. All ACTIVE/PENDING rewards for this player are CLOSED.\n2. Player wallet balance has been zeroed.');
  closeModal();
  closeDrawer();
  navigateTo('reward-history');
}

function renderPlayerList(container) { /* Pivot to Reward History */ }

function viewPlayerDetails(pid) {
  const content = document.getElementById('contentArea');
  
  // High-density data based on Image 5 & 6
  const player = {
    id: pid,
    nick: 'lucky_player88',
    balance: 2450.50,
    currentPromo: {
      name: 'Welcome Bonus 100%',
      state: 'ACTIVE',
      model: 'Principal + Bonus',
      multiplier: '30x',
      target: 12000.00,
      progress: 4560.00,
      remaining: 7440.00,
      principal: 200.00,
      bonus: 200.00,
      createdAt: 'Apr 6, 2026, 04:30 PM',
      grantedAt: 'Apr 6, 2026, 04:30 PM'
    },
    pendingQueue: [
      { q: 1, name: 'Reload Bonus 50%', principal: 150.00, bonus: 75.00, target: 3000.00, createdAt: 'Apr 6, 2026, 06:15 PM' }
    ],
    history: [
      { name: 'Reload Bonus 50%', state: 'COMPLETED', principal: 100.00, bonus: 50.00, progress: '2,000.00 / 2,000.00', createdAt: 'Mar 28, 2025, 10:20 PM', endedAt: 'Apr 3, 2026, 02:45 AM' }
    ]
  };

  content.innerHTML = `
    <div class="detail-header">
      <div>
        <div style="font-size:0.8rem; color:var(--text-gray); margin-bottom:4px">
          <a href="#" onclick="navigateTo('players')" style="color:var(--text-gray);text-decoration:none">← Players</a> / Details
        </div>
        <h2 style="margin:0; font-size:1.5rem">${player.nick} <span style="font-weight:400; font-size:1rem; color:var(--text-gray)">(${player.id})</span></h2>
      </div>
      <button class="btn" style="background:#ef4444; color:#fff; border:none; padding:10px 20px" onclick="forceClosePlayerPromos('${player.id}')">Close Promotion</button>
    </div>

    <div class="player-tabs">
      <div class="tab-item">Account Overview</div>
      <div class="tab-item active">Wallet & Finance</div>
      <div class="tab-item">History Log</div>
      <div class="tab-item">Staff Remark</div>
    </div>

    <div style="padding: 32px">
      ${renderPlayerWalletTab(player)}
    </div>
  `;
}

function renderPlayerWalletTab(player) {
  const p = player.currentPromo;
  
  return `
    <!-- Wallet & Current Promotion Grid (Image 5 Style) -->
    <div class="card" style="padding:32px; margin-bottom:24px">
      <div class="section-header-compact">
        <h4 style="margin:0; text-transform:uppercase; letter-spacing:1px; color:var(--text-gray); font-size:0.8rem">Wallet & Current Promotion</h4>
      </div>
      
      <div class="info-grid">
        <div class="tech-item">
          <div class="tech-label">Wallet Balance</div>
          <div class="tech-value highlight" style="color:#10b981">₱${player.balance.toLocaleString('en-PH', {minimumFractionDigits: 2})}</div>
        </div>
        <div class="tech-item">
          <div class="tech-label">Current Promotion</div>
          <div class="tech-value">${p.name}</div>
        </div>
        <div class="tech-item">
          <div class="tech-label">State</div>
          <div class="tech-value"><span class="status-badge" style="background:#d1fae5;color:#065f46;padding:4px 12px">${p.state}</span></div>
        </div>
        <div class="tech-item">
          <div class="tech-label">WR Model</div>
          <div class="tech-value">${p.model}</div>
        </div>
        
        <div class="tech-item">
          <div class="tech-label">WR Multiplier</div>
          <div class="tech-value">${p.multiplier}</div>
        </div>
        <div class="tech-item">
          <div class="tech-label">WR Target</div>
          <div class="tech-value mono">₱${p.target.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>
        <div class="tech-item">
          <div class="tech-label">WR Progress</div>
          <div class="tech-value mono">₱${p.progress.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>
        <div class="tech-item">
          <div class="tech-label">Remaining WR</div>
          <div class="tech-value highlight">₱${p.remaining.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>

        <div class="tech-item">
          <div class="tech-label">Principal Amount</div>
          <div class="tech-value mono">₱${p.principal.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>
        <div class="tech-item">
          <div class="tech-label">Bonus Amount</div>
          <div class="tech-value mono">₱${p.bonus.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
        </div>
        <div class="tech-item">
          <div class="tech-label">Created At</div>
          <div class="tech-value" style="font-size:0.85rem">${p.createdAt}</div>
        </div>
        <div class="tech-item">
          <div class="tech-label">Bonus Granted At</div>
          <div class="tech-value" style="font-size:0.85rem">${p.grantedAt}</div>
        </div>
      </div>

      <div style="margin-top:32px; padding-top:24px; border-top:1px solid #f1f5f9">
        <button class="btn" style="background:#ef4444; color:#fff; border:none; padding:8px 24px; font-size:0.85rem; display:flex; align-items:center; gap:8px" onclick="forceClosePlayerPromos('${player.id}')">
          <span style="font-size:1.2rem;line-height:0">⊗</span> Close Promotion
        </button>
      </div>
    </div>

    <!-- Pending Promotions (Image 6 Style) -->
    <div class="card" style="padding:0; margin-bottom:24px">
      <div style="padding:20px; border-bottom:1px solid var(--border)">
        <h4 style="margin:0; font-size:1rem">Pending Promotions</h4>
      </div>
      <table class="tech-table">
        <thead>
          <tr>
            <th style="width:60px; text-align:center">Queue</th>
            <th>Promotion Name</th>
            <th style="text-align:right">Principal</th>
            <th style="text-align:right">Bonus</th>
            <th style="text-align:right">WR Target</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          ${player.pendingQueue.map(item => `
            <tr>
              <td style="text-align:center">${item.q}</td>
              <td style="font-weight:600">${item.name}</td>
              <td style="text-align:right">₱${item.principal.toLocaleString()}</td>
              <td style="text-align:right">₱${item.bonus.toLocaleString()}</td>
              <td style="text-align:right; font-weight:600">₱${item.target.toLocaleString()}</td>
              <td style="color:var(--text-gray)">${item.createdAt}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Promotion History (Image 6 Style) -->
    <div class="card" style="padding:0">
      <div style="padding:20px; border-bottom:1px solid var(--border)">
        <h4 style="margin:0; font-size:1rem">Promotion History</h4>
      </div>
      <table class="tech-table">
        <thead>
          <tr>
            <th>Promotion Name</th>
            <th>State</th>
            <th style="text-align:right">Principal</th>
            <th style="text-align:right">Bonus</th>
            <th style="text-align:right">WR Progress</th>
            <th>Created At</th>
            <th>Ended At</th>
          </tr>
        </thead>
        <tbody>
          ${player.history.map(item => `
            <tr>
              <td style="font-weight:600">${item.name}</td>
              <td><span class="status-badge" style="background:#e0f2fe;color:#0369a1">${item.state}</span></td>
              <td style="text-align:right">₱${item.principal.toLocaleString()}</td>
              <td style="text-align:right">₱${item.bonus.toLocaleString()}</td>
              <td style="text-align:right; font-weight:600; font-family:monospace">₱${item.progress}</td>
              <td style="color:var(--text-gray); font-size:0.75rem">${item.createdAt}</td>
              <td style="color:var(--text-gray); font-size:0.75rem">${item.endedAt}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Init SPA
// =============================================================================
// GLOBAL INTERACTION UTILITIES
// =============================================================================

function createMultiSelectHTML(label, options, id) {
  const optionsHTML = options.map(opt => `
    <label class="ms-option">
      <input type="checkbox" value="${opt}" onchange="updateMultiSelectLabel('${id}')">
      <span class="ms-label-text">${opt}</span>
    </label>
  `).join('');

  return `
    <div class="filter-item">
      <label>${label}</label>
      <div class="ms-container" id="ms-${id}">
        <div class="ms-trigger" onclick="toggleMultiSelect('ms-${id}', event)">
          <span class="ms-display-text" id="ms-display-${id}">Select Options...</span>
        </div>
        <div class="ms-dropdown">
          ${optionsHTML}
        </div>
      </div>
    </div>
  `;
}

function toggleMultiSelect(msId, event) {
  event.stopPropagation();
  const all = document.querySelectorAll('.ms-container');
  all.forEach(el => {
    if (el.id !== msId) el.classList.remove('open');
  });
  document.getElementById(msId).classList.toggle('open');
}

function updateMultiSelectLabel(id) {
  const container = document.getElementById(`ms-${id}`);
  const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
  const displayText = document.getElementById(`ms-display-${id}`);
  
  if (checkboxes.length === 0) {
    displayText.innerText = 'Select Options...';
  } else if (checkboxes.length === 1) {
    displayText.innerText = checkboxes[0].value;
  } else {
    displayText.innerText = `${checkboxes.length} Selected`;
  }
}

// Global click listener to close dropdowns
document.addEventListener('click', (e) => {
  if (!e.target.closest('.ms-container')) {
    document.querySelectorAll('.ms-container').forEach(el => el.classList.remove('open'));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  navigateTo('promotions');
});
