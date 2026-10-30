(()=>{
const D=window.DATA,R=D.rows.map(r=>{const o={};D.cols.forEach((c,i)=>o[c]=r[i]);o.gap=o.delivery_time_minutes-o.estimated_delivery_time;return o});
const C={mint:'#3fd0a6',purple:'#8b7bff',lime:'#c6f26b',amber:'#f2b84b',txt:'#93aba5',grid:'rgba(255,255,255,.06)'};
const mean=a=>{a=a.filter(x=>x!=null);return a.length?a.reduce((s,x)=>s+x,0)/a.length:0},sum=a=>a.reduce((s,x)=>s+x,0);
const pct=(a,fn)=>a.length?100*a.filter(fn).length/a.length:0,f=(n,d=0)=>n.toLocaleString('en-US',{maximumFractionDigits:d}),r1=n=>+n.toFixed(1);
const band=(a,k,e)=>e.slice(0,-1).map((_,i)=>a.filter(r=>r[k]>=e[i]&&r[k]<e[i+1]));
const HRS=[...Array(24).keys()],HL=HRS.map(h=>String(h).padStart(2,'0')+':00'),MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TL=['Low','Moderate','High','Severe'],TE=[0,2.5,5,7.5,10.01],DL=['0–10 km','10–20 km','20–30 km','30–40 km'],DE=[0,10,20,30,40.1];
const live=a=>a.filter(r=>!r.cancellation_flag),rate=(g,k)=>r1(pct(g,r=>r[k]));
const hr=(a,fn)=>HRS.map(h=>fn(a.filter(r=>r.order_hour===h))),mo=(a,fn)=>MON.map((_,i)=>fn(a.filter(r=>r.order_month===i+1)));
const act=g=>r1(mean(g.map(r=>r.delivery_time_minutes))),est=g=>r1(mean(g.map(r=>r.estimated_delivery_time))),gp=g=>r1(mean(g.map(r=>r.gap)));
const MIX=a=>[a.filter(r=>!r.promo_code_used),a.filter(r=>r.promo_code_used),a.filter(r=>!r.premium_customer_flag),a.filter(r=>r.premium_customer_flag)];
const PAGES={
orders:{title:'Orders',sub:'Demand, volume and basket size across the day and year',
 kpis:a=>[['Orders',a.length],['Amount paid',sum(live(a).map(r=>r.final_amount_paid))],['Average order',mean(live(a).map(r=>r.final_amount_paid)),1],['Items per order',mean(a.map(r=>r.number_of_items)),1]],
 charts:[
 {title:'Orders by hour of day',w:8,hero:1,type:'bar',acc:C.purple,info:'Each bar counts the orders placed in that hour. Striped bars are ordinary hours and the solid purple bar is the busiest. Use it to plan rider shifts and kitchen staffing.',data:a=>({l:HL,s:[['Orders',hr(a,g=>g.length)]]})},
 {title:'Basket size',w:4,type:'doughnut',suf:'%',info:'Share of orders by number of items. A large slice means most customers order that basket size, which helps with packaging and prep-time planning.',data:a=>({l:['1–3 items','4–6 items','7–9 items','10–12 items'],s:[['Share',band(a,'number_of_items',[1,4,7,10,13]).map(g=>r1(100*g.length/(a.length||1)))]]})},
 {title:'Orders by month',w:6,type:'line',info:'Order volume for each month. A rising line shows growth, while dips point to quiet seasons where promotions may help.',data:a=>({l:MON,s:[['Orders',mo(a,g=>g.length)]]})},
 {title:'Average amount paid by order type',w:6,type:'bar',acc:C.lime,info:'Average amount paid per order for different order types. Compare bars to see whether promos or festival and weekend orders change basket value.',data:a=>({l:['No promo','Promo used','Weekday','Festival / weekend'],s:[['Average paid',[a.filter(r=>!r.promo_code_used),a.filter(r=>r.promo_code_used),a.filter(r=>!r.festival_or_weekend_flag),a.filter(r=>r.festival_or_weekend_flag)].map(g=>r1(mean(g.map(r=>r.final_amount_paid))))]]})}]},
delays:{title:'Delays',sub:'When and why deliveries arrive later than promised',
 kpis:a=>[['Delay rate',pct(a,r=>r.delayed_delivery_flag),1,'%'],['Delayed orders',a.filter(r=>r.delayed_delivery_flag).length],['Average overrun when late',mean(a.filter(r=>r.delayed_delivery_flag).map(r=>r.gap)),1,' min'],['Delay rate in severe weather',pct(a.filter(r=>r.weather_severity_score>=7.5),r=>r.delayed_delivery_flag),1,'%']],
 charts:[
 {title:'Delay rate by traffic level',w:8,hero:1,type:'bar',acc:C.purple,suf:'%',info:'The percentage of orders that arrived late at each traffic level. If the bars climb from left to right, congestion is a main driver of lateness.',data:a=>({l:TL,s:[['Delayed',band(a,'traffic_level_score',TE).map(g=>rate(g,'delayed_delivery_flag'))]]})},
 {title:'On time vs delayed',w:4,type:'doughnut',suf:'%',info:'Overall split of orders delivered on time and delayed. It is the headline measure of service reliability.',data:a=>({l:['On time','Delayed'],s:[['Share',[r1(100-pct(a,r=>r.delayed_delivery_flag)),rate(a,'delayed_delivery_flag')]]]})},
 {title:'Delay rate by weather severity',w:6,type:'bar',suf:'%',info:'Late-delivery rate for calm through severe weather. Compare it with the traffic chart to see which factor hurts more.',data:a=>({l:TL,s:[['Delayed',band(a,'weather_severity_score',TE).map(g=>rate(g,'delayed_delivery_flag'))]]})},
 {title:'Delay rate by hour',w:6,type:'line',acc:C.amber,suf:'%',info:'How the chance of a late order changes through the day. Peaks mark the hours that need extra riders or longer delivery estimates.',data:a=>({l:HL,s:[['Delayed',hr(a,g=>rate(g,'delayed_delivery_flag'))]]})}]},
cancellations:{title:'Cancellations',sub:'Cancelled orders, refunds and the customers behind them',
 kpis:a=>[['Cancellation rate',pct(a,r=>r.cancellation_flag),1,'%'],['Refund rate',pct(a,r=>r.refund_flag),1,'%'],['Cancelled orders',a.filter(r=>r.cancellation_flag).length],['Value of cancelled orders',sum(a.filter(r=>r.cancellation_flag).map(r=>r.final_amount_paid))]],
 charts:[
 {title:'Cancellations and refunds by distance',w:8,hero:1,type:'bar',suf:'%',info:'Cancellation and refund rates for each delivery distance band. Taller bars on the right mean longer trips lose more orders.',data:a=>{const g=band(a,'delivery_distance_km',DE);return{l:DL,s:[['Cancelled',g.map(x=>rate(x,'cancellation_flag'))],['Refunded',g.map(x=>rate(x,'refund_flag'))]]}}},
 {title:'Order outcomes',w:4,type:'doughnut',suf:'%',info:'Where every order ended up: completed, cancelled, or refunded after delivery. A healthy business keeps the completed slice very large.',data:a=>{const c=pct(a,r=>r.cancellation_flag),rf=pct(a,r=>!r.cancellation_flag&&r.refund_flag);return{l:['Completed','Cancelled','Refunded'],s:[['Share',[r1(100-c-rf),r1(c),r1(rf)]]]}}},
 {title:'Cancellation rate by month',w:6,type:'line',acc:C.amber,suf:'%',info:'Monthly cancellation rate. Spikes suggest seasonal causes such as monsoon weather or festival demand.',data:a=>({l:MON,s:[['Cancelled',mo(a,g=>rate(g,'cancellation_flag'))]]})},
 {title:'Who cancels and gets refunds',w:6,type:'bar',suf:'%',info:'Cancellation and refund rates by customer group. Differences between promo and non-promo, or premium and standard, show where to focus retention.',data:a=>{const m=MIX(a);return{l:['No promo','Promo used','Standard','Premium'],s:[['Cancelled',m.map(g=>rate(g,'cancellation_flag'))],['Refunded',m.map(g=>rate(g,'refund_flag'))]]}}}]},
estimates:{title:'Actual vs Estimated',sub:'How close the promised delivery time is to reality',
 kpis:a=>[['Actual delivery',mean(a.map(r=>r.delivery_time_minutes)),1,' min'],['Estimated delivery',mean(a.map(r=>r.estimated_delivery_time)),1,' min'],['Average gap (actual − estimate)',mean(a.map(r=>r.gap)),1,' min'],['Within ±10 minutes',pct(a,r=>Math.abs(r.gap)<=10),1,'%']],
 charts:[
 {title:'Actual vs estimated time by distance',w:8,hero:1,type:'line',info:'Average actual and estimated delivery minutes for each distance band. When the two lines sit close together the estimates are accurate; a widening gap shows where estimates drift.',data:a=>{const g=band(a,'delivery_distance_km',DE);return{l:DL,s:[['Actual',g.map(act)],['Estimated',g.map(est)]]}}},
 {title:'How far off are estimates?',w:4,type:'bar',acc:C.purple,suf:'%',info:'Share of orders by gap between actual and estimated time. Tall bars near the middle mean accurate estimates; tall bars on the far right mean late deliveries.',data:a=>({l:['Early >20','Early 10–20','Early 0–10','Late 0–10','Late 10–20','Late >20'],s:[['Orders',band(a,'gap',[-1e9,-20,-10,0,10,20,1e9]).map(g=>r1(100*g.length/(a.length||1)))]]})},
 {title:'Average gap by traffic level',w:6,type:'bar',acc:C.lime,suf:' min',info:'Average minutes the actual time differs from the estimate at each traffic level. Positive bars mean deliveries run later than promised.',data:a=>({l:TL,s:[['Gap',band(a,'traffic_level_score',TE).map(gp)]]})},
 {title:'Actual vs estimated by hour',w:6,type:'line',info:'The same comparison across the day. Use it to find hours when the estimate should be padded.',data:a=>({l:HL,s:[['Actual',hr(a,act)],['Estimated',hr(a,est)]]})}]}};
const NAV=[['orders','Orders','◉'],['delays','Delays','◷'],['cancellations','Cancellations','⊘'],['estimates','Actual vs estimated','⇄']];
const key=document.body.dataset.page,P=PAGES[key],st={tier:0,prem:-1};let charts=[];
function stripe(c){const p=document.createElement('canvas');p.width=p.height=10;const x=p.getContext('2d');x.fillStyle=c+'1f';x.fillRect(0,0,10,10);x.strokeStyle=c+'aa';x.lineWidth=2;x.beginPath();[[0,10,10,0],[-2,2,2,-2],[8,12,12,8]].forEach(([a,b,c2,d])=>{x.moveTo(a,b);x.lineTo(c2,d)});x.stroke();return x.createPattern(p,'repeat')}
function make(cfg,a,cv){
 const d=cfg.data(a),dn=cfg.type==='doughnut',ln=cfg.type==='line',multi=d.s.length>1,acc=cfg.acc||C.mint,cols=[C.mint,C.purple,C.lime],s=cfg.suf||'';
 const ds=dn?[{data:d.s[0][1],backgroundColor:[C.purple,C.mint,C.lime,C.amber],borderWidth:0,spacing:5,borderRadius:10,hoverOffset:6}]:d.s.map(([n,v],i)=>{const c=multi?cols[i]:acc,m=v.indexOf(Math.max(...v));
  return ln?{label:n,data:v,borderColor:c,backgroundColor:c+'26',fill:!multi,tension:.4,borderWidth:3,pointRadius:3,pointBackgroundColor:c}
  :{label:n,data:v,borderRadius:8,borderSkipped:false,maxBarThickness:48,backgroundColor:multi?c:v.map((_,j)=>j===m?c:stripe(c))}});
 const tick={color:C.txt};
 return new Chart(cv,{type:cfg.type,data:{labels:d.l,datasets:ds},options:{responsive:true,maintainAspectRatio:false,cutout:'70%',
  animation:{duration:1400,easing:'easeOutQuart',delay:c=>c.type==='data'&&c.mode==='default'?c.dataIndex*55+c.datasetIndex*200:0},
  plugins:{legend:{display:multi||dn,position:'bottom',labels:{color:C.txt,usePointStyle:true,boxWidth:8}},tooltip:{callbacks:{label:c=>' '+(dn?c.label:c.dataset.label)+': '+f(c.parsed.y??c.parsed,1)+s}}},
  scales:dn?{}:{x:{ticks:{...tick,maxTicksLimit:12},grid:{display:false}},y:{beginAtZero:true,ticks:{...tick,callback:v=>v+s},grid:{color:C.grid}}}}});
}
function insight(cfg,d){const v=d.s[0][1],h=v.indexOf(Math.max(...v)),l=v.indexOf(Math.min(...v)),s=cfg.suf||'';return `Highest: ${d.l[h]} (${f(v[h],1)}${s}). Lowest: ${d.l[l]} (${f(v[l],1)}${s}).`}
function count(el,v,d,s){const t0=performance.now();(function tick(t){const p=Math.min(1,(t-t0)/1200),e=1-Math.pow(1-p,3);el.textContent=f(v*e,d)+(s||'');if(p<1)requestAnimationFrame(tick)})(t0)}
function pills(el,opts,k){el.innerHTML=opts.map(([l,v])=>`<button aria-pressed="${st[k]===v}" data-v="${v}">${l}</button>`).join('');el.onclick=e=>{const b=e.target.closest('button');if(!b)return;st[k]=+b.dataset.v;pills(el,opts,k);update()}}
function update(){
 const a=R.filter(r=>(!st.tier||r.city_tier===st.tier)&&(st.prem<0||r.premium_customer_flag===st.prem));
 document.getElementById('kpis').innerHTML=P.kpis(a).map(k=>`<div class="kpi"><b>0</b><span>${k[0]}</span></div>`).join('');
 P.kpis(a).forEach((k,i)=>count(document.querySelectorAll('.kpi b')[i],k[1],k[2]||0,k[3]));
 charts.forEach(c=>c.destroy());
 charts=P.charts.map((c,i)=>{document.getElementById('ins'+i).textContent=insight(c,c.data(a));return make(c,a,document.getElementById('cv'+i))});
}
document.title=P.title+' | Food Delivery Dashboard';
document.getElementById('root').innerHTML=`<div class="app"><nav class="rail" aria-label="Pages">${NAV.map(([k,t,i])=>`<a href="${k}.html" title="${t}" aria-label="${t}" ${k===key?'aria-current="page"':''}>${i}</a>`).join('')}</nav>
<main><h1>${P.title}</h1><p class="sub">${P.sub}</p>
<div class="filters"><div class="pills" id="tier" aria-label="City tier"></div><div class="pills" id="prem" aria-label="Customer type"></div></div>
<section class="kpis" id="kpis"></section>
<section class="grid">${P.charts.map((c,i)=>`<article class="card w${c.w}${c.hero?' hero':''}"><h2>${c.title}</h2><small class="ins" id="ins${i}"></small><div class="plot"><canvas id="cv${i}"></canvas></div><p class="info"><b>How to read it.</b> ${c.info}</p></article>`).join('')}</section></main></div>`;
pills(document.getElementById('tier'),[['All tiers',0],['Tier 1',1],['Tier 2',2],['Tier 3',3]],'tier');
pills(document.getElementById('prem'),[['All customers',-1],['Premium',1],['Standard',0]],'prem');
update();
})();
