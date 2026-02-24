/* ── BUBBLES ── */
const bgEl=document.querySelector('.bg-wrap');
for(let i=0;i<18;i++){const b=document.createElement('div');b.className='bubble';const s=Math.random()*38+10;b.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${Math.random()*13+10}s;animation-delay:${Math.random()*12}s;`;bgEl.appendChild(b);}

/* ── DATA ── */
const SIZES={small:{label:'Small (≤500L)',price:3500},medium:{label:'Medium (500–1500L)',price:6500},large:{label:'Large (1500L+)',price:11000}};
const LOCS={rooftop:{label:'On Rooftop',surcharge:1500},stand:{label:'On Iron Stand',surcharge:500},ground:{label:'On Ground Floor',surcharge:0}};
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const sel={small:false,medium:false,large:false};
const qty={small:1,medium:1,large:1};
let chosenLoc=null,chosenDate=null,chosenTime=null,chosenPayMethod=null;
let calYear=2026,calMonth=2; // March 2026
const fmt=n=>'₦'+n.toLocaleString();
let curStep=1;

/* ── STEP ROUTING ── */
function goStep(n){
  document.getElementById('step-'+curStep).classList.remove('active');
  document.getElementById('step-'+n).classList.add('active');
  [1,2,3,4,5].forEach(i=>{
    document.getElementById('ps-'+i).classList.toggle('done',i<n);
    document.getElementById('ps-'+i).classList.toggle('active',i===n);
    if(i<5)document.getElementById('pl-'+i).classList.toggle('done',i<n);
  });
  curStep=n;
  if(n===3)renderCal();
  if(n===5)populatePayment();
}

/* ── STEP 1 ── */
function toggleSize(k){sel[k]=!sel[k];document.getElementById('card-'+k).classList.toggle('selected',sel[k]);refreshSummary();}
function chQty(e,k,d){e.stopPropagation();qty[k]=Math.max(1,qty[k]+d);document.getElementById('qv-'+k).textContent=qty[k];refreshSummary();}
function refreshSummary(){
  const any=Object.values(sel).some(Boolean);
  document.getElementById('s-empty').style.display=any?'none':'';
  const el=document.getElementById('s-items');el.style.display=any?'flex':'none';
  document.getElementById('next-1').classList.toggle('on',any);
  document.getElementById('hint-1').style.opacity=any?'0':'1';
  if(!any)return;
  let html='',tot=0;
  for(const[k,on]of Object.entries(sel)){if(!on)continue;const sub=SIZES[k].price*qty[k];tot+=sub;html+=`<div class="s-row"><span class="sl">${qty[k]}× ${SIZES[k].label}</span><span class="sp">${fmt(sub)}</span></div>`;}
  html+=`<div class="s-total"><span class="tl">Subtotal</span><span class="tv">${fmt(tot)}</span></div>`;
  el.innerHTML=html;
}
function baseTotal(){let t=0;for(const[k,on]of Object.entries(sel)){if(on)t+=SIZES[k].price*qty[k];}return t;}
function grandTotal(){return chosenLoc?baseTotal()+LOCS[chosenLoc].surcharge:baseTotal();}

/* ── STEP 2 ── */
function selectLoc(k){
  chosenLoc=k;
  ['rooftop','stand','ground'].forEach(id=>document.getElementById('loc-'+id).classList.toggle('selected',id===k));
  const loc=LOCS[k],base=baseTotal(),tot=base+loc.surcharge;
  const note=document.getElementById('price-note');
  note.innerHTML=loc.surcharge>0
    ?`<strong>${loc.label}</strong> adds a <strong>${fmt(loc.surcharge)}</strong> access surcharge. Updated estimate: <strong>${fmt(tot)}</strong>`
    :`<strong>${loc.label}</strong> — no surcharge. Your estimate is <strong>${fmt(tot)}</strong>`;
  note.classList.add('show');
  document.getElementById('next-2').classList.add('on');
}

/* ── STEP 3 ── */
function isUnavail(d,m,y){const date=new Date(y,m,d);if(date.getDay()===0)return true;return[3,8,14,20,25].includes(d);}
function isPast(d,m,y){const today=new Date();today.setHours(0,0,0,0);return new Date(y,m,d)<today;}
function renderCal(){
  document.getElementById('cal-month-label').textContent=MONTHS[calMonth]+' '+calYear;
  const first=new Date(calYear,calMonth,1).getDay();
  const dim=new Date(calYear,calMonth+1,0).getDate();
  const today=new Date();
  let html='';
  for(let i=0;i<first;i++)html+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=dim;d++){
    const past=isPast(d,calMonth,calYear),unavail=isUnavail(d,calMonth,calYear);
    const isT=today.getDate()===d&&today.getMonth()===calMonth&&today.getFullYear()===calYear;
    const isSel=chosenDate&&chosenDate.d===d&&chosenDate.m===calMonth&&chosenDate.y===calYear;
    let cls='cal-day'+(past?' past':unavail?' unavail':' available')+(isT&&!past?' today':'')+(isSel?' selected':'');
    const oc=(past||unavail)?'':`onclick="pickDate(${d},${calMonth},${calYear})"`;
    html+=`<div class="${cls}" ${oc}>${d}</div>`;
  }
  document.getElementById('cal-days').innerHTML=html;
  updateStrip();
}
function prevMonth(){calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCal();}
function nextMonth(){calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCal();}
function pickDate(d,m,y){chosenDate={d,m,y};renderCal();}
function selectTime(id,label){
  chosenTime=label;
  ['morning','midmorning','evening'].forEach(t=>{const el=document.getElementById('ts-'+t);if(el)el.classList.remove('selected');});
  document.getElementById('ts-'+id).classList.add('selected');
  updateStrip();
}
function updateStrip(){
  const strip=document.getElementById('booking-strip');
  const ok=chosenDate&&chosenTime;
  strip.classList.toggle('show',!!(chosenDate||chosenTime));
  if(chosenDate)document.getElementById('bs-date').textContent=MONTHS[chosenDate.m].slice(0,3)+' '+chosenDate.d+', '+chosenDate.y;
  if(chosenTime)document.getElementById('bs-time').textContent=chosenTime;
  document.getElementById('bs-price').textContent=fmt(grandTotal());
  document.getElementById('next-3').classList.toggle('on',!!ok);
}

/* ── STEP 4: ADDRESS VALIDATION ── */
function validateAddress(){
  const req=['f-street','f-area','f-landmark','f-phone'];
  let ok=true;
  req.forEach(id=>{
    const el=document.getElementById(id);
    el.classList.remove('err');
    if(!el.value.trim()){el.classList.add('err');ok=false;}
  });
  if(ok)goStep(5);
  else{
    const first=document.querySelector('.field-group input.err');
    if(first)first.focus();
  }
}

/* ── STEP 5: PAYMENT ── */
function populatePayment(){
  const total=grandTotal();
  document.getElementById('pay-amount-display').textContent=fmt(total);
  const sur=chosenLoc?LOCS[chosenLoc].surcharge:0;
  document.getElementById('pay-amount-breakdown').textContent=
    `Tank service ₦${baseTotal().toLocaleString()}${sur>0?' + ₦'+sur.toLocaleString()+' access surcharge':''}`;
  const ref='AQP-'+Math.random().toString(36).toUpperCase().slice(2,9);
  document.getElementById('pay-ref').textContent=ref;
  window._payRef=ref;
}

function selectPayMethod(m){
  chosenPayMethod=m;
  ['card','transfer','ussd'].forEach(id=>document.getElementById('pm-'+id).classList.toggle('selected',id===m));
  document.getElementById('pay-btn').disabled=false;
  document.getElementById('pay-btn').style.opacity='1';
}

function simulatePayment(){
  if(!chosenPayMethod)return;
  document.getElementById('pay-select-screen').style.display='none';
  document.getElementById('pay-footer').style.display='none';
  document.getElementById('pay-processing').classList.add('show');
  // Simulate payment gateway delay
  setTimeout(()=>{showReceipt();},2800);
}

/* ── RECEIPT ── */
function generateCustomerId(){
  return 'AQP-'+Date.now().toString(36).toUpperCase().slice(-6);
}
function showReceipt(){
  const custId=generateCustomerId();
  document.getElementById('r-customer-id').textContent=custId;

  // Build summary rows
  const dateStr=MONTHS[chosenDate.m]+' '+chosenDate.d+', '+chosenDate.y;
  const locLabel=LOCS[chosenLoc].label;
  const street=document.getElementById('f-street').value.trim();
  const area=document.getElementById('f-area').value.trim();
  const landmark=document.getElementById('f-landmark').value.trim();
  const phone=document.getElementById('f-phone').value.trim();
  const payLabel={card:'Debit/Credit Card',transfer:'Bank Transfer',ussd:'USSD'}[chosenPayMethod];
  const payRef=window._payRef||'AQP-DEMO';

  let tanksHtml='';
  for(const[k,on]of Object.entries(sel)){if(!on)continue;tanksHtml+=`${qty[k]}× ${SIZES[k].label}<br>`;}

  document.getElementById('receipt-rows').innerHTML=`
    <div class="receipt-row">
      <div class="rr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L6 10a6 6 0 1012 0L12 2z"/></svg></div>
      <div class="rr-content"><div class="rr-label">💧 Tank Summary</div><div class="rr-value">${tanksHtml.trim()}<br><span style="color:rgba(168,237,234,.5);font-size:.8rem">${locLabel}</span></div></div>
    </div>
    <div class="receipt-row">
      <div class="rr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
      <div class="rr-content"><div class="rr-label">📅 Date &amp; Time</div><div class="rr-value">${dateStr} &nbsp;·&nbsp; ${chosenTime}</div></div>
    </div>
    <div class="receipt-row">
      <div class="rr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
      <div class="rr-content"><div class="rr-label">📍 Address</div><div class="rr-value">${street}, ${area}<br><span style="color:rgba(168,237,234,.5);font-size:.8rem">Near ${landmark}</span></div></div>
    </div>
    <div class="receipt-row">
      <div class="rr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.64 5.2 2 2 0 015.6 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 10.91a16 16 0 006.28 6.28l.99-.99a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.92z"/></svg></div>
      <div class="rr-content"><div class="rr-label">Phone</div><div class="rr-value">${phone}</div></div>
    </div>
    <div class="receipt-row">
      <div class="rr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></div>
      <div class="rr-content"><div class="rr-label">Payment</div><div class="rr-value">${fmt(grandTotal())} via ${payLabel} <span class="tag">✓ Confirmed</span><br><span style="color:rgba(168,237,234,.45);font-size:.78rem">Ref: ${payRef}</span></div></div>
    </div>
    <div class="receipt-row">
      <div class="rr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      <div class="rr-content"><div class="rr-label">🆔 Customer ID</div><div class="rr-value" style="font-family:'Playfair Display',serif;font-size:1rem;color:var(--aqua)">${custId}</div></div>
    </div>
  `;

  // Switch screens
  document.getElementById('step-5').classList.remove('active');
  document.getElementById('prog-wrap').style.display='none';
  document.getElementById('receipt-screen').classList.add('show');
}

function printReceipt(){window.print();}

/* ── MODAL OPEN/CLOSE ── */
function openModal(){document.getElementById('modal').classList.add('open');document.body.style.overflow='hidden';}
function closeModal(){
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow='';
  setTimeout(resetModal,400);
}
function resetModal(){
  ['small','medium','large'].forEach(k=>{sel[k]=false;qty[k]=1;document.getElementById('card-'+k).classList.remove('selected');document.getElementById('qv-'+k).textContent='1';});
  refreshSummary();
  chosenLoc=null;chosenDate=null;chosenTime=null;chosenPayMethod=null;
  ['rooftop','stand','ground'].forEach(id=>document.getElementById('loc-'+id).classList.remove('selected'));
  document.getElementById('price-note').classList.remove('show');
  document.getElementById('next-2').classList.remove('on');
  ['morning','midmorning','evening'].forEach(id=>{const el=document.getElementById('ts-'+id);if(el)el.classList.remove('selected');});
  document.getElementById('booking-strip').classList.remove('show');
  document.getElementById('next-3').classList.remove('on');
  ['f-street','f-area','f-landmark','f-phone','f-phone2','f-notes'].forEach(id=>{const el=document.getElementById(id);if(el){el.value='';el.classList.remove('err');}});
  document.getElementById('pay-select-screen').style.display='';
  document.getElementById('pay-footer').style.display='';
  document.getElementById('pay-processing').classList.remove('show');
  ['card','transfer','ussd'].forEach(id=>document.getElementById('pm-'+id).classList.remove('selected'));
  document.getElementById('pay-btn').disabled=true;
  document.getElementById('receipt-screen').classList.remove('show');
  document.getElementById('prog-wrap').style.display='';
  if(curStep!==1){document.getElementById('step-'+curStep).classList.remove('active');curStep=1;document.getElementById('step-1').classList.add('active');[1,2,3,4,5].forEach(i=>{document.getElementById('ps-'+i).classList.toggle('active',i===1);document.getElementById('ps-'+i).classList.remove('done');if(i<5)document.getElementById('pl-'+i).classList.remove('done');});}
}