/* Constancia: seguimiento de entrenamiento y proteína. Todo queda en el teléfono (localStorage). */
(function(){
'use strict';

/* ================= Definiciones ================= */
var LAD={
  dom:[
    {n:'Negativas (baja en 4 a 5 s)',lo:3,hi:5},
    {n:'Con banda de asistencia',lo:4,hi:8},
    {n:'Estrictas',lo:1,hi:10},
    {n:'Con peso en la mochila',lo:4,hi:8}],
  fon:[
    {n:'En banco o silla',lo:8,hi:15},
    {n:'Paralelas con apoyo de pies',lo:6,hi:10},
    {n:'Paralelas',lo:6,hi:12},
    {n:'Paralelas con peso',lo:5,hi:8}],
  rem:[
    {n:'Barra media, rodillas dobladas',lo:8,hi:12},
    {n:'Barra media, piernas rectas',lo:8,hi:12},
    {n:'Piernas rectas y pies elevados',lo:6,hi:10}]
};
var EX={
  'dom-pro':{n:'Dominadas pronación',sets:4,unit:'rep',lad:'dom',test:'dom'},
  'dom-sup':{n:'Dominadas supinas',sets:4,unit:'rep',lad:'dom',test:'dom'},
  'fondos':{n:'Fondos',sets:3,unit:'rep',lad:'fon',test:'fon'},
  'remo':{n:'Remo invertido en barra baja',sets:3,unit:'rep',lad:'rem'},
  'fle-pies':{n:'Flexiones con pies elevados',sets:3,unit:'rep',lo:10,hi:12,from:['fle',0.5],hint:'Pasa a flexiones diamante o suma peso en la mochila.'},
  'diamante':{n:'Flexiones diamante',sets:3,unit:'rep',lo:8,hi:12,from:['fle',0.4],hint:'Suma peso en la mochila o pasa a flexiones con pies elevados.'},
  'bulgara':{n:'Sentadilla búlgara',sets:3,unit:'rep',lo:6,hi:10,per:true,hint:'Suma peso en la mochila.'},
  'zancadas':{n:'Zancadas',sets:3,unit:'rep',lo:8,hi:12,per:true,hint:'Suma peso en la mochila.'},
  'rodillas':{n:'Elevación de rodillas colgado',sets:3,unit:'rep',lo:6,hi:10,hint:'Pasa a elevar las piernas rectas.'},
  'plancha':{n:'Plancha',sets:3,unit:'seg',lo:30,hi:60,from:['pla',0.7],hint:'Pasa a plancha con un brazo o pies elevados.'},
  'flex':{n:'Flexiones',sets:3,unit:'rep',lo:15,hi:25,from:['fle',0.75],hint:'Pasa a flexiones con pies elevados.'},
  'sent-mochila':{n:'Sentadillas con mochila',sets:3,unit:'rep',lo:12,hi:20,from:['sen',0.6],hint:'Suma peso en la mochila o pasa a búlgaras.'},
  'puente':{n:'Puente de glúteos',sets:3,unit:'rep',lo:12,hi:20,hint:'Pasa a puente a una pierna.'},
  'plancha-c':{n:'Plancha',sets:3,unit:'seg',lo:30,hi:60,from:['pla',0.7],hint:'Pasa a plancha con un brazo o pies elevados.'}
};
var SES={
  A:{n:'Sesión A',lugar:'Parque. Tirón, empuje y piernas.',ex:['dom-pro','fondos','fle-pies','bulgara','rodillas']},
  B:{n:'Sesión B',lugar:'Parque. Tirón, empuje y core.',ex:['dom-sup','remo','diamante','zancadas','plancha']},
  C:{n:'Sesión C',lugar:'Casa. Unos 25 minutos.',ex:['flex','sent-mochila','puente','plancha-c']}
};
var FOODS=[
  {n:'Huevo (1 grande)',g:6},
  {n:'Pechuga de pollo cocida (100 g)',g:31},
  {n:'Carne magra cocida (100 g)',g:28},
  {n:'Atún en lata escurrido (100 g)',g:19},
  {n:'Leche (1 vaso, 240 ml)',g:8},
  {n:'Yogurt natural (1 taza)',g:8},
  {n:'Yogurt griego (150 g)',g:15},
  {n:'Queso (30 g)',g:7},
  {n:'Lentejas cocidas (1 taza)',g:18},
  {n:'Porotos cocidos (1 taza)',g:15},
  {n:'Garbanzos cocidos (1 taza)',g:14},
  {n:'Avena cocida (1 taza)',g:5}
];
var DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
var KEY='constancia-v2';
var CYCLE=5;

/* ================= Estado ================= */
var S;
function defaults(){
  return {v:2,settings:{peso:65.8,metaProt:105,metaAuto:true,cycleStart:null,levels:{},restSec:90,backupAt:null,celebrated:{},onboardDone:false},
          sessions:{},tests:{},habits:{},protein:{},weights:{},meals:{},draft:null};
}
function load(){
  var d=defaults();
  try{
    var raw=localStorage.getItem(KEY);
    if(raw){
      var o=JSON.parse(raw);
      if(o&&typeof o==='object'){
        d.settings=Object.assign(d.settings,o.settings||{});
        d.sessions=o.sessions||{}; d.tests=o.tests||{}; d.habits=o.habits||{};
        d.protein=o.protein||{}; d.weights=o.weights||{}; d.meals=o.meals||{}; d.draft=o.draft||null;
        if(!d.settings.celebrated||typeof d.settings.celebrated!=='object'){d.settings.celebrated={};}
      }
    }
  }catch(e){}
  S=d;
}
var saveFailed=false;
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(S));saveFailed=false;}catch(e){saveFailed=true;}
}

/* ================= Utilidades ================= */
function $(id){return document.getElementById(id);}
function pad(n){return n<10?'0'+n:''+n;}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function today(){return ymd(new Date());}
function parse(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function mondayOf(d){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function isNum(v){return typeof v==='number'&&isFinite(v);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function r1(v){return Math.round(v*10)/10;}
function defaultSess(){var w=new Date().getDay();return w===6?'A':(w===0?'B':'C');}
var toastTimer;
function toast(t,ms){var el=$('toast');el.textContent=t;el.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('on');},ms||2200);}

/* ================= Consultas ================= */
function sessionsList(){
  return Object.keys(S.sessions).map(function(k){return S.sessions[k];})
    .sort(function(a,b){return a.date<b.date?-1:(a.date>b.date?1:((a.ts||0)-(b.ts||0)));});
}
function lastTest(){
  var ks=Object.keys(S.tests).sort(); return ks.length?S.tests[ks[ks.length-1]]:null;
}
function weekCounts(){
  var m={}; sessionsList().forEach(function(s){var k=ymd(mondayOf(parse(s.date)));m[k]=(m[k]||0)+1;}); return m;
}
function cycleInfo(){
  if(!S.settings.cycleStart){S.settings.cycleStart=ymd(mondayOf(new Date()));save();}
  var diff=Math.round((mondayOf(new Date())-mondayOf(parse(S.settings.cycleStart)))/(7*864e5));
  var w=((diff%CYCLE)+CYCLE)%CYCLE+1;
  return {week:w,deload:w===CYCLE};
}
function levelOf(id){
  var e=EX[id]; if(!e.lad){return 0;}
  var st=S.settings.levels[id];
  if(st!==undefined&&st!==null){return clamp(st,0,LAD[e.lad].length-1);}
  var t=lastTest();
  if(t&&e.test&&t[e.test]>=1&&(e.lad==='dom'||e.lad==='fon')){return 2;}
  return 0;
}
function rangeOf(id){
  var e=EX[id]; if(e.lad){return LAD[e.lad][levelOf(id)];} return {lo:e.lo,hi:e.hi};
}
function setsFor(id){
  var b=EX[id].sets; return cycleInfo().deload?Math.max(2,b-1):b;
}
function lastFor(id){
  var list=sessionsList(),i,s,vals;
  for(i=list.length-1;i>=0;i--){
    s=list[i]; vals=(s.sets&&s.sets[id])||[];
    if(vals.some(isNum)){
      if(EX[id].lad&&s.levels&&s.levels[id]!==undefined&&s.levels[id]!==levelOf(id)){return null;}
      return {date:s.date,sets:vals};
    }
  }
  return null;
}
function firstTarget(id,r){
  var e=EX[id],t=lastTest();
  if(e.lad==='dom'&&levelOf(id)===2&&t&&t.dom>=1){return clamp(t.dom-1,1,r.hi);}
  if(e.lad==='fon'&&levelOf(id)===2&&t&&t.fon>=1){return clamp(t.fon-1,1,r.hi);}
  if(e.from&&t&&t[e.from[0]]>0){return clamp(Math.round(t[e.from[0]]*e.from[1]),r.lo,r.hi);}
  return r.lo;
}
function suggest(id,i){
  var e=EX[id],r=rangeOf(id),last=lastFor(id),step=e.unit==='seg'?5:1;
  if(last){
    var arr=last.sets.filter(isNum);
    var base=isNum(last.sets[i])?last.sets[i]:arr[arr.length-1];
    if(base>=r.hi){return base;}
    return Math.max(1,Math.min(r.hi,base+step));
  }
  return firstTarget(id,r);
}
function reachedTop(id,vals){
  var r=rangeOf(id),f=(vals||[]).filter(isNum);
  return f.length>=2&&f.every(function(v){return v>=r.hi;});
}
function metaText(id){
  var e=EX[id],r=rangeOf(id),u=e.unit==='seg'?' s':'';
  var rg=(r.lo===r.hi)?(''+r.lo):(r.lo+' a '+r.hi);
  return setsFor(id)+' × '+rg+u+(e.per?' por pierna':'');
}
function protToday(){return S.protein[today()]||[];}
function protTotal(date){return (S.protein[date]||[]).reduce(function(a,x){return a+x.g;},0);}
function weekStreak(){
  var counts=weekCounts(),mon=mondayOf(new Date()),streak=0,i,d;
  for(i=1;i<60;i++){d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()-7*i);if((counts[ymd(d)]||0)>=3){streak++;}else{break;}}
  if((counts[ymd(mon)]||0)>=3){streak++;}
  return streak;
}
/* días seguidos con la meta de proteína; si hoy aún no llegas, cuenta desde ayer */
function protStreak(){
  var meta=S.settings.metaProt,n=0,i,d;
  if(!(meta>0)){return 0;}
  for(i=0;i<400;i++){
    d=new Date();d.setDate(d.getDate()-i);
    if(protTotal(ymd(d))>=meta){n++;}else if(i>0){break;}
  }
  return n;
}
/* dominadas estrictas: series en nivel Estrictas (2) o el máximo de los tests */
function bestStrictPull(){
  var m=0;
  sessionsList().forEach(function(s){
    ['dom-pro','dom-sup'].forEach(function(id){
      if(s.levels&&s.levels[id]===2){((s.sets&&s.sets[id])||[]).forEach(function(v){if(isNum(v)&&v>m){m=v;}});}
    });
  });
  Object.keys(S.tests).forEach(function(k){var v=S.tests[k]&&S.tests[k].dom;if(isNum(v)&&v>m){m=v;}});
  return m;
}
function bestPushUps(){
  var m=0;
  Object.keys(S.tests).forEach(function(k){var v=S.tests[k]&&S.tests[k].fle;if(isNum(v)&&v>m){m=v;}});
  sessionsList().forEach(function(s){((s.sets&&s.sets.flex)||[]).forEach(function(v){if(isNum(v)&&v>m){m=v;}});});
  return m;
}
function goalsList(){
  return [
    {id:'dom1',n:'Primera dominada estricta',cur:bestStrictPull(),goal:1},
    {id:'dom10',n:'10 dominadas estrictas',cur:bestStrictPull(),goal:10},
    {id:'fle25',n:'25 flexiones seguidas',cur:bestPushUps(),goal:25},
    {id:'prot7',n:'7 días seguidos con la meta de proteína',cur:protStreak(),goal:7},
    {id:'sem4',n:'4 semanas seguidas con 3 sesiones',cur:weekStreak(),goal:4}
  ];
}
/* avisa una sola vez cada meta cumplida */
function celebrate(base){
  var c=S.settings.celebrated,nuevas=[];
  goalsList().forEach(function(g){if(g.cur>=g.goal&&!c[g.id]){c[g.id]=today();nuevas.push(g.n);}});
  if(nuevas.length){save();toast((base?base+' ':'')+'Meta cumplida: '+nuevas.join(', ')+'.',5000);}
  else if(base){toast(base);}
}
function daysSince(k){return Math.round((parse(today())-parse(k))/864e5);}
function favList(){
  var m={},i,d,k;
  for(i=0;i<30;i++){d=new Date();d.setDate(d.getDate()-i);k=ymd(d);
    (S.protein[k]||[]).forEach(function(x){var key=x.n+'|'+x.g;m[key]=m[key]||{n:x.n,g:x.g,c:0};m[key].c++;});}
  return Object.keys(m).map(function(k){return m[k];}).filter(function(x){return x.c>=2;})
    .sort(function(a,b){return b.c-a.c;}).slice(0,6);
}
var RPE=['','Liviana','Normal','Dura','Al límite'];
function reminders(){
  var out=[],n=weekCounts()[ymd(mondayOf(new Date()))]||0,left=7-((new Date().getDay()+6)%7),falta=3-n;
  if(falta>0&&falta>=left){out.push({t:'Te faltan '+falta+(falta===1?' sesión':' sesiones')+' esta semana y '+(left===1?'queda solo hoy':'quedan '+left+' días')+'.'});}
  var tk=Object.keys(S.tests).sort();
  if(tk.length&&daysSince(tk[tk.length-1])>=28){out.push({t:'Hace '+daysSince(tk[tk.length-1])+' días que no haces el test. Toca repetirlo.',tab:'progreso',b:'Ir al test'});}
  if(S.settings.onboardDone&&sessionsList().length>=3&&(!S.settings.backupAt||daysSince(S.settings.backupAt)>=14)){
    out.push({t:S.settings.backupAt?'Tu último respaldo fue hace '+daysSince(S.settings.backupAt)+' días.':'Aún no has descargado un respaldo.',tab:'plan',b:'Ir a respaldo'});}
  return out;
}
function onboardItems(){
  var hasProt=Object.keys(S.protein).some(function(k){return (S.protein[k]||[]).length>0;});
  return [
    {t:'Hacer el test de partida',ok:Object.keys(S.tests).length>0,tab:'progreso'},
    {t:'Guardar tu primera sesión',ok:sessionsList().length>0,tab:'hoy',to:'startBtn'},
    {t:'Registrar proteína en un día',ok:hasProt,tab:'prot'},
    {t:'Descargar un respaldo',ok:!!S.settings.backupAt,tab:'plan'}
  ];
}

/* ================= Gráficos ================= */
function barChart(vals,labs,goal,ariaLabel){
  var W=560,H=170,pl=30,pb=26,pt=12,n=vals.length,bw=Math.min(44,(W-pl-10)/n-10),gap=(W-pl-n*bw)/(n+1);
  var max=Math.max(goal||0,Math.max.apply(null,vals.concat([1])));
  max=goal&&goal>0?Math.max(max*1.1,goal*1.15):Math.ceil(max);
  var ch=H-pb-pt;
  function y(v){return pt+ch-(v/max)*ch;}
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="'+esc(ariaLabel)+'">';
  var ticks=[];
  if(goal){ticks=goal<=5?Array.apply(null,Array(goal+1)).map(function(_,i){return i;}):[0,Math.round(goal/2),goal];}
  if(!goal){for(var g=0;g<=max;g++){ticks.push(g);}}
  ticks.forEach(function(g){s+='<line x1="'+pl+'" x2="'+W+'" y1="'+y(g)+'" y2="'+y(g)+'" stroke="var(--line)"/><text x="'+(pl-6)+'" y="'+(y(g)+4)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+g+'</text>';});
  vals.forEach(function(v,i){
    var x=pl+gap+i*(bw+gap);
    if(v>0){s+='<rect x="'+x+'" y="'+y(v)+'" width="'+bw+'" height="'+(y(0)-y(v))+'" rx="3" fill="var(--accent)"/><text x="'+(x+bw/2)+'" y="'+(y(v)-4)+'" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">'+v+'</text>';}
    s+='<text x="'+(x+bw/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="var(--muted)">'+esc(labs[i])+'</text>';
  });
  if(goal){s+='<line x1="'+pl+'" x2="'+W+'" y1="'+y(goal)+'" y2="'+y(goal)+'" stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="5 4"/>';}
  return s+'</svg>';
}
function lineChart(pts,ariaLabel,zoom){
  var W=560,H=190,pl=34,pr=14,pb=28,pt=16,n=pts.length;
  var ys=pts.map(function(p){return p.y;}),lo=0,max=Math.max.apply(null,ys.concat([1])); max=Math.ceil(max*1.15);
  if(zoom){lo=Math.floor(Math.min.apply(null,ys)-1);max=Math.ceil(Math.max.apply(null,ys)+1);}
  var ch=H-pb-pt,cw=W-pl-pr;
  function x(i){return pl+(n===1?cw/2:(i/(n-1))*cw);}
  function y(v){return pt+ch-((v-lo)/(max-lo))*ch;}
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="'+esc(ariaLabel)+'">';
  [lo,Math.round((lo+max)/2),max].forEach(function(g){s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(g)+'" y2="'+y(g)+'" stroke="var(--line)"/><text x="'+(pl-6)+'" y="'+(y(g)+4)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+g+'</text>';});
  var d=pts.map(function(p,i){return (i?'L':'M')+x(i)+' '+y(p.y);}).join(' ');
  s+='<path d="'+d+'" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>';
  pts.forEach(function(p,i){
    s+='<circle cx="'+x(i)+'" cy="'+y(p.y)+'" r="'+(i===n-1?6:4)+'" fill="var(--accent)"/>';
    if(i===n-1||n<=6){s+='<text x="'+x(i)+'" y="'+(y(p.y)-10)+'" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">'+p.y+'</text>';}
    if(n<=8||i===0||i===n-1){s+='<text x="'+x(i)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="var(--muted)">'+esc(p.x)+'</text>';}
  });
  return s+'</svg>';
}

/* ================= Render: Hoy ================= */
var curSess=defaultSess();
function ring(tot,meta){
  var pct=meta>0?tot/meta:0,p=clamp(pct,0,1),C=2*Math.PI*52,ok=meta>0&&tot>=meta;
  return '<svg viewBox="0 0 120 120" width="124" height="124" aria-hidden="true">'+
    '<circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" stroke-width="10"/>'+
    '<circle cx="60" cy="60" r="52" fill="none" stroke="'+(ok?'var(--ok)':'var(--accent)')+'" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-p)).toFixed(1)+'" transform="rotate(-90 60 60)"/>'+
    '<text x="60" y="60" text-anchor="middle" font-size="28" font-weight="700" fill="var(--ink)" font-family="var(--display)">'+Math.round(tot)+' g</text>'+
    '<text x="60" y="80" text-anchor="middle" font-size="15" fill="'+(ok?'var(--ok)':'var(--muted)')+'" font-weight="700">'+Math.round(pct*100)+'%</text></svg>';
}
function renderHoy(){
  var ci=cycleInfo(),counts=weekCounts(),mon=mondayOf(new Date()),n=counts[ymd(mon)]||0;
  var done={}; sessionsList().forEach(function(s){done[s.date]=true;});
  var wk='',i,d,k,t=today(),h='';
  for(i=0;i<7;i++){d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i);k=ymd(d);
    wk+='<div class="'+(done[k]?'done':(k===t?'today':''))+'">'+DIAS[i]+'</div>';}
  var fase=ci.deload?'Semana suave: una serie menos por ejercicio y sin llegar al límite. Aprovecha de repetir el test en Progreso.'
                    :'Semana de progresión: intenta sumar una repetición respecto a la última vez.';

  /* Primeros pasos: se oculta para siempre al completar los 4 */
  if(!S.settings.onboardDone){
    var items=onboardItems(),pend=items.filter(function(x){return !x.ok;}).length;
    if(!pend){S.settings.onboardDone=true;save();}
    else{
      h+='<div class="card"><h2>Primeros pasos</h2><p class="muted" style="margin:0 0 6px">'+(items.length-pend)+' de '+items.length+' listos.</p><ul class="steps">';
      items.forEach(function(x){
        h+='<li class="'+(x.ok?'ok':'')+'">'+(x.ok?'<span class="ck" aria-hidden="true">✓</span><span>'+esc(x.t)+'<span class="sr"> (listo)</span></span>'
          :'<button data-act="goto" data-tab="'+x.tab+'"'+(x.to?' data-to="'+x.to+'"':'')+'><span class="ck" aria-hidden="true"></span><span>'+esc(x.t)+'</span><span class="go" aria-hidden="true">›</span></button>')+'</li>';
      });
      h+='</ul></div>';
    }
  }

  /* Parte alta: anillo de proteína, racha y botón principal */
  var tot=protTotal(t),meta=S.settings.metaProt,streak=weekStreak(),dr=S.draft&&S.draft.date===t;
  h+='<div class="card hero"><div class="hero-top">'+
    '<button class="ring" data-act="goto" data-tab="prot" aria-label="Proteína de hoy: '+Math.round(tot)+' de '+meta+' gramos. Ir a Proteína">'+ring(tot,meta)+'</button>'+
    '<div class="hero-side"><div class="kicker">Proteína de hoy</div><div>'+Math.round(tot)+' de '+meta+' g</div>'+
    '<div class="streak"><b>'+streak+'</b><span>'+(streak===1?'semana seguida':'semanas seguidas')+' con 3 sesiones</span></div>'+
    '<div class="muted">Esta semana: '+n+' de 3</div></div></div>';
  if(!dr&&S.sessions[t+'_'+curSess]){h+='<div class="msg">Ya guardaste esta sesión hoy. Si la repites, se reemplaza.</div>';}
  if(dr){
    h+='<button class="btn big" id="startBtn" data-act="resume">Continuar sesión '+esc(S.draft.sess)+'</button>'+
       '<button class="btn warn small" style="margin-top:10px" data-act="discard">Descartar sesión en curso</button>';
  }else{
    h+='<button class="btn big" id="startBtn" data-act="start">Empezar sesión '+esc(curSess)+'</button>';
  }
  h+='</div>';

  var rm=reminders();
  if(rm.length){h+='<div class="card"><h2>Pendiente</h2>';rm.forEach(function(r){h+='<div class="msg">'+esc(r.t)+(r.tab?'<br><button class="btn alt small" style="margin-top:8px" data-act="goto" data-tab="'+r.tab+'">'+r.b+'</button>':'')+'</div>';});h+='</div>';}
  h+='<div class="card"><h2>Esta semana</h2><div class="wk">'+wk+'</div>'+
    '<p class="muted" style="margin:8px 0 0">'+n+' de 3 sesiones'+(n>=3?'. Meta cumplida.':'.')+'</p>'+
    '<p style="margin:10px 0 0"><b>Semana '+ci.week+' de '+CYCLE+'.</b> '+fase+'</p></div>';

  h+='<div class="card"><h2>Sesión de hoy</h2><div class="chips" role="group" aria-label="Elegir sesión">';
  Object.keys(SES).forEach(function(c){h+='<button class="chip" data-act="sess" data-s="'+c+'" aria-pressed="'+(c===curSess)+'">'+SES[c].n+'</button>';});
  h+='</div><p class="muted">'+esc(SES[curSess].lugar)+'</p>'+
    '<details class="warm"><summary>Calentamiento (5 minutos)</summary><p class="muted" style="margin:6px 0 0">Círculos de brazos y cadera, 10 sentadillas lentas, 10 flexiones de escápulas y colgarte de la barra unos segundos.</p></details><div class="exlist">';
  SES[curSess].ex.forEach(function(id){
    var e=EX[id],last=lastFor(id),lv=e.lad?LAD[e.lad][levelOf(id)].n:'';
    h+='<div class="ex"><div class="name">'+esc(e.n)+(reachedTop(id,last&&last.sets)?'<span class="tag">Listo para subir</span>':'')+'</div>'+
       '<div class="meta">'+(lv?esc(lv)+'. ':'')+metaText(id)+'</div>'+
       '<div class="last">'+(last?'Última vez: '+last.sets.filter(isNum).join('-'):'Primera vez')+' · Meta: '+suggest(id,0)+(e.unit==='seg'?' s':'')+'</div></div>';
  });
  h+='</div></div>';

  var hb=S.habits[t]||{};
  h+='<div class="card"><h2>Hábitos de hoy</h2>'+
     '<label class="hab"><input type="checkbox" data-act="hab" data-k="sueno"'+(hb.sueno?' checked':'')+'><span>Dormí al menos 7 horas</span></label>'+
     '<label class="hab"><input type="checkbox" data-act="hab" data-k="oficina"'+(hb.oficina?' checked':'')+'><span>Hice mi ronda de la oficina</span></label></div>';
  $('sec-hoy').innerHTML=h;
}

/* ================= Modo parque ================= */
var restTimer=null,wake=null,audioCtx=null;
function beep(){
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    var o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.connect(g);g.connect(audioCtx.destination);o.frequency.value=880;g.gain.value=.2;
    o.start();o.stop(audioCtx.currentTime+.35);
  }catch(e){}
}
function buzz(){try{if(navigator.vibrate){navigator.vibrate([250,120,250]);}}catch(e){}}
function getWake(){try{if(navigator.wakeLock&&!wake){navigator.wakeLock.request('screen').then(function(w){wake=w;w.addEventListener('release',function(){wake=null;});}).catch(function(){});}}catch(e){}}
function dropWake(){try{if(wake){wake.release();wake=null;}}catch(e){}}

function newDraft(sess){
  var d={date:today(),sess:sess,order:SES[sess].ex.slice(),ei:0,si:0,sets:{},levels:{},cur:null,rest:null,stage:'work',note:''};
  d.order.forEach(function(id){d.sets[id]=[];d.levels[id]=levelOf(id);});
  d.cur=suggest(d.order[0],0);
  return d;
}
function startPark(resume){
  if(!resume||!S.draft){S.draft=newDraft(curSess);save();}
  $('park').hidden=false; document.body.style.overflow='hidden';
  primeAudio(); getWake(); renderPark(); tickRest(); tickSw();
}
function closePark(){
  $('park').hidden=true; document.body.style.overflow='';
  clearInterval(restTimer);restTimer=null; clearInterval(swTimer);swTimer=null; dropWake(); renderHoy();
}
var swTimer=null;
function swElapsed(d){return d.sw?d.sw.acc+(d.sw.start?Date.now()-d.sw.start:0):0;}
function tickSw(){
  clearInterval(swTimer);swTimer=null;
  if(!S.draft||!S.draft.sw||!S.draft.sw.start){return;}
  swTimer=setInterval(function(){
    var d=S.draft,el=$('swTime');
    if(!d||!d.sw||!d.sw.start){clearInterval(swTimer);return;}
    if(el){el.textContent=fmt(Math.floor(swElapsed(d)/1000));}
  },250);
}
function curId(){var d=S.draft;return d.order[d.ei];}
function startRest(){
  var d=S.draft; d.rest={end:Date.now()+S.settings.restSec*1000,total:S.settings.restSec,fired:false};
}
function primeAudio(){
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended'){audioCtx.resume();}
  }catch(e){}
}
function tickRest(){
  clearInterval(restTimer);restTimer=null;
  if(!S.draft||!S.draft.rest){return;}
  if(S.draft.rest.end<Date.now()-2000){S.draft.rest.fired=true;}
  restTimer=setInterval(function(){
    var d=S.draft; if(!d||!d.rest){clearInterval(restTimer);return;}
    var left=Math.max(0,Math.ceil((d.rest.end-Date.now())/1000));
    var el=$('restTime'),box=$('restBox');
    if(el){el.textContent=fmt(left);}
    if(left<=0&&!d.rest.fired){d.rest.fired=true;save();beep();buzz();if(box){box.classList.add('done');}var t=$('restTxt');if(t){t.textContent='Listo. Siguiente serie.';}}
  },250);
}
function fmt(s){return Math.floor(s/60)+':'+pad(s%60);}

function renderPark(){
  var d=S.draft,p=$('park'),h;
  if(!d){closePark();return;}
  h='<div class="inner">';
  if(d.stage==='end'){
    h+='<div class="ptop"><h2 style="margin:0">Resumen</h2><button class="btn alt small" data-act="exit">Salir</button></div>';
    var ups='';
    d.order.forEach(function(id){
      var vals=(d.sets[id]||[]).filter(isNum); if(!vals.length){return;}
      h+='<div class="card" style="margin:0"><b>'+esc(EX[id].n)+'</b>'+
         (EX[id].lad?'<div class="muted">'+esc(LAD[EX[id].lad][d.levels[id]].n)+'</div>':'')+
         '<div style="margin-top:6px">'+vals.map(function(v,i){return 'Serie '+(i+1)+': <b>'+v+'</b>'+(EX[id].unit==='seg'?' s':'');}).join(' · ')+'</div></div>';
      var hi=(EX[id].lad?LAD[EX[id].lad][d.levels[id]].hi:EX[id].hi);
      if(vals.length>=2&&vals.every(function(v){return v>=hi;})){
        if(EX[id].lad&&d.levels[id]<LAD[EX[id].lad].length-1){
          ups+='<div class="msg"><b>'+esc(EX[id].n)+':</b> llegaste al máximo en todas las series. Próximo nivel: '+esc(LAD[EX[id].lad][d.levels[id]+1].n)+'.<br><button class="btn small" style="margin-top:8px" data-act="lvlup" data-id="'+id+'">Subir de nivel</button></div>';
        }else if(EX[id].hint){
          ups+='<div class="msg"><b>'+esc(EX[id].n)+':</b> llegaste al máximo en todas las series. '+esc(EX[id].hint)+'</div>';
        }
      }
    });
    h+=ups+'<div class="card" style="margin:0"><b>¿Cómo estuvo?</b><div class="chips" role="group" aria-label="Esfuerzo de la sesión">';
    [1,2,3,4].forEach(function(v){h+='<button class="chip" data-act="rpe" data-v="'+v+'" aria-pressed="'+(d.rpe===v)+'">'+RPE[v]+'</button>';});
    h+='</div></div><label class="lbl">Nota<textarea id="pnote" placeholder="Cómo te sentiste, qué te costó">'+esc(d.note||'')+'</textarea></label>'+
       '<button class="btn" data-act="finish">Guardar sesión</button>'+
       '<button class="btn alt" data-act="undo">Corregir la última serie</button>';
    h+='</div>';p.innerHTML=h;return;
  }
  var id=curId(),e=EX[id],tot=setsFor(id),r=rangeOf(id),last=lastFor(id);
  h+='<div class="ptop"><span class="muted">Ejercicio '+(d.ei+1)+' de '+d.order.length+' · '+esc(SES[d.sess].n)+'</span>'+
     '<button class="btn alt small" data-act="exit">Pausar</button></div>';
  if(d.rest){
    var left=Math.max(0,Math.ceil((d.rest.end-Date.now())/1000));
    h+='<div class="rest'+(left<=0?' done':'')+'" id="restBox"><div class="muted" id="restTxt">'+(left<=0?'Listo. Siguiente serie.':'Descanso')+'</div>'+
       '<div class="time" id="restTime">'+fmt(left)+'</div>'+
       '<div class="row" style="justify-content:center;margin-top:10px"><button class="btn alt small" data-act="rest15">+15 s</button><button class="btn alt small" data-act="skiprest">Saltar</button></div></div>';
  }
  h+='<h1 class="pname">'+esc(e.n)+'</h1>';
  if(e.lad){h+='<div><b>'+esc(LAD[e.lad][d.levels[id]].n)+'</b></div>';}
  h+='<div class="muted">'+metaText(id)+(last?' · Última vez: '+last.sets.filter(isNum).join('-'):' · Primera vez')+'</div>';
  h+='<div class="dots" aria-label="Series">';
  for(var i=0;i<tot;i++){h+='<i class="'+(isNum((d.sets[id]||[])[i])?'d':(i===d.si?'c':''))+'"></i>';}
  h+='</div><div class="muted">Serie '+(d.si+1)+' de '+tot+(e.per?' (por pierna)':'')+'</div>';
  if(e.unit==='seg'){
    var swe=swElapsed(d),swr=!!(d.sw&&d.sw.start);
    h+='<div class="rest sw'+(swr?' run':'')+'"><div class="muted">Cronómetro · meta '+r.lo+' a '+r.hi+' s</div><div class="time" id="swTime">'+fmt(Math.floor(swe/1000))+'</div>'+
       '<div class="row" style="justify-content:center;margin-top:10px">'+(swr?'<button class="btn small" data-act="swstop">Detener</button>':'<button class="btn small" data-act="swstart">'+(swe>0?'Seguir':'Iniciar')+'</button>')+
       (swe>0?'<button class="btn alt small" data-act="swreset">Reiniciar</button>':'')+'</div></div>';
  }
  var step=e.unit==='seg'?5:1;
  h+='<div class="stepper"><button data-act="dec" aria-label="Menos">−</button>'+
     '<div class="val" id="curVal">'+d.cur+'<small>'+(e.unit==='seg'?'segundos':'repeticiones')+'</small></div>'+
     '<button data-act="inc" aria-label="Más">+</button></div>';
  h+='<button class="btn" data-act="done" style="font-size:20px;padding:18px">Serie hecha</button>';
  h+='<div class="row" style="justify-content:space-between"><button class="btn alt small" data-act="undo">Deshacer</button>'+
     '<button class="btn alt small" data-act="skipex">Saltar ejercicio</button>'+
     '<button class="btn alt small" data-act="toend">Terminar</button></div>';
  h+='</div>';p.innerHTML=h;
  p.dataset.step=step;
}
function advance(){
  var d=S.draft,id=curId();
  d.si++;
  if(d.si>=setsFor(id)){d.ei++;d.si=0;}
  if(d.ei>=d.order.length){d.stage='end';d.rest=null;}
  else{d.cur=suggest(curId(),d.si);startRest();}
}
function parkAction(act,el){
  var d=S.draft; if(!d&&act!=='noop'){return;}
  var id=d.stage==='work'?curId():null,step=id&&EX[id].unit==='seg'?5:1;
  if(act==='inc'){d.cur=d.cur+step;}
  else if(act==='dec'){d.cur=Math.max(0,d.cur-step);}
  else if(act==='done'){primeAudio();if(d.sw){if(d.sw.start){d.cur=Math.round(swElapsed(d)/1000);}d.sw=null;}d.sets[id][d.si]=d.cur;advance();}
  else if(act==='swstart'){primeAudio();d.sw=d.sw||{acc:0,start:null};d.sw.start=Date.now();d.rest=null;}
  else if(act==='swstop'){if(d.sw&&d.sw.start){d.sw.acc+=Date.now()-d.sw.start;d.sw.start=null;d.cur=Math.max(0,Math.round(d.sw.acc/1000));}}
  else if(act==='swreset'){d.sw=null;}
  else if(act==='undo'){
    d.sw=null;var ei=d.ei,si=d.si;
    if(d.stage==='end'){ei=d.order.length-1;si=setsFor(d.order[ei])-1;}
    else if(si>0){si--;}else if(ei>0){ei--;si=setsFor(d.order[ei])-1;}
    // buscar la última serie registrada hacia atrás
    var found=false;
    while(ei>=0&&!found){
      var vals=d.sets[d.order[ei]]||[];
      if(isNum(vals[si])){found=true;break;}
      if(si>0){si--;}else{ei--;if(ei>=0){si=setsFor(d.order[ei])-1;}}
    }
    if(!found){return;}
    d.ei=ei;d.si=si;d.stage='work';d.cur=d.sets[d.order[ei]][si];d.sets[d.order[ei]][si]=null;d.rest=null;
  }
  else if(act==='skipex'){d.sw=null;d.ei++;d.si=0;if(d.ei>=d.order.length){d.stage='end';d.rest=null;}else{d.cur=suggest(curId(),0);d.rest=null;}}
  else if(act==='toend'){d.stage='end';d.rest=null;}
  else if(act==='skiprest'){d.rest=null;}
  else if(act==='rpe'){d.rpe=+el.getAttribute('data-v');}
  else if(act==='rest15'){if(d.rest){d.rest.end+=15000;d.rest.total+=15;d.rest.fired=false;var b=$('restBox');if(b){b.classList.remove('done');}var t=$('restTxt');if(t){t.textContent='Descanso';}}}
  else if(act==='exit'){if(d.stage==='end'){var n=$('pnote');if(n){d.note=n.value;}}save();closePark();return;}
  else if(act==='lvlup'){
    var lid=el.getAttribute('data-id'),e=EX[lid];
    S.settings.levels[lid]=Math.min(LAD[e.lad].length-1,d.levels[lid]+1);
    d.levelUp=d.levelUp||{};d.levelUp[lid]=true;
    el.parentNode.innerHTML='<b>'+esc(e.n)+':</b> pasarás a '+esc(LAD[e.lad][S.settings.levels[lid]].n)+' desde la próxima sesión.';
    save();return;
  }
  else if(act==='finish'){
    var nn=$('pnote'); if(nn){d.note=nn.value;}
    var any=false,sets={};
    d.order.forEach(function(x){var v=(d.sets[x]||[]).filter(isNum);if(v.length){any=true;sets[x]=v;}});
    if(!any){toast('Registra al menos una serie.');return;}
    S.sessions[d.date+'_'+d.sess]={date:d.date,sess:d.sess,sets:sets,levels:d.levels,note:d.note,rpe:d.rpe||null,ts:Date.now()};
    S.draft=null;save();closePark();renderProgreso();celebrate('Sesión guardada.');return;
  }
  save();renderPark();tickRest();tickSw();
}

/* ================= Render: Proteína ================= */
var porciones=1;
function renderProt(){
  var t=today(),tot=protTotal(t),meta=S.settings.metaProt,pct=clamp(tot/meta*100,0,100),falta=Math.max(0,Math.round(meta-tot));
  var h='<div class="card"><h2>Hoy</h2><div class="big">'+Math.round(tot)+' <span style="font-size:22px;color:var(--muted)">de '+meta+' g</span></div>'+
    '<div class="bar'+(tot>=meta?' over':'')+'"><i style="width:'+pct+'%"></i></div>'+
    '<div class="muted">'+(tot>=meta?'Meta cumplida.':'Te faltan '+falta+' g.')+'</div></div>';
  h+='<div class="card"><h2>Agregar</h2><div class="muted">Porciones</div><div class="chips" role="group" aria-label="Porciones">';
  [1,2,3,4].forEach(function(n){h+='<button class="chip" data-act="por" data-n="'+n+'" aria-pressed="'+(n===porciones)+'">'+n+'</button>';});
  h+='</div><div class="foods">';
  FOODS.forEach(function(f,i){h+='<button class="food" data-act="food" data-i="'+i+'">'+esc(f.n)+'<small>~'+f.g+' g</small></button>';});
  h+='</div>';
  var fv=favList(),yk=new Date();yk.setDate(yk.getDate()-1);var ye=S.protein[ymd(yk)]||[];
  if(fv.length){h+='<h3>Tus frecuentes</h3><div class="foods">';fv.forEach(function(x,i){h+='<button class="food" data-act="fav" data-i="'+i+'">'+esc(x.n)+'<small>'+r1(x.g)+' g</small></button>';});h+='</div>';}
  if(ye.length){h+='<button class="btn alt" data-act="repyer">Repetir lo de ayer ('+Math.round(protTotal(ymd(yk)))+' g)</button>';}
  h+='<p class="muted" style="margin:10px 0 0">Valores aproximados de tablas nutricionales. Varían por marca y preparación. Para algo que no está, usa el formulario.</p>'+
     '<h3>Otro alimento</h3><div class="fields"><label class="lbl">Nombre<input type="text" id="p-n" placeholder="Opcional"></label>'+
     '<label class="lbl">Proteína (g)<input type="number" id="p-g" min="0" inputmode="decimal"></label></div>'+
     '<button class="btn alt" data-act="padd">Agregar</button></div>';
  var es=protToday();
  h+='<div class="card"><h2>Registro de hoy</h2>';
  if(!es.length){h+='<p class="muted">Aún no agregas nada.</p>';}
  es.forEach(function(x,i){h+='<div class="entry"><span>'+esc(x.n)+' · <b>'+r1(x.g)+' g</b></span><button data-act="pdel" data-i="'+i+'">Quitar</button></div>';});
  h+='</div>';
  var vals=[],labs=[],sum=0,d,k;
  for(var j=6;j>=0;j--){d=new Date();d.setDate(d.getDate()-j);k=ymd(d);var v=Math.round(protTotal(k));vals.push(v);sum+=v;labs.push(DIAS[(d.getDay()+6)%7]);}
  h+='<div class="card"><h2>Últimos 7 días</h2>'+barChart(vals,labs,meta,'Proteína diaria de los últimos 7 días')+
     '<p class="muted">Promedio: '+Math.round(sum/7)+' g al día. La línea marca tu meta de '+meta+' g.</p></div>';
  $('sec-prot').innerHTML=h;
}
function addProt(n,g){
  var t=today(); S.protein[t]=S.protein[t]||[];
  S.protein[t].push({n:n,g:g,ts:Date.now()}); save(); renderProt(); renderHoy(); renderProgreso();
}

/* ================= Render: Comida ================= */
var CATS={
  fruta:'Fruta',verdura:'Verduras',legumbre:'Legumbres',integral:'Integrales y avena',proteina:'Proteína (carnes, huevos, pescado)',
  lacteo:'Lácteos',sano:'Frutos secos y palta',refinado:'Pan blanco, arroz y fideos',batido:'Batido casero',
  comida_rapida:'Comida rápida',fritura:'Frituras',dulce:'Dulces y postres',bebida_azucarada:'Bebidas azucaradas',
  procesado:'Embutidos y snacks de bolsa',alcohol:'Alcohol',otro:'Otro (no se analiza)'
};
var QUICK=[
  ['Fruta (1 porción)','fruta'],['Verduras o ensalada (1 plato)','verdura'],['Batido de frutas casero','batido'],['Batido de proteína','proteina'],
  ['Legumbres (1 plato)','legumbre'],['Avena o pan integral','integral'],['Frutos secos o palta','sano'],['Pollo, pescado o huevos','proteina'],
  ['Yogurt o leche','lacteo'],['Pan blanco, arroz o fideos','refinado'],['Hamburguesa','comida_rapida'],['Completo o pizza','comida_rapida'],
  ['Papas fritas o fritura','fritura'],['Helado, chocolate o galletas','dulce'],['Bebida o jugo envasado','bebida_azucarada'],
  ['Batido con helado o azúcar','bebida_azucarada'],['Vienesas, jamón o embutidos','procesado'],['Snack de bolsa','procesado'],['Cerveza, vino o trago','alcohol']
];
function rx(l){return new RegExp('\\b('+l+')(s|es)?\\b');}
var CLS=[
  ['alcohol',rx('cerveza|chela|vino|pisco|piscola|ron|vodka|whisky|tequila|trago|cocktail|coctel|champagne|espumante|terremoto')],
  ['bebida_azucarada',rx('bebida|gaseosa|coca|coca cola|fanta|sprite|pepsi|energetica|monster|red bull|redbull|nectar|jugo envasado|jugo en caja|te helado|ice tea')],
  ['comida_rapida',rx('hamburguesa|mcdonald|macdonald|mc donald|mac donald|burger|whopper|big mac|kfc|pizza|completo|hot dog|hotdog|nugget|shawarma|kebab|taco|domino')],
  ['fritura',rx('frito|frita|apanado|apanada|milanesa|sopaipilla|churro|chicharron|calzon roto')],
  ['dulce',rx('helado|chocolate|galleta|torta|kuchen|dulce|caramelo|alfajor|nutella|postre|donut|berlin|brownie|cupcake|manjar|gomita|golosina|bombon|queque|pastel')],
  ['procesado',rx('vienesa|salchicha|jamon|salame|longaniza|chorizo|mortadela|pate|bacon|tocino|snack|ramita|cheetos|doritos|lays|papas de bolsa|chip')],
  ['fruta',rx('manzana|platano|banana|naranja|mandarina|pera|uva|frutilla|sandia|melon|durazno|kiwi|fruta|cereza|arandano|mango|pina|ciruela|damasco|higo|papaya')],
  ['verdura',rx('ensalada|verdura|lechuga|tomate|zanahoria|brocoli|espinaca|zapallo|pepino|repollo|coliflor|pimenton|apio|betarraga|acelga|cebolla|zapallito|berenjena|champinon')],
  ['legumbre',rx('lenteja|poroto|garbanzo|arveja|soya|hummus')],
  ['integral',rx('integral|avena|quinoa|centeno')],
  ['proteina',rx('pollo|pavo|pescado|salmon|atun|merluza|reineta|jurel|sardina|huevo|carne|bistec|lomo|vacuno|cerdo|camaron|marisco|tofu|proteina|clara')],
  ['lacteo',rx('leche|yogurt|yogur|queso|requeson|kefir')],
  ['sano',rx('palta|nuez|nueces|almendra|mani|castana|pistacho|aceite de oliva|semilla|chia|linaza')],
  ['refinado',rx('pan|marraqueta|hallulla|arroz|fideo|tallarin|pasta|papa')]
];
function classify(name){
  var t=String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),i;
  for(i=0;i<CLS.length;i++){if(CLS[i][1].test(t)){return CLS[i][0];}}
  return null;
}
function mealsOn(k){return S.meals[k]||[];}
function catCounts(from,days){
  var c={},logged=0,i,d,k,arr;
  for(i=0;i<days;i++){d=new Date();d.setDate(d.getDate()-from-i);k=ymd(d);arr=mealsOn(k);
    if(arr.length){logged++;}
    arr.forEach(function(m){c[m.cat]=(c[m.cat]||0)+(m.q||1);});}
  c._logged=logged;return c;
}
function fvOf(c){return (c.fruta||0)+(c.verdura||0)+Math.min(c.batido||0,1);}
function analyze(){
  var c=catCounts(0,7),out=[],rap=(c.comida_rapida||0)+(c.fritura||0);
  function add(tone,title,why,tip){out.push({tone:tone,title:title,why:why,tip:tip});}
  if(rap>=3){add('warn','Comida rápida y frituras: '+rap+' veces en 7 días',
    'Traen muchas calorías, grasa y sal en poco volumen. Después puedes sentir pesadez, sueño y digestión lenta. Una vez no engorda, pero si se repite semana tras semana el exceso de calorías sube de peso y, con los años, aumenta el riesgo de obesidad, presión alta y colesterol alto.',
    'Déjalas para 1 vez por semana. Si comes en un local de comida rápida, elige tamaño chico, sin papas grandes ni bebida, y compensa con fruta y verduras el resto del día.');}
  if((c.bebida_azucarada||0)>=3){add('warn','Bebidas azucaradas: '+c.bebida_azucarada+' veces en 7 días',
    'El azúcar líquida da un pico de energía y después un bajón con hambre y antojos, y las calorías no llenan. La OMS pide que el azúcar libre sea menos del 10% de las calorías del día (unos 50 g con 2.000 kcal), y una lata de bebida normal suele aportar más de 30 g.',
    'Cámbiala por agua, agua con gas o té sin azúcar. Si la tomas, que sea ocasional y chica.');}
  if((c.dulce||0)>=4){add('warn','Dulces y postres: '+c.dulce+' veces en 7 días',
    'Suben y bajan el azúcar en la sangre: energía por un rato y luego cansancio y ganas de más dulce. En exceso suman calorías sin saciar.',
    'Elige un día fijo para el antojo y, el resto, fruta, yogurt natural o frutos secos.');}
  if((c.procesado||0)>=3){add('warn','Embutidos y snacks de bolsa: '+c.procesado+' veces en 7 días',
    'Tienen mucha sal, que retiene líquido, puede hincharte y subir la presión (la OMS recomienda menos de 5 g de sal al día). Además la IARC, agencia de la OMS, clasifica las carnes procesadas como cancerígenas para las personas (grupo 1, cáncer colorrectal), y el riesgo sube con la cantidad. El riesgo individual sigue siendo pequeño.',
    'Cambia vienesas y jamón por pollo, atún, huevo o legumbres, y el snack de bolsa por frutos secos sin sal.');}
  if((c.alcohol||0)>=3){add('warn','Alcohol: '+c.alcohol+' veces en 7 días',
    'Empeora el sueño, deshidrata y suma calorías sin nutrientes. Puedes sentir cansancio y peor ánimo al día siguiente, y recuperas menos del entrenamiento.',
    'Baja la frecuencia, alterna con agua y evita tomar antes de dormir.');}
  var lg=c._logged,fv=fvOf(c)/Math.max(lg,1);
  if(lg>=3&&fv<3){add('warn','Poca fruta y verdura: '+r1(fv)+' porciones al día en promedio',
    'Con poca fibra te sientes menos lleno, puedes tener estreñimiento y tu energía es menos estable. La OMS recomienda al menos 400 g al día, unas 5 porciones, sin contar papas.',
    'Suma una fruta en el desayuno, un plato de ensalada al almuerzo y verduras cocidas en la cena.');}
  else if(lg>=3&&fv>=4.5){add('ok','Buena base de fruta y verdura','Estás cerca o sobre las 5 porciones diarias que recomienda la OMS. Eso ayuda a la saciedad, la digestión y la energía estable.','Mantenlo. Sigue variando colores y tipos.');}
  if(lg>=3&&!out.length){add('ok','Sin alertas esta semana','No se repiten alimentos que convenga cuidar.','Sigue registrando para detectar cambios a tiempo.');}
  return {alerts:out,logged:lg};
}
var cant=1;
function renderComida(){
  var t=today(),td=catCounts(0,1),fv=fvOf(td),pct=clamp(fv/5*100,0,100),es=mealsOn(t);
  var h='<div class="card"><h2>Fruta y verdura de hoy</h2><div class="big">'+fv+' <span style="font-size:22px;color:var(--muted)">de 5 porciones</span></div>'+
    '<div class="bar'+(fv>=5?' over':'')+'"><i style="width:'+pct+'%"></i></div>'+
    '<div class="muted">'+(fv>=5?'Meta cumplida.':'Meta de la OMS: al menos 400 g al día, unas 5 porciones (sin contar papas). Un batido cuenta como máximo 1.')+'</div></div>';
  h+='<div class="card"><h2>Agregar lo que comí</h2><div class="muted">Cantidad</div><div class="chips" role="group" aria-label="Cantidad">';
  [1,2,3,4].forEach(function(n){h+='<button class="chip" data-act="cant" data-n="'+n+'" aria-pressed="'+(n===cant)+'">'+n+'</button>';});
  h+='</div><div class="foods">';
  QUICK.forEach(function(f,i){h+='<button class="food" data-act="mfood" data-i="'+i+'">'+esc(f[0])+'</button>';});
  var opts='<option value="">Detectar sola</option>';Object.keys(CATS).forEach(function(k){opts+='<option value="'+k+'">'+esc(CATS[k])+'</option>';});
  h+='</div><h3>Otra comida</h3><div class="fields"><label class="lbl">¿Qué comiste?<input type="text" id="m-n" placeholder="Ej: hamburguesa de McDonald\'s"></label>'+
     '<label class="lbl">Categoría<select id="m-c">'+opts+'</select></label></div>'+
     '<button class="btn alt" data-act="madd">Agregar</button></div>';
  h+='<div class="card"><h2>Registro de hoy</h2>';
  if(!es.length){h+='<p class="muted">Aún no agregas nada.</p>';}
  es.forEach(function(m,i){h+='<div class="entry"><span>'+esc(m.n)+(m.q>1?' ×'+m.q:'')+'<br><span class="muted">'+esc(CATS[m.cat]||'Otro')+'</span></span><button data-act="mdel" data-i="'+i+'">Quitar</button></div>';});
  h+='</div>';
  var a=analyze();
  h+='<div class="card"><h2>Análisis de la semana</h2>';
  if(!a.logged){h+='<p class="muted">Registra lo que comes para ver el análisis.</p>';}
  else{
    if(a.logged<3){h+='<p class="muted">Llevas '+a.logged+(a.logged===1?' día registrado':' días registrados')+'. Con 3 o más el análisis es más confiable.</p>';}
    a.alerts.forEach(function(x){h+='<div class="msg'+(x.tone==='warn'?' warn':'')+'"><b>'+esc(x.title)+'</b><p><b>Cómo te puede afectar:</b> '+esc(x.why)+'</p><p><b>Qué hacer:</b> '+esc(x.tip)+'</p></div>';});
    if(!a.alerts.length){h+='<p class="muted">Aún no hay alertas con lo registrado.</p>';}
  }
  h+='<p class="muted" style="margin:12px 0 0">Orientación general según recomendaciones de la OMS. Importa el patrón de varios días, no una comida suelta. No reemplaza a un nutricionista.</p></div>';
  $('sec-comida').innerHTML=h;
}
function addMeal(n,cat,q){
  var t=today();S.meals[t]=S.meals[t]||[];S.meals[t].push({n:n,cat:cat,q:q,ts:Date.now()});save();renderComida();
}

/* ================= Render: Progreso ================= */
var chartEx='dom-pro';
function renderProgreso(){
  var ss=sessionsList(),counts=weekCounts(),mon=mondayOf(new Date()),streak=weekStreak(),i,d;
  var vals=[],labs=[];
  for(i=7;i>=0;i--){d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()-7*i);vals.push(counts[ymd(d)]||0);labs.push(pad(d.getDate())+'/'+pad(d.getMonth()+1));}
  var h='<div class="card"><h2>Resumen</h2><div class="grid"><div class="stat"><b>'+ss.length+'</b><span>sesiones guardadas</span></div>'+
        '<div class="stat"><b>'+streak+'</b><span>semanas seguidas con 3 sesiones</span></div></div></div>';
  h+='<div class="card"><h2>Metas</h2>';
  goalsList().forEach(function(g){
    var ok=g.cur>=g.goal,shown=Math.min(g.cur,g.goal),pc=Math.round(shown/g.goal*100);
    h+='<div class="goal"><div class="goal-top"><span>'+esc(g.n)+(ok?'<span class="tag">Cumplida</span>':'')+'</span><b>'+shown+' / '+g.goal+'</b></div>'+
       '<div class="bar'+(ok?' over':'')+'" role="progressbar" aria-valuemin="0" aria-valuemax="'+g.goal+'" aria-valuenow="'+shown+'" aria-label="'+esc(g.n)+'"><i style="width:'+pc+'%"></i></div></div>';
  });
  h+='<p class="muted" style="margin:6px 0 0">Se calculan con tus tests y sesiones guardadas. En dominadas cuentan las series en nivel Estrictas o el máximo del test.</p></div>';
  h+='<div class="card"><h2>Sesiones por semana</h2>'+barChart(vals,labs,3,'Sesiones por semana en las últimas 8 semanas')+'<p class="muted">Últimas 8 semanas. La línea marca la meta de 3.</p></div>';

  var opts='';Object.keys(EX).forEach(function(id){opts+='<option value="'+id+'"'+(id===chartEx?' selected':'')+'>'+esc(EX[id].n)+(id==='plancha-c'?' (casa)':'')+'</option>';});
  var pts=[];ss.forEach(function(s){var v=((s.sets&&s.sets[chartEx])||[]).filter(isNum);if(v.length){pts.push({x:s.date.slice(8)+'/'+s.date.slice(5,7),y:Math.max.apply(null,v)});}});
  h+='<div class="card"><h2>Evolución</h2><label class="lbl">Ejercicio<select id="chartEx" data-act="chartEx">'+opts+'</select></label>'+
     '<div style="margin-top:10px">'+(pts.length>=2?lineChart(pts,'Mejor serie por sesión'):'<p class="muted">Necesitas al menos 2 sesiones con este ejercicio para ver la línea.</p>')+'</div>'+
     '<p class="muted">Mejor serie de cada sesión.</p></div>';

  var wk2=Object.keys(S.weights).sort(),wl=wk2.length?S.weights[wk2[wk2.length-1]]:S.settings.peso;
  h+='<div class="card"><h2>Peso corporal</h2><div class="fields"><label class="lbl">Peso de hoy (kg)<input type="number" id="w-kg" step="0.1" inputmode="decimal" value="'+wl+'"></label></div>'+
     '<button class="btn" data-act="savew">Guardar peso</button>';
  if(wk2.length>=2){var wp=wk2.slice(-12).map(function(k){return {x:k.slice(8)+'/'+k.slice(5,7),y:S.weights[k]};});h+='<div style="margin-top:10px">'+lineChart(wp,'Peso corporal',true)+'</div>';}
  h+='<p class="muted">'+(S.settings.metaAuto?'La meta de proteína se recalcula con tu peso (1,6 g por kilo).':'Tu meta de proteína está fijada a mano y no cambia con el peso.')+'</p></div>';

  h+='<div class="card"><h2>Historial</h2>';
  var hk=Object.keys(S.sessions).sort(function(a,b){var x=S.sessions[a],y=S.sessions[b];return x.date<y.date?1:(x.date>y.date?-1:(y.ts||0)-(x.ts||0));}).slice(0,10);
  if(!hk.length){h+='<p class="muted">Aún no hay sesiones guardadas.</p>';}
  hk.forEach(function(k){var x=S.sessions[k],ns=Object.keys(x.sets||{}).reduce(function(a,id){return a+x.sets[id].length;},0);
    h+='<div class="entry"><span><b>'+x.date.slice(8)+'/'+x.date.slice(5,7)+' · '+esc(SES[x.sess]?SES[x.sess].n:x.sess)+'</b><br><span class="muted">'+ns+' series'+(x.rpe?' · '+RPE[x.rpe]:'')+(x.note?' · '+esc(x.note):'')+'</span></span>'+
       '<button data-act="sdel" data-k="'+esc(k)+'">Borrar</button></div>';});
  h+='</div>';

  var t=lastTest();
  h+='<div class="card"><h2>Test</h2><p class="muted">Máximo seguido de cada uno, con buena técnica. Repítelo cada 4 semanas. Con el test se calculan tus metas.</p><div class="fields">'+
     '<label class="lbl">Dominadas<input type="number" id="t-dom" min="0" inputmode="numeric" value="'+(t?t.dom:'')+'"></label>'+
     '<label class="lbl">Fondos en paralelas<input type="number" id="t-fon" min="0" inputmode="numeric" value="'+(t?t.fon:'')+'"></label>'+
     '<label class="lbl">Flexiones<input type="number" id="t-fle" min="0" inputmode="numeric" value="'+(t?t.fle:20)+'"></label>'+
     '<label class="lbl">Sentadillas<input type="number" id="t-sen" min="0" inputmode="numeric" value="'+(t?t.sen:'')+'"></label>'+
     '<label class="lbl">Plancha (segundos)<input type="number" id="t-pla" min="0" inputmode="numeric" value="'+(t?t.pla:'')+'"></label></div>'+
     '<button class="btn" data-act="savetest">Guardar test de hoy</button>';
  var tk=Object.keys(S.tests).sort();
  if(tk.length){h+='<div style="overflow-x:auto;margin-top:12px"><table><tr><th>Fecha</th><th>Dom.</th><th>Fondos</th><th>Flex.</th><th>Sent.</th><th>Plancha</th></tr>';
    tk.forEach(function(k){var x=S.tests[k];h+='<tr><td>'+k.slice(8)+'/'+k.slice(5,7)+'</td><td>'+x.dom+'</td><td>'+x.fon+'</td><td>'+x.fle+'</td><td>'+x.sen+'</td><td>'+x.pla+' s</td></tr>';});
    h+='</table></div>';}
  h+='</div>';

  var best={};ss.forEach(function(s){Object.keys(s.sets||{}).forEach(function(id){(s.sets[id]||[]).forEach(function(v){if(isNum(v)&&v>0&&(!best[id]||v>best[id].v)){best[id]={v:v,date:s.date};}});});});
  h+='<div class="card"><h2>Mejores series</h2>';
  var bk=Object.keys(best).filter(function(id){return EX[id];});
  if(!bk.length){h+='<p class="muted">Guarda una sesión para ver tus mejores series.</p>';}
  else{h+='<div style="overflow-x:auto"><table><tr><th>Ejercicio</th><th>Mejor</th><th>Fecha</th></tr>';
    bk.forEach(function(id){h+='<tr><td>'+esc(EX[id].n)+'</td><td>'+best[id].v+(EX[id].unit==='seg'?' s':'')+'</td><td>'+best[id].date.slice(8)+'/'+best[id].date.slice(5,7)+'</td></tr>';});
    h+='</table></div>';}
  h+='</div>';

  h+='<div class="card"><h2>Niveles</h2><p class="muted">Cada ejercicio con progresión sube de nivel cuando llegas al máximo de repeticiones en todas las series. Puedes cambiarlo a mano.</p>';
  ['dom-pro','dom-sup','fondos','remo'].forEach(function(id){
    var e=EX[id],o='';LAD[e.lad].forEach(function(l,i){o+='<option value="'+i+'"'+(i===levelOf(id)?' selected':'')+'>'+esc(l.n)+'</option>';});
    h+='<label class="lbl" style="margin-top:10px">'+esc(e.n)+'<select data-act="level" data-id="'+id+'">'+o+'</select></label>';
  });
  h+='</div>';
  $('sec-progreso').innerHTML=h;
}

/* ================= Render: Plan y ajustes ================= */
function renderPlan(){
  var s=S.settings,ci=cycleInfo();
  var h='<div class="card"><h2>Semana tipo</h2><ul class="plain">'+
    '<li><b>Sábado</b>, al llegar de clases: sesión A en el parque.</li>'+
    '<li><b>Domingo</b>: sesión B en el parque.</li>'+
    '<li><b>Un día entre semana</b>: sesión C en casa, unos 25 minutos.</li></ul>'+
    '<p class="muted">Calienta 5 minutos antes: círculos de brazos y cadera, 10 sentadillas lentas, 10 flexiones de escápulas y colgarte de la barra unos segundos.</p></div>';
  h+='<div class="card"><h2>Ciclo de 5 semanas</h2><ul class="plain"><li>Semanas 1 a 4: intenta sumar una repetición por serie respecto a la última vez.</li>'+
    '<li>Semana 5: semana suave, una serie menos por ejercicio, y repite el test.</li></ul>'+
    '<p style="margin:10px 0 0">Hoy estás en la <b>semana '+ci.week+'</b>.</p>'+
    '<button class="btn alt" data-act="resetcycle">Reiniciar el ciclo desde esta semana</button></div>';
  h+='<div class="card"><h2>Reglas</h2><ul class="plain">'+
    '<li>Descansa 90 segundos entre series. El cronómetro arranca solo.</li>'+
    '<li>En días de sesión, haz solo 1 o 2 rondas de tu rutina de la oficina.</li>'+
    '<li>Baja con control en dominadas y fondos. Si te duele el hombro, para.</li>'+
    '<li>Duerme 7 a 8 horas y come lo suficiente. Ahí se produce la mejora.</li></ul></div>';
  h+='<div class="card"><h2>Ajustes</h2><div class="fields">'+
    '<label class="lbl">Peso (kg)<input type="number" id="s-peso" step="0.1" inputmode="decimal" value="'+s.peso+'"></label>'+
    '<label class="lbl">Meta de proteína (g)<input type="number" id="s-meta" inputmode="numeric" value="'+s.metaProt+'"></label>'+
    '<label class="lbl">Descanso (segundos)<input type="number" id="s-rest" step="5" inputmode="numeric" value="'+s.restSec+'"></label></div>'+
    '<p class="muted">La meta se calcula como 1,6 g por kilo de peso. Si la cambias a mano, deja de actualizarse sola.</p>'+
    '<button class="btn" data-act="savesettings">Guardar ajustes</button></div>';
  h+='<div class="card"><h2>Respaldo</h2><p class="muted">Tus datos viven solo en este teléfono. Si cambias de teléfono o borras los datos del navegador, se pierden. Descarga un respaldo de vez en cuando.</p>'+
    '<button class="btn" data-act="export">Descargar respaldo</button>'+
    '<label class="btn alt" style="display:block;text-align:center;cursor:pointer">Restaurar respaldo<input type="file" id="imp" accept="application/json,.json" hidden></label>'+
    '<div class="status" id="bstatus" role="status">'+(saveFailed?'No se pudo guardar en este navegador.':'')+'</div></div>';
  h+='<div class="card"><h2>Instalar en el teléfono</h2><ul class="plain">'+
    '<li><b>Android (Chrome):</b> menú de tres puntos y "Instalar app" o "Agregar a la pantalla principal".</li>'+
    '<li><b>iPhone (Safari):</b> botón compartir y "Agregar a inicio".</li>'+
    '<li>Ábrela una vez con internet. Después funciona sin señal.</li></ul>'+
    '<div class="status" id="swstatus"></div></div>';
  $('sec-plan').innerHTML=h;
}

