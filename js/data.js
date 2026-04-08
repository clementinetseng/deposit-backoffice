// ===== GAME DATA =====
const GAMES = {
  egame: [
    { id:'e1', name:'Money Tree Dozer', provider:'FC', gc:'gc1', icon:'🎰' },
    { id:'e2', name:'Lucky Color Game',  provider:'FC', gc:'gc2', icon:'🎲' },
    { id:'e3', name:'Circus Dozer',      provider:'FC', gc:'gc3', icon:'🎪' },
    { id:'e4', name:'Super Color Game',  provider:'FC', gc:'gc7', icon:'🎯' },
    { id:'e5', name:'Gold Rush',         provider:'FC', gc:'gc4', icon:'💰' },
    { id:'e6', name:'Dragon Palace',     provider:'FC', gc:'gc6', icon:'🐉' },
    { id:'e7', name:'Fortune Wheel',     provider:'FC', gc:'gc5', icon:'🎡' },
    { id:'e8', name:'Coin Pusher EX',    provider:'FC', gc:'gc8', icon:'🪙' },
  ],
  slot: [
    { id:'s1', name:'Starlight Princess', provider:'PG', gc:'gc2', icon:'⭐' },
    { id:'s2', name:'Gates of Olympus',   provider:'PP', gc:'gc5', icon:'⚡' },
    { id:'s3', name:'Sweet Bonanza',      provider:'PP', gc:'gc3', icon:'🍬' },
    { id:'s4', name:'Wild West Gold',     provider:'PP', gc:'gc7', icon:'🤠' },
    { id:'s5', name:'Mahjong Ways',       provider:'PG', gc:'gc1', icon:'🀄' },
    { id:'s6', name:'Book of Dead',       provider:'PP', gc:'gc4', icon:'📖' },
    { id:'s7', name:'Money Train 3',      provider:'RG', gc:'gc6', icon:'🚂' },
    { id:'s8', name:'The Dog House',      provider:'PP', gc:'gc8', icon:'🐕' },
  ],
  fish: [
    { id:'f1', name:'Fishing War',      provider:'JDB', gc:'gc5', icon:'🎣' },
    { id:'f2', name:'Ocean King 3',     provider:'IGS', gc:'gc4', icon:'🐠' },
    { id:'f3', name:'Cai Shen Fishing', provider:'CQ9', gc:'gc7', icon:'🎏' },
    { id:'f4', name:'Bombing Fishing',  provider:'JDB', gc:'gc3', icon:'💣' },
    { id:'f5', name:'Dragon Fortune',   provider:'JDB', gc:'gc6', icon:'🐲' },
    { id:'f6', name:'Deep Blue',        provider:'IGS', gc:'gc1', icon:'🌊' },
  ],
  live: [
    { id:'l1', name:'Baccarat',     provider:'EVO', gc:'gc8', icon:'🃏' },
    { id:'l2', name:'Roulette',     provider:'EVO', gc:'gc3', icon:'🎡' },
    { id:'l3', name:'Blackjack',    provider:'EVO', gc:'gc1', icon:'♠️' },
    { id:'l4', name:'Sic Bo',       provider:'EVO', gc:'gc7', icon:'🎲' },
    { id:'l5', name:'Dragon Tiger', provider:'SA',  gc:'gc6', icon:'🐯' },
    { id:'l6', name:'Crazy Time',   provider:'EVO', gc:'gc2', icon:'⏰' },
  ],
  feature: [
    { id:'ft1', name:'Hot Pick',     provider:'', gc:'gc3', icon:'🔥' },
    { id:'ft2', name:'New Release',  provider:'', gc:'gc2', icon:'✨' },
    { id:'ft3', name:'Top Winners',  provider:'', gc:'gc7', icon:'🏆' },
    { id:'ft4', name:'Jackpot Zone', provider:'', gc:'gc6', icon:'💎' },
  ],
  combo: [
    { id:'co1', name:'Combo Rush',  provider:'FC',  gc:'gc4', icon:'⚡' },
    { id:'co2', name:'Mega Bundle', provider:'PG',  gc:'gc5', icon:'📦' },
    { id:'co3', name:'Lucky Pack',  provider:'PP',  gc:'gc7', icon:'🍀' },
    { id:'co4', name:'VIP Combo',   provider:'EVO', gc:'gc1', icon:'👑' },
  ]
};

const BANNERS = [
  { tag:'Promotions', title:'Your Lucky Game Awaits', desc:'From classic slots to live casino action, explore our massive collection. Find your favorite game and start playing NOW!', icon:'🐯', cls:'b1' },
  { tag:'First Deposit', title:'100% First Deposit Bonus', desc:'Make your first deposit and get up to ₱5,000 bonus. Complete your turnover and cash out anytime!', icon:'💰', cls:'b2' },
  { tag:'Jackpot', title:'Win the Mega Jackpot', desc:'Join thousands of players and try your luck at our progressive jackpots. The next big winner could be you!', icon:'💎', cls:'b3' },
];

const USER = { name:'d7arp09ivj3s73c...', uid:'ID: d7arp09ivj3s7...', balance:0.00, currency:'₱' };
const NAV_CATS = ['Feature','Slot','Fish','Live','Egame','Combo'];
const DEP_AMOUNTS = [100,200,500,1000,10000,50000];

function fmtNum(n){ return n.toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function today(){ const d=new Date(); return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`; }
function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`; }