/* ================= Eventos ================= */
function showTab(name){
  ['hoy','prot','comida','progreso','plan'].forEach(function(t){$('sec-'+t).classList.toggle('on',t===name);$('t-'+t).setAttribute('aria-selected',t===name?'true':'false');});
  try{history.replaceState(null,'','#'+name);}catch(e){}
  window.scrollTo(0,0);
}
function exportData(){
  try{
    S.settings.backupAt=today();save();
    var blob=new Blob([JSON.stringify(S,null,1)],{type:'application/json'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='constancia-respaldo-'+today()+'.json';
    document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
    $('bstatus').textContent='Respaldo descargado.';renderHoy();
  }catch(e){$('bstatus').textContent='No se pudo descargar el respaldo.';}
}
function importData(file){
  var fr=new FileReader();
  fr.onload=function(){
    try{
      var o=JSON.parse(fr.result);
      if(!o||typeof o!=='object'||!o.sessions||!o.settings){throw new Error('formato');}
      if(!window.confirm('Esto reemplaza los datos actuales de la app. ¿Continuar?')){return;}
      localStorage.setItem(KEY,JSON.stringify(o));load();renderAll();celebrate('Respaldo restaurado.');
    }catch(e){$('bstatus').textContent='El archivo no es un respaldo válido.';}
  };
  fr.readAsText(file);
}
document.addEventListener('click',function(ev){
  var tb=ev.target.closest('nav button[data-tab]');
  if(tb){showTab(tb.getAttribute('data-tab'));return;}
  var el=ev.target.closest('[data-act]'); if(!el){return;}
  var act=el.getAttribute('data-act');
  if($('park')&&!$('park').hidden&&$('park').contains(el)){parkAction(act,el);return;}
  switch(act){
    case 'sess':curSess=el.getAttribute('data-s');renderHoy();break;
    case 'start':startPark(false);break;
    case 'resume':startPark(true);break;
    case 'discard':if(window.confirm('¿Descartar la sesión en curso?')){S.draft=null;save();renderHoy();}break;
    case 'fav':var fx=favList()[+el.getAttribute('data-i')];if(fx){addProt(fx.n,fx.g);celebrate('Agregado: '+r1(fx.g)+' g');}break;
    case 'repyer':
      var y0=new Date();y0.setDate(y0.getDate()-1);
      (S.protein[ymd(y0)]||[]).forEach(function(x){var tt=today();S.protein[tt]=S.protein[tt]||[];S.protein[tt].push({n:x.n,g:x.g,ts:Date.now()});});
      save();renderProt();renderHoy();renderProgreso();celebrate('Repetido lo de ayer.');break;
    case 'savew':
      var kg=parseFloat($('w-kg').value);if(!(kg>20&&kg<300)){toast('Escribe tu peso en kilos.');break;}
      S.weights[today()]=r1(kg);S.settings.peso=r1(kg);
      if(S.settings.metaAuto){S.settings.metaProt=Math.round(kg*1.6);}
      save();renderAll();toast('Peso guardado.');break;
    case 'sdel':
      if(window.confirm('¿Borrar esta sesión del historial?')){delete S.sessions[el.getAttribute('data-k')];save();renderProgreso();renderHoy();toast('Sesión borrada.');}break;
    case 'cant':cant=+el.getAttribute('data-n');renderComida();break;
    case 'mfood':var q=QUICK[+el.getAttribute('data-i')];addMeal(q[0],q[1],cant);toast('Agregado: '+q[0]);break;
    case 'madd':
      var mn=($('m-n').value||'').trim(),mc=$('m-c').value;
      if(!mn){toast('Escribe qué comiste.');break;}
      if(!mc){mc=classify(mn);}
      if(!mc){toast('No pude clasificarlo. Elige una categoría.');break;}
      addMeal(mn,mc,cant);toast('Agregado.');break;
    case 'mdel':S.meals[today()].splice(+el.getAttribute('data-i'),1);save();renderComida();break;
    case 'por':porciones=+el.getAttribute('data-n');renderProt();break;
    case 'food':var f=FOODS[+el.getAttribute('data-i')];addProt(f.n+(porciones>1?' ×'+porciones:''),f.g*porciones);celebrate('Agregado: '+r1(f.g*porciones)+' g');break;
    case 'padd':
      var g=parseFloat($('p-g').value);if(!(g>0)){toast('Escribe los gramos de proteína.');break;}
      addProt(($('p-n').value||'Otro alimento').trim()||'Otro alimento',g);celebrate(null);break;
    case 'pdel':var t=today();S.protein[t].splice(+el.getAttribute('data-i'),1);save();renderProt();renderHoy();renderProgreso();break;
    case 'savetest':
      var n=function(id){var v=parseFloat($(id).value);return isFinite(v)&&v>0?v:0;};
      S.tests[today()]={dom:n('t-dom'),fon:n('t-fon'),fle:n('t-fle'),sen:n('t-sen'),pla:n('t-pla')};
      save();renderProgreso();renderHoy();celebrate('Test guardado.');break;
    case 'resetcycle':S.settings.cycleStart=ymd(mondayOf(new Date()));save();renderPlan();renderHoy();toast('Ciclo reiniciado.');break;
    case 'savesettings':
      var peso=parseFloat($('s-peso').value),meta=parseFloat($('s-meta').value),rest=parseFloat($('s-rest').value);
      var metaEdited=meta>0&&Math.round(meta)!==S.settings.metaProt;
      if(peso>0){
        S.settings.peso=peso;
        if(!metaEdited&&S.settings.metaAuto){S.settings.metaProt=Math.round(peso*1.6);}
      }
      if(metaEdited){S.settings.metaProt=Math.round(meta);S.settings.metaAuto=false;}
      if(rest>=15){S.settings.restSec=Math.round(rest);}
      save();renderAll();toast('Ajustes guardados.');break;
    case 'export':exportData();break;
    case 'goto':
      showTab(el.getAttribute('data-tab'));
      var to=el.getAttribute('data-to'),tg=to&&$(to);
      if(tg){tg.scrollIntoView({block:'center'});}
      break;
  }
});
document.addEventListener('change',function(ev){
  var el=ev.target;
  if(el.id==='imp'&&el.files&&el.files[0]){importData(el.files[0]);el.value='';return;}
  var act=el.getAttribute&&el.getAttribute('data-act');
  if(act==='hab'){var t=today();S.habits[t]=S.habits[t]||{};S.habits[t][el.getAttribute('data-k')]=el.checked;save();}
  else if(act==='level'){S.settings.levels[el.getAttribute('data-id')]=+el.value;save();renderHoy();toast('Nivel actualizado.');}
  else if(act==='chartEx'){chartEx=el.value;renderProgreso();}
});
document.addEventListener('input',function(ev){
  if(ev.target.id==='pnote'&&S.draft){S.draft.note=ev.target.value;save();}
});
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&S.draft&&!$('park').hidden){getWake();tickRest();tickSw();}
});

/* ================= Inicio ================= */
function renderAll(){renderHoy();renderProt();renderComida();renderProgreso();renderPlan();}
function init(){
  load();
  var f=new Date();
  $('fecha').textContent=DIAS[(f.getDay()+6)%7]+' '+f.getDate()+'/'+pad(f.getMonth()+1)+'/'+f.getFullYear();
  var h0=(location.hash||'').replace('#','');
  if(['hoy','prot','comida','progreso','plan'].indexOf(h0)>=0){showTab(h0);}
  renderAll();
  try{if(navigator.storage&&navigator.storage.persist){navigator.storage.persist();}}catch(e){}
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    navigator.serviceWorker.register('sw.js').then(function(){
      var s=$('swstatus');if(s){s.textContent='Modo sin conexión activado.';}
    }).catch(function(){});
  }
}
if(window.__TEST__){window.__TEST__.api={get state(){return S;},suggest:suggest,levelOf:levelOf,cycleInfo:cycleInfo,setsFor:setsFor};}
init();
})();
