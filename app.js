/* Constancia: seguimiento de entrenamiento y proteína. Todo queda en el teléfono (localStorage). */
(function(){
'use strict';

/* ================= Definiciones ================= */
var LAD={
  dom:[
    {n:'Negativas (baja en 4 a 5 s)',lo:3,hi:5},
    {n:'Con banda de asistencia',lo:4,hi:8},
    {n:'Estrictas',lo:2,hi:5},
    {n:'Con peso en la mochila',lo:4,hi:8}],
  fon:[
    {n:'En banco o silla',lo:8,hi:15},
    {n:'Paralelas con apoyo de pies',lo:6,hi:10},
    {n:'Paralelas',lo:6,hi:12},
    {n:'Paralelas con peso',lo:5,hi:8}],
  rem:[
    {n:'Barra media, rodillas dobladas',lo:8,hi:12},
    {n:'Barra media, piernas rectas',lo:8,hi:12},
    {n:'Piernas rectas y pies elevados',lo:6,hi:10}],
  fle:[
    {n:'Inclinadas (manos en banco o barra)',lo:6,hi:12},
    {n:'Normales',lo:6,hi:12},
    {n:'Con pies elevados',lo:6,hi:12}]
};
/* sets: [fase 1, fase 2, fase 3] o un número. sMin: mínimo de series aceptable. rest: segundos de descanso. */
var EX={
  'dom-pro':{n:'Dominadas pronas estrictas',sets:[2,2,3],unit:'rep',lad:'dom',test:'dom',rest:150},
  'remo':{n:'Remo invertido',sets:[2,3,3],unit:'rep',lad:'rem',rest:120},
  'bulgara':{n:'Sentadilla búlgara',sets:[2,2,3],unit:'rep',lo:8,hi:10,per:true,rest:120,hint:'Suma peso en la mochila.'},
  'puente':{n:'Puente de glúteos',sets:[2,2,3],unit:'rep',lo:12,hi:15,rest:75,hint:'Pasa a puente a una pierna.'},
  'rodillas':{n:'Elevación de rodillas colgado',sets:[2,2,3],sMin:1,unit:'rep',lo:6,hi:10,rest:75,alt:'rod-suelo',hint:'Pasa a elevar las piernas rectas.'},
  'flexiones':{n:'Flexiones',sets:[2,3,3],unit:'rep',lad:'fle',rest:105},
  'plancha':{n:'Plancha',sets:[2,2,3],unit:'seg',lo:20,hi:30,rest:75,hint:'Pasa a plancha con un brazo o pies elevados.'},
  'rodillas-b':{n:'Elevación de rodillas controlada',sets:[2,2,3],sMin:1,unit:'rep',lo:8,hi:12,rest:75,alt:'rod-suelo',hint:'Pasa a elevar las piernas rectas.'},
  'sent-mochila':{n:'Sentadillas con mochila',sets:[2,2,3],unit:'rep',lo:10,hi:15,rest:75,alt:'sent-libre',hint:'Suma carga en la mochila o pasa a búlgaras.'},
  'remo-mochila':{n:'Remo con mochila',sets:[2,2,3],unit:'rep',lo:10,hi:15,rest:75,hint:'Suma carga en la mochila.'},
  'flexiones-c':{n:'Flexiones (casa)',sets:[1,2,2],sMin:1,unit:'rep',lad:'fle',lvKey:'flexiones',rest:75},
  'puente-c':{n:'Puente de glúteos (casa)',sets:[1,2,2],sMin:1,unit:'rep',lo:12,hi:15,rest:60,hint:'Pasa a puente a una pierna.'},
  'rod-suelo':{n:'Elevación de rodillas en el suelo',sets:[2,2,3],sMin:1,unit:'rep',lo:8,hi:12,rest:60},
  'sent-libre':{n:'Sentadillas sin peso',sets:[2,2,3],unit:'rep',lo:10,hi:15,rest:60},
  /* rutina anterior: se conservan para que el historial siga mostrándose */
  'dom-sup':{n:'Dominadas supinas',sets:4,unit:'rep',lad:'dom',test:'dom',rest:150},
  'fondos':{n:'Fondos',sets:3,unit:'rep',lad:'fon',test:'fon'},
  'fle-pies':{n:'Flexiones con pies elevados',sets:3,unit:'rep',lo:10,hi:12,from:['fle',0.5],hint:'Pasa a flexiones diamante o suma peso en la mochila.'},
  'diamante':{n:'Flexiones diamante',sets:3,unit:'rep',lo:8,hi:12,from:['fle',0.4],hint:'Suma peso en la mochila o pasa a flexiones con pies elevados.'},
  'zancadas':{n:'Zancadas',sets:3,unit:'rep',lo:8,hi:12,per:true,hint:'Suma peso en la mochila.'},
  'flex':{n:'Flexiones (rutina anterior)',sets:3,unit:'rep',lo:15,hi:25,from:['fle',0.75],hint:'Pasa a flexiones con pies elevados.'},
  'plancha-c':{n:'Plancha (casa)',sets:3,unit:'seg',lo:30,hi:60,from:['pla',0.7],hint:'Pasa a plancha con un brazo o pies elevados.'}
};
var SES={
  A:{n:'Sesión A',dia:'Sábado',lugar:'Parque',obj:'Tirón y piernas',dur:'35 a 40 min',ex:['dom-pro','remo','bulgara','puente','rodillas']},
  B:{n:'Sesión B',dia:'Domingo',lugar:'Parque',obj:'Empuje y core (sin tirón exigente)',dur:'25 a 30 min',ex:['flexiones','plancha','rodillas-b']},
  C:{n:'Sesión C',dia:'Miércoles o jueves',lugar:'Casa',obj:'Cuerpo completo breve',dur:'15 a 20 min',ex:['sent-mochila','remo-mochila','flexiones-c','puente-c']}
};
var PHASES={
  1:{n:'Readaptación',rir:'3 a 4 repeticiones en reserva',min:3,txt:'1 a 2 series por ejercicio, sin llegar al fallo. Recupera técnica y tolerancia.'},
  2:{n:'Construcción',rir:'2 a 3 repeticiones en reserva',min:2,txt:'Generalmente 2 series, 3 en algunos ejercicios. Sube repeticiones de a poco.'},
  3:{n:'Desarrollo',rir:'1 a 3 repeticiones en reserva',min:1,txt:'2 a 3 series según tu recuperación. No hace falta llegar al fallo.'}
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

/* ================= Estado ================= */
var S;
function defaults(){
  return {v:2,settings:{peso:65.8,metaProt:105,metaAuto:true,cycleStart:null,levels:{},restSec:90,backupAt:null,celebrated:{},onboardDone:false,phase:1,phaseStart:null,easyWeek:false,restAdj:0},
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
function phaseNo(){var p=+S.settings.phase;return p>=1&&p<=3?Math.floor(p):1;}
/* fase actual (la cambias tú, no depende solo del tiempo) y semana dentro de la fase */
function cycleInfo(){
  if(!S.settings.phaseStart){S.settings.phaseStart=ymd(mondayOf(new Date()));save();}
  var diff=Math.round((mondayOf(new Date())-mondayOf(parse(S.settings.phaseStart)))/(7*864e5));
  return {phase:phaseNo(),week:Math.max(1,diff+1),easy:!!S.settings.easyWeek,deload:!!S.settings.easyWeek};
}
function lvKey(id){return EX[id].lvKey||id;}
function levelOf(id){
  var e=EX[id]; if(!e.lad){return 0;}
  var st=S.settings.levels[lvKey(id)];
  if(st!==undefined&&st!==null){return clamp(st,0,LAD[e.lad].length-1);}
  var t=lastTest();
  if(t&&e.test&&t[e.test]>=1&&(e.lad==='dom'||e.lad==='fon')){return 2;}
  if(t&&e.lad==='fle'&&t.fle>=10){return 1;}
  return 0;
}
function rangeOf(id){
  var e=EX[id]; if(e.lad){return LAD[e.lad][levelOf(id)];} return {lo:e.lo,hi:e.hi};
}
function setsFor(id){
  var e=EX[id],b=Array.isArray(e.sets)?e.sets[phaseNo()-1]:e.sets;
  return S.settings.easyWeek?Math.max(1,b-1):b;
}
function restFor(id){
  var base=EX[id].rest||S.settings.restSec||90;
  return clamp(base+(+S.settings.restAdj||0),15,300);
}
function lastFor(id){
  var list=sessionsList(),i,s,vals;
  for(i=list.length-1;i>=0;i--){
    s=list[i]; vals=(s.sets&&s.sets[id])||[];
    if(vals.some(isNum)){
      if(EX[id].lad&&s.levels&&s.levels[id]!==undefined&&s.levels[id]!==levelOf(id)){return null;}
      return {date:s.date,sets:vals,rv:s.rv||1,rir:s.rir&&s.rir[id],tech:s.tech&&s.tech[id]};
    }
  }
  return null;
}
function firstTarget(id,r){
  var e=EX[id],t=lastTest();
  if(e.lad==='fon'&&levelOf(id)===2&&t&&t.fon>=1){return clamp(t.fon-1,1,r.hi);}
  if(e.from&&t&&t[e.from[0]]>0){return clamp(Math.round(t[e.from[0]]*e.from[1]),r.lo,r.hi);}
  return r.lo;
}
/* La última sesión permite subir solo si fue de la rutina nueva, con RIR registrado y suficiente, y sin técnica deficiente. */
function canProgress(last){
  return !!last&&last.rv>=2&&last.tech!=='mal'&&isNum(last.rir)&&last.rir>=PHASES[phaseNo()].min;
}
function suggest(id,i){
  var e=EX[id],r=rangeOf(id),last=lastFor(id),step=e.unit==='seg'?5:1;
  if(last&&last.rv>=2){
    var arr=last.sets.filter(isNum);
    var base=isNum(last.sets[i])?last.sets[i]:arr[arr.length-1];
    if(base>=r.hi||!canProgress(last)){return base;}
    return Math.min(r.hi,base+step);
  }
  return firstTarget(id,r);
}
function hiOf(id,lvl){var e=EX[id];return e.lad?LAD[e.lad][clamp(lvl,0,LAD[e.lad].length-1)].hi:e.hi;}
function qualSess(s,id,lvl){
  var vals=((s.sets&&s.sets[id])||[]).filter(isNum),rir=s.rir&&s.rir[id];
  if(vals.length<2){return false;}
  if(EX[id].lad&&s.levels&&s.levels[id]!==undefined&&s.levels[id]!==lvl){return false;}
  return vals.every(function(v){return v>=hiOf(id,lvl);})&&!(s.tech&&s.tech[id]==='mal')&&isNum(rir)&&rir>=PHASES[phaseNo()].min;
}
function prevWith(id,n){
  var list=sessionsList(),out=[],i;
  for(i=list.length-1;i>=0&&out.length<n;i--){if(((list[i].sets&&list[i].sets[id])||[]).some(isNum)){out.push(list[i]);}}
  return out;
}
/* subir de variante: techo del rango en todas las series, buena técnica y RIR adecuado, en 2 sesiones seguidas */
function readyTwice(id){
  var p=prevWith(id,2),l=levelOf(id);
  return p.length===2&&qualSess(p[0],id,l)&&qualSess(p[1],id,l);
}
function metaText(id){
  var e=EX[id],r=rangeOf(id),u=e.unit==='seg'?' s':'',ns=setsFor(id),lo=Math.min(e.sMin||ns,ns);
  var rg=(r.lo===r.hi)?(''+r.lo):(r.lo+' a '+r.hi);
  return (lo<ns?lo+' a '+ns:ns)+' × '+rg+u+(e.per?' por pierna':'');
}
function rirAvg(s){
  var v=Object.keys(s.rir||{}).map(function(k){return s.rir[k];}).filter(isNum);
  return v.length?r1(v.reduce(function(a,b){return a+b;},0)/v.length):null;
}
function weekDoneSet(){
  var mon=ymd(mondayOf(new Date())),o={};
  Object.keys(S.sessions).forEach(function(k){var x=S.sessions[k];if(x.date&&ymd(mondayOf(parse(x.date)))===mon){o[x.sess]=true;}});
  return o;
}
function last4(){
  var counts=weekCounts(),mon=mondayOf(new Date()),n=0,i,d;
  for(i=0;i<4;i++){d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()-7*i);n+=counts[ymd(d)]||0;}
  return n;
}
function protToday(){return S.protein[today()]||[];}
function protTotal(date){return (S.protein[date]||[]).reduce(function(a,x){return a+x.g;},0);}
function avgW(from,days){
  var sum=0,n=0,i,d,v;
  for(i=from;i<from+days;i++){d=new Date();d.setDate(d.getDate()-i);v=S.weights[ymd(d)];if(isNum(v)){sum+=v;n++;}}
  return n?r1(sum/n):null;
}
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
  sessionsList().forEach(function(s){
    ['flex','flexiones','flexiones-c'].forEach(function(id){
      if(id!=='flex'&&!(s.levels&&s.levels[id]>=1)){return;}
      ((s.sets&&s.sets[id])||[]).forEach(function(v){if(isNum(v)&&v>m){m=v;}});
    });
  });
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
  var out=[],ci=cycleInfo();
  var tk=Object.keys(S.tests).sort();
  if(tk.length&&daysSince(tk[tk.length-1])>=28){out.push({t:'Hace '+daysSince(tk[tk.length-1])+' días que no haces el test. Toca repetirlo, sin buscar tu máximo si vienes cansado.',tab:'progreso',b:'Ir al test'});}
  var ls=sessionsList().slice(-2);
  if(ls.length===2&&ls.every(function(x){return x.rpe===4||x.pain>=1;})){
    out.push({t:'Tus dos últimas sesiones fueron muy exigentes o con molestias. Considera una semana suave (una serie menos) y revisa sueño y comida.',tab:'plan',b:'Ir a Plan'});}
  if(ci.phase===1&&ci.week>=4){
    out.push({t:'Llevas '+ci.week+' semanas en Readaptación. Revisa cumplimiento, técnica, recuperación y molestias. Si todo va bien, puedes pasar a Construcción; si no, quédate más tiempo.',tab:'plan',b:'Ir a Plan'});}
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
  var ci=cycleInfo(),ph=PHASES[ci.phase],counts=weekCounts(),mon=mondayOf(new Date()),n=counts[ymd(mon)]||0;
  var done={}; sessionsList().forEach(function(s){done[s.date]=true;});
  var wd=weekDoneSet(),wk='',i,d,k,t=today(),h='';
  for(i=0;i<7;i++){d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i);k=ymd(d);
    wk+='<div class="'+(done[k]?'done':(k===t?'today':''))+'">'+DIAS[i]+'</div>';}

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

  /* Parte alta: anillo de proteína, constancia y botón principal */
  var tot=protTotal(t),meta=S.settings.metaProt,dr=S.draft&&S.draft.date===t;
  h+='<div class="card hero"><div class="hero-top">'+
    '<button class="ring" data-act="goto" data-tab="prot" aria-label="Proteína de hoy: '+Math.round(tot)+' de '+meta+' gramos. Ir a Proteína">'+ring(tot,meta)+'</button>'+
    '<div class="hero-side"><div class="kicker">Proteína de hoy</div><div>'+Math.round(tot)+' de '+meta+' g</div>'+
    '<div class="streak"><b>'+last4()+'</b><span>sesiones en las últimas 4 semanas</span></div>'+
    '<div class="muted">Fase '+ci.phase+': '+esc(ph.n)+' · semana '+ci.week+'</div></div></div>';
  if(!dr&&S.sessions[t+'_'+curSess]){h+='<div class="msg">Ya guardaste esta sesión hoy. Si la repites, se reemplaza.</div>';}
  else if(!dr&&wd[curSess]){h+='<div class="msg">Ya hiciste la sesión '+esc(curSess)+' esta semana. No hace falta compensar: descansar también es parte del plan.</div>';}
  if(dr){
    h+='<button class="btn big" id="startBtn" data-act="resume">Continuar sesión '+esc(S.draft.sess)+'</button>'+
       '<button class="btn warn small" style="margin-top:10px" data-act="discard">Descartar sesión en curso</button>';
  }else{
    h+='<button class="btn big" id="startBtn" data-act="start">Empezar sesión '+esc(curSess)+'</button>';
  }
  h+='</div>';

  var rm=reminders();
  if(rm.length){h+='<div class="card"><h2>Pendiente</h2>';rm.forEach(function(r){h+='<div class="msg">'+esc(r.t)+(r.tab?'<br><button class="btn alt small" style="margin-top:8px" data-act="goto" data-tab="'+r.tab+'">'+r.b+'</button>':'')+'</div>';});h+='</div>';}

  var pl='<div class="chips" role="group" aria-label="Plan de la semana">';
  ['C','A','B'].forEach(function(c){pl+='<span class="pl'+(wd[c]?' ok':'')+'">'+(wd[c]?'✓ ':'')+c+' · '+esc(SES[c].dia.replace('Miércoles o jueves','mié o jue').replace('Sábado','sáb').replace('Domingo','dom'))+'</span>';});
  pl+='</div>';
  h+='<div class="card"><h2>Esta semana</h2><div class="wk">'+wk+'</div>'+pl+
    '<p class="muted" style="margin:8px 0 0">'+n+' de 3 sesiones planificadas. Los demás días son de recuperación.</p>'+
    '<p style="margin:10px 0 0"><b>'+esc(ph.n)+'.</b> '+esc(ph.txt)+' Objetivo: '+esc(ph.rir)+'.'+(ci.easy?' <b>Semana suave activada:</b> una serie menos por ejercicio.':'')+'</p></div>';

  var S0=SES[curSess];
  h+='<div class="card"><h2>Sesión de hoy</h2><div class="chips" role="group" aria-label="Elegir sesión">';
  Object.keys(SES).forEach(function(c){h+='<button class="chip" data-act="sess" data-s="'+c+'" aria-pressed="'+(c===curSess)+'">'+SES[c].n+'</button>';});
  h+='</div><p class="muted">'+esc(S0.dia)+' · '+esc(S0.lugar)+' · '+esc(S0.obj)+' · unos '+esc(S0.dur)+'</p>'+
    '<details class="warm"><summary>Calentamiento (5 a 8 minutos)</summary><ul class="plain muted"><li>Camina o muévete suave 1 a 2 minutos.</li><li>Movilidad de hombros, muñecas y caderas.</li><li>10 sentadillas sin peso.</li><li>8 flexiones inclinadas o contra la pared.</li><li>Una serie fácil del primer ejercicio.</li></ul><p class="muted" style="margin:6px 0 0">No lo conviertas en otra sesión. Si algo duele, no insistas.</p></details><div class="exlist">';
  S0.ex.forEach(function(id){
    var e=EX[id],last=lastFor(id),lv=e.lad?LAD[e.lad][levelOf(id)].n:'';
    var tag=readyTwice(id)?'<span class="tag">Listo para subir</span>':((last&&last.rv>=2&&!canProgress(last)&&last.sets.filter(isNum).slice(-1)[0]<hiOf(id,levelOf(id)))?'<span class="tag">Consolida</span>':'');
    h+='<div class="ex"><div class="name">'+esc(e.n)+tag+'</div>'+
       '<div class="meta">'+(lv?esc(lv)+'. ':'')+metaText(id)+' · descanso '+fmt(restFor(id))+'</div>'+
       '<div class="last">'+(last?'Última vez: '+last.sets.filter(isNum).join('-')+(last.rv<2?' (rutina anterior)':''):'Primera vez')+' · Meta: '+suggest(id,0)+(e.unit==='seg'?' s':'')+'</div></div>';
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
  var d={date:today(),sess:sess,order:SES[sess].ex.slice(),ei:0,si:0,sets:{},levels:{},rir:{},tech:{},pain:0,cur:null,rest:null,stage:'work',note:''};
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
function startRest(id){
  var d=S.draft,sec=restFor(id||curId()); d.rest={end:Date.now()+sec*1000,total:sec,fired:false};
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
    if(left<=0&&!d.rest.fired){d.rest.fired=true;save();beep();buzz();if(box){box.classList.add('done');}var t=$('restTxt');if(t){t.textContent='Listo cuando estés preparado.';}}
  },250);
}
function fmt(s){return Math.floor(s/60)+':'+pad(s%60);}

var RIRS=[[5,'5 o más'],[3,'3 a 4'],[1,'1 a 2'],[0,'Ninguna']];
var PAINS=['Sin molestias','Molestia leve','Dolor'];
function renderPark(){
  var d=S.draft,p=$('park'),h;
  if(!d){closePark();return;}
  d.rir=d.rir||{};d.tech=d.tech||{};
  var ph=PHASES[phaseNo()];
  h='<div class="inner">';
  if(d.stage==='end'){
    h+='<div class="ptop"><h2 style="margin:0">Resumen</h2><button class="btn alt small" data-act="exit">Salir</button></div>';
    var ups='';
    d.order.forEach(function(id){
      var vals=(d.sets[id]||[]).filter(isNum); if(!vals.length){return;}
      var rv=d.rir[id],tc=d.tech[id];
      h+='<div class="card" style="margin:0"><b>'+esc(EX[id].n)+'</b>'+
         (EX[id].lad?'<div class="muted">'+esc(LAD[EX[id].lad][d.levels[id]].n)+'</div>':'')+
         '<div style="margin-top:6px">'+vals.map(function(v,i){return 'Serie '+(i+1)+': <b>'+v+'</b>'+(EX[id].unit==='seg'?' s':'');}).join(' · ')+'</div>'+
         '<div class="muted" style="margin-top:4px">'+(isNum(rv)?'RIR: '+RIRS.filter(function(x){return x[0]===rv;})[0][1]:'RIR sin registrar')+(tc?' · Técnica: '+(tc==='ok'?'buena':'mejorable'):'')+'</div></div>';
      var cur={sets:d.sets,levels:d.levels,rir:d.rir,tech:d.tech},prev=prevWith(id,1)[0];
      if(qualSess(cur,id,d.levels[id])&&prev&&qualSess(prev,id,d.levels[id])){
        if(EX[id].lad&&d.levels[id]<LAD[EX[id].lad].length-1){
          ups+='<div class="msg"><b>'+esc(EX[id].n)+':</b> llegaste al máximo del rango dos sesiones seguidas, con buena técnica. Próxima variante: '+esc(LAD[EX[id].lad][d.levels[id]+1].n)+'.<br><button class="btn small" style="margin-top:8px" data-act="lvlup" data-id="'+id+'">Subir de nivel</button></div>';
        }else if(EX[id].hint){
          ups+='<div class="msg"><b>'+esc(EX[id].n)+':</b> llegaste al máximo del rango dos sesiones seguidas, con buena técnica. '+esc(EX[id].hint)+'</div>';
        }
      }
    });
    h+=ups+'<div class="card" style="margin:0"><b>¿Cómo estuvo la sesión?</b><div class="chips" role="group" aria-label="Esfuerzo de la sesión">';
    [1,2,3,4].forEach(function(v){h+='<button class="chip" data-act="rpe" data-v="'+v+'" aria-pressed="'+(d.rpe===v)+'">'+RPE[v]+'</button>';});
    h+='</div><b style="display:block;margin-top:10px">¿Molestias?</b><div class="chips" role="group" aria-label="Molestias">';
    PAINS.forEach(function(x,v){h+='<button class="chip" data-act="pain" data-v="'+v+'" aria-pressed="'+(d.pain===v)+'">'+x+'</button>';});
    h+='</div>'+(d.pain===2?'<div class="msg warn">Si el dolor es agudo, en una articulación o no se va, deja ese ejercicio y busca orientación profesional. No entrenes a través del dolor.</div>':'')+'</div>'+
       '<label class="lbl">Nota<textarea id="pnote" placeholder="Cómo te sentiste, qué te costó">'+esc(d.note||'')+'</textarea></label>'+
       '<button class="btn" data-act="finish">Guardar sesión</button>'+
       '<button class="btn alt" data-act="undo">Corregir la última serie</button>';
    h+='</div>';p.innerHTML=h;return;
  }
  if(d.stage==='rate'){
    var rid=d.order[d.ei],rvs=(d.sets[rid]||[]).filter(isNum);
    h+='<div class="ptop"><span class="muted">Ejercicio '+(d.ei+1)+' de '+d.order.length+' · '+esc(SES[d.sess].n)+'</span><button class="btn alt small" data-act="exit">Pausar</button></div>';
    h+='<h1 class="pname">'+esc(EX[rid].n)+'</h1><div class="muted">'+rvs.map(function(v){return v+(EX[rid].unit==='seg'?' s':'');}).join(' · ')+'</div>';
    h+='<div class="card" style="margin:0"><b>¿Cuántas repeticiones más podrías haber hecho con buena técnica?</b><div class="chips" role="group" aria-label="Repeticiones en reserva">';
    RIRS.forEach(function(x){h+='<button class="chip" data-act="rir" data-v="'+x[0]+'" aria-pressed="'+(d.rir[rid]===x[0])+'">'+x[1]+'</button>';});
    h+='</div><div class="muted">Objetivo en '+esc(ph.n.toLowerCase())+': '+esc(ph.rir)+'.</div></div>';
    h+='<div class="card" style="margin:0"><b>Técnica</b><div class="chips" role="group" aria-label="Técnica">'+
       '<button class="chip" data-act="tech" data-v="ok" aria-pressed="'+(d.tech[rid]==='ok')+'">Buena</button>'+
       '<button class="chip" data-act="tech" data-v="mal" aria-pressed="'+(d.tech[rid]==='mal')+'">Mejorable</button></div>'+
       '<div class="muted">Si la técnica se deteriora, la app mantiene la meta en vez de subirla.</div></div>';
    h+='<button class="btn" data-act="ratenext" style="font-size:20px;padding:18px">Continuar</button>';
    h+='<div class="row" style="justify-content:space-between"><button class="btn alt small" data-act="undo">Deshacer última serie</button><button class="btn alt small" data-act="toend">Terminar</button></div>';
    h+='</div>';p.innerHTML=h;return;
  }
  var id=curId(),e=EX[id],tot=setsFor(id),r=rangeOf(id),last=lastFor(id),nrec=(d.sets[id]||[]).filter(isNum).length;
  h+='<div class="ptop"><span class="muted">Ejercicio '+(d.ei+1)+' de '+d.order.length+' · '+esc(SES[d.sess].n)+'</span>'+
     '<button class="btn alt small" data-act="exit">Pausar</button></div>';
  if(d.rest){
    var left=Math.max(0,Math.ceil((d.rest.end-Date.now())/1000));
    h+='<div class="rest'+(left<=0?' done':'')+'" id="restBox"><div class="muted" id="restTxt">'+(left<=0?'Listo cuando estés preparado.':'Descanso')+'</div>'+
       '<div class="time" id="restTime">'+fmt(left)+'</div>'+
       '<div class="row" style="justify-content:center;margin-top:10px"><button class="btn alt small" data-act="rest15">+15 s</button><button class="btn alt small" data-act="rest60">+1 min</button><button class="btn alt small" data-act="skiprest">Saltar</button></div></div>';
  }
  h+='<h1 class="pname">'+esc(e.n)+'</h1>';
  if(e.lad){h+='<div><b>'+esc(LAD[e.lad][d.levels[id]].n)+'</b></div>';}
  h+='<div class="muted">'+metaText(id)+(last?' · Última vez: '+last.sets.filter(isNum).join('-'):' · Primera vez')+'</div>';
  h+='<div class="muted">Objetivo: '+esc(ph.rir)+'.</div>';
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
     (nrec>=1?'<button class="btn alt small" data-act="endex">Terminar ejercicio</button>':'<button class="btn alt small" data-act="skipex">Saltar ejercicio</button>')+
     '<button class="btn alt small" data-act="toend">Terminar</button></div>';
  if(e.alt&&nrec===0){h+='<button class="btn alt small" data-act="subst" style="margin-top:0">Sustituir por: '+esc(EX[e.alt].n)+'</button>';}
  h+='</div>';p.innerHTML=h;
  p.dataset.step=step;
}
function advance(){
  var d=S.draft,id=curId();
  d.si++;
  if(d.si>=setsFor(id)){d.stage='rate';d.rest=null;}
  else{d.cur=suggest(id,d.si);startRest(id);}
}
function parkAction(act,el){
  var d=S.draft; if(!d&&act!=='noop'){return;}
  d.rir=d.rir||{};d.tech=d.tech||{};
  var id=d.stage==='work'?curId():null,step=id&&EX[id].unit==='seg'?5:1;
  if(act==='inc'){d.cur=d.cur+step;}
  else if(act==='dec'){d.cur=Math.max(0,d.cur-step);}
  else if(act==='done'){primeAudio();if(d.sw){if(d.sw.start){d.cur=Math.round(swElapsed(d)/1000);}d.sw=null;}d.sets[id][d.si]=d.cur;advance();}
  else if(act==='swstart'){primeAudio();d.sw=d.sw||{acc:0,start:null};d.sw.start=Date.now();d.rest=null;}
  else if(act==='swstop'){if(d.sw&&d.sw.start){d.sw.acc+=Date.now()-d.sw.start;d.sw.start=null;d.cur=Math.max(0,Math.round(d.sw.acc/1000));}}
  else if(act==='swreset'){d.sw=null;}
  else if(act==='rir'){d.rir[d.order[d.ei]]=+el.getAttribute('data-v');}
  else if(act==='tech'){d.tech[d.order[d.ei]]=el.getAttribute('data-v');}
  else if(act==='pain'){d.pain=+el.getAttribute('data-v');}
  else if(act==='ratenext'){
    var rid=d.order[d.ei];
    d.ei++;d.si=0;d.stage='work';
    if(d.ei>=d.order.length){d.stage='end';d.rest=null;}
    else{d.cur=suggest(curId(),0);startRest(rid);}
  }
  else if(act==='endex'){
    var k=(d.sets[id]||[]).filter(isNum).length;
    if(k>=1){d.sw=null;d.si=k;d.stage='rate';d.rest=null;}
  }
  else if(act==='subst'){
    var alt=EX[id].alt;
    if(alt&&!(d.sets[id]||[]).some(isNum)){
      d.order[d.ei]=alt;d.sets[alt]=d.sets[alt]||[];d.levels[alt]=levelOf(alt);d.si=0;d.cur=suggest(alt,0);d.rest=null;
    }
  }
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
  else if(act==='rest15'||act==='rest60'){if(d.rest){var add=act==='rest15'?15:60;d.rest.end+=add*1000;d.rest.total+=add;d.rest.fired=false;var b=$('restBox');if(b){b.classList.remove('done');}var t=$('restTxt');if(t){t.textContent='Descanso';}}}
  else if(act==='exit'){if(d.stage==='end'){var n=$('pnote');if(n){d.note=n.value;}}save();closePark();return;}
  else if(act==='lvlup'){
    var lid=el.getAttribute('data-id'),e=EX[lid];
    S.settings.levels[lvKey(lid)]=Math.min(LAD[e.lad].length-1,d.levels[lid]+1);
    d.levelUp=d.levelUp||{};d.levelUp[lid]=true;
    el.parentNode.innerHTML='<b>'+esc(e.n)+':</b> pasarás a '+esc(LAD[e.lad][S.settings.levels[lvKey(lid)]].n)+' desde la próxima sesión.';
    save();return;
  }
  else if(act==='finish'){
    var nn=$('pnote'); if(nn){d.note=nn.value;}
    var any=false,sets={},rir={},tech={};
    d.order.forEach(function(x){var v=(d.sets[x]||[]).filter(isNum);if(v.length){any=true;sets[x]=v;if(isNum(d.rir[x])){rir[x]=d.rir[x];}if(d.tech[x]){tech[x]=d.tech[x];}}});
    if(!any){toast('Registra al menos una serie.');return;}
    S.sessions[d.date+'_'+d.sess]={date:d.date,sess:d.sess,sets:sets,levels:d.levels,rir:rir,tech:tech,pain:d.pain||0,note:d.note,rpe:d.rpe||null,rv:2,ts:Date.now()};
    S.draft=null;save();closePark();renderProgreso();celebrate('Sesión guardada.');return;
  }
  save();renderPark();tickRest();tickSw();
}

/* ================= Render: Proteína ================= */
var porciones=1;
var SLOTS=[['des','Desayuno'],['alm','Almuerzo'],['onc','Once'],['cen','Cena']];
function autoSlot(){var h=new Date().getHours();return h<11?'des':(h<16?'alm':(h<20?'onc':'cen'));}
var slot=autoSlot();
function slotName(k){var r=SLOTS.filter(function(x){return x[0]===k;})[0];return r?r[1]:'';}
function renderProt(){
  var t=today(),tot=protTotal(t),meta=S.settings.metaProt,pct=clamp(tot/meta*100,0,100),falta=Math.max(0,Math.round(meta-tot));
  var h='<div class="card"><h2>Hoy</h2><div class="big">'+Math.round(tot)+' <span style="font-size:22px;color:var(--muted)">de '+meta+' g</span></div>'+
    '<div class="bar'+(tot>=meta?' over':'')+'"><i style="width:'+pct+'%"></i></div>'+
    '<div class="muted">'+(tot>=meta?'Meta cumplida.':'Te faltan '+falta+' g.')+'</div></div>';
  h+='<div class="card"><h2>Agregar</h2><div class="muted">Comida</div><div class="chips" role="group" aria-label="Comida del día">';
  SLOTS.forEach(function(x){h+='<button class="chip" data-act="slot" data-k="'+x[0]+'" aria-pressed="'+(x[0]===slot)+'">'+x[1]+'</button>';});
  h+='</div><div class="muted">Porciones</div><div class="chips" role="group" aria-label="Porciones">';
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
  es.forEach(function(x,i){h+='<div class="entry"><span>'+esc(x.n)+' · <b>'+r1(x.g)+' g</b>'+(x.m?'<br><span class="muted">'+slotName(x.m)+'</span>':'')+'</span><button data-act="pdel" data-i="'+i+'">Quitar</button></div>';});
  if(es.length){
    var tl=SLOTS.map(function(x){var g=es.filter(function(y){return y.m===x[0];}).reduce(function(a,y){return a+y.g;},0);return g?x[1]+' '+Math.round(g)+' g':'';}).filter(Boolean);
    if(tl.length){h+='<p class="muted" style="margin:10px 0 0">'+tl.join(' · ')+'. Como referencia, unos 25 a 30 g por comida ayudan a llegar al total, pero no son cuotas: importa más el día completo.</p>';}
  }
  h+='</div>';
  var vals=[],labs=[],sum=0,d,k;
  for(var j=6;j>=0;j--){d=new Date();d.setDate(d.getDate()-j);k=ymd(d);var v=Math.round(protTotal(k));vals.push(v);sum+=v;labs.push(DIAS[(d.getDay()+6)%7]);}
  h+='<div class="card"><h2>Últimos 7 días</h2>'+barChart(vals,labs,meta,'Proteína diaria de los últimos 7 días')+
     '<p class="muted">Promedio: '+Math.round(sum/7)+' g al día. La línea marca tu meta de '+meta+' g.</p></div>';
  $('sec-prot').innerHTML=h;
}
function addProt(n,g){
  var t=today(); S.protein[t]=S.protein[t]||[];
  S.protein[t].push({n:n,g:g,m:slot,ts:Date.now()}); save(); renderProt(); renderHoy(); renderProgreso();
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
  /* lo que va bien primero */
  var lg=c._logged,fv=fvOf(c)/Math.max(lg,1),pd=0,pn=0,i,d;
  for(i=0;i<7;i++){d=new Date();d.setDate(d.getDate()-i);var pt=protTotal(ymd(d));if(pt>0){pd+=pt;pn++;}}
  if(pn>=3&&pd/pn>=S.settings.metaProt*0.9){add('ok','Proteína al día','Tu promedio en los días registrados ('+Math.round(pd/pn)+' g) está cerca o sobre tu meta de '+S.settings.metaProt+' g.','Mantenla repartida en tus comidas.');}
  if(lg>=3&&fv>=4.5){add('ok','Buena base de fruta y verdura','Estás cerca o sobre las 5 porciones diarias que recomienda la OMS. Ayuda a la saciedad, la digestión y la energía estable.','Sigue variando tipos y colores.');}
  if(rap>=3){add('warn','Comida rápida y frituras: '+rap+' veces en 7 días',
    'Suelen aportar mucha grasa y sal y poca fibra. Si son habituales, pueden desplazar la fruta, la verdura y la proteína, y dejarte con pesadez o sueño. Una vez no cambia nada: importa el patrón de varias semanas.',
    'Si quieres bajarlas, parte por una menos a la semana. En un local de comida rápida elige tamaño chico y suma fruta o verdura en otra comida.');}
  if((c.bebida_azucarada||0)>=3){add('warn','Bebidas azucaradas: '+c.bebida_azucarada+' veces en 7 días',
    'El azúcar líquida da energía rápida y luego puede venir un bajón con hambre. La OMS recomienda que el azúcar libre sea menos del 10% de las calorías del día (unos 50 g con 2.000 kcal), y una lata de bebida normal suele aportar más de 30 g.',
    'Prueba agua, agua con gas o té sin azúcar en parte de esas veces.');}
  if((c.dulce||0)>=4){add('warn','Dulces y postres: '+c.dulce+' veces en 7 días',
    'Dan energía rápida y después puede venir cansancio o más ganas de dulce. Suman calorías que llenan poco.',
    'Si te gustan, déjalos para momentos concretos y ten a mano fruta, yogurt natural o frutos secos.');}
  if((c.procesado||0)>=3){add('warn','Embutidos y snacks de bolsa: '+c.procesado+' veces en 7 días',
    'Tienen mucha sal (la OMS recomienda menos de 5 g al día), que puede hincharte y subir la presión. Además la IARC, agencia de la OMS, clasifica las carnes procesadas como cancerígenas para las personas (grupo 1, cáncer colorrectal) y el riesgo aumenta con la cantidad. El riesgo individual sigue siendo pequeño.',
    'Alterna con pollo, atún, huevo o legumbres, y con frutos secos sin sal en vez del snack de bolsa.');}
  if((c.alcohol||0)>=3){add('warn','Alcohol: '+c.alcohol+' veces en 7 días',
    'Puede empeorar el sueño, deshidratar y sumar calorías sin nutrientes. Al día siguiente puedes sentir cansancio y recuperarte peor del entrenamiento.',
    'Si lo tomas, alterna con agua y evita hacerlo justo antes de dormir.');}
  if(lg>=3&&fv<3){add('warn','Poca fruta y verdura: '+r1(fv)+' porciones al día en promedio',
    'Con poca fibra puedes sentirte menos lleno y tener digestión más lenta. La OMS recomienda al menos 400 g al día, unas 5 porciones, sin contar papas.',
    'Suma una fruta en el desayuno, una ensalada al almuerzo y verduras cocidas en la cena.');}
  if(lg>=3&&!out.some(function(x){return x.tone==='warn';})){add('ok','Sin observaciones esta semana','Con lo registrado no se repite ningún grupo que convenga mirar.','Sigue registrando para ver cambios con el tiempo.');}
  return {alerts:out,logged:lg};
}
var cant=1;
function renderComida(){
  var t=today(),td=catCounts(0,1),fv=fvOf(td),pct=clamp(fv/5*100,0,100),es=mealsOn(t);
  var h='<div class="card"><h2>Fruta y verdura de hoy</h2><div class="big">'+fv+' <span style="font-size:22px;color:var(--muted)">de 5 porciones</span></div>'+
    '<div class="bar'+(fv>=5?' over':'')+'"><i style="width:'+pct+'%"></i></div>'+
    '<div class="muted">'+(fv>=5?'Meta cumplida.':'Meta de la OMS: al menos 400 g al día, unas 5 porciones (sin contar papas). Un batido cuenta como máximo 1.')+'</div></div>';
  h+='<div class="card"><h2>Para ganar masa</h2><p class="muted" style="margin:0">No basta con la proteína: también cuentan comer lo suficiente, carbohidratos para entrenar, grasas variadas, fruta, verdura y agua. Esta app no calcula tus calorías, así que no te fija una meta de energía.</p></div>';
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
  h+='<p class="muted" style="margin:12px 0 0">Son observaciones, no diagnósticos. Los umbrales de veces por semana son reglas internas de la app, no normas oficiales; las categorías se detectan por palabras clave, las porciones son aproximadas y la app no calcula calorías. Importa el patrón de varios días, no una comida suelta. No reemplaza a un nutricionista.</p></div>';
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
        '<div class="stat"><b>'+last4()+'</b><span>sesiones en las últimas 4 semanas</span></div></div></div>';
  h+='<div class="card"><h2>Metas</h2>';
  goalsList().forEach(function(g){
    var ok=g.cur>=g.goal,shown=Math.min(g.cur,g.goal),pc=Math.round(shown/g.goal*100);
    h+='<div class="goal"><div class="goal-top"><span>'+esc(g.n)+(ok?'<span class="tag">Cumplida</span>':'')+'</span><b>'+shown+' / '+g.goal+'</b></div>'+
       '<div class="bar'+(ok?' over':'')+'" role="progressbar" aria-valuemin="0" aria-valuemax="'+g.goal+'" aria-valuenow="'+shown+'" aria-label="'+esc(g.n)+'"><i style="width:'+pc+'%"></i></div></div>';
  });
  h+='<p class="muted" style="margin:6px 0 0">Se calculan con tus tests y sesiones guardadas. En dominadas cuentan las series en nivel Estrictas o el máximo del test.</p></div>';
  h+='<div class="card"><h2>Sesiones por semana</h2>'+barChart(vals,labs,3,'Sesiones por semana en las últimas 8 semanas')+'<p class="muted">Últimas 8 semanas. La línea marca la meta de 3.</p></div>';

  var wv=[],wlb=[],planned=0;
  ['A','B','C'].forEach(function(c){SES[c].ex.forEach(function(id){planned+=setsFor(id);});});
  for(i=7;i>=0;i--){d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()-7*i);var wkk=ymd(d),sn=0;
    ss.forEach(function(x){if(ymd(mondayOf(parse(x.date)))===wkk){Object.keys(x.sets||{}).forEach(function(id){sn+=x.sets[id].length;});}});
    wv.push(sn);wlb.push(pad(d.getDate())+'/'+pad(d.getMonth()+1));}
  h+='<div class="card"><h2>Series por semana</h2>'+barChart(wv,wlb,planned,'Series totales por semana en las últimas 8 semanas')+'<p class="muted">Últimas 8 semanas. La línea marca las series planificadas con tu fase actual.</p></div>';

  var opts='';Object.keys(EX).forEach(function(id){opts+='<option value="'+id+'"'+(id===chartEx?' selected':'')+'>'+esc(EX[id].n)+(id==='plancha-c'?' (casa)':'')+'</option>';});
  var pts=[];ss.forEach(function(s){var v=((s.sets&&s.sets[chartEx])||[]).filter(isNum);if(v.length){pts.push({x:s.date.slice(8)+'/'+s.date.slice(5,7),y:Math.max.apply(null,v)});}});
  h+='<div class="card"><h2>Evolución</h2><label class="lbl">Ejercicio<select id="chartEx" data-act="chartEx">'+opts+'</select></label>'+
     '<div style="margin-top:10px">'+(pts.length>=2?lineChart(pts,'Mejor serie por sesión'):'<p class="muted">Necesitas al menos 2 sesiones con este ejercicio para ver la línea.</p>')+'</div>'+
     '<p class="muted">Mejor serie de cada sesión.</p></div>';

  var wk2=Object.keys(S.weights).sort(),wl=wk2.length?S.weights[wk2[wk2.length-1]]:S.settings.peso;
  h+='<div class="card"><h2>Peso corporal</h2><div class="fields"><label class="lbl">Peso de hoy (kg)<input type="number" id="w-kg" step="0.1" inputmode="decimal" value="'+wl+'"></label></div>'+
     '<button class="btn" data-act="savew">Guardar peso</button>';
  if(wk2.length>=2){var wp=wk2.slice(-12).map(function(k){return {x:k.slice(8)+'/'+k.slice(5,7),y:S.weights[k]};});h+='<div style="margin-top:10px">'+lineChart(wp,'Peso corporal',true)+'</div>';}
  var aw=avgW(0,7),pw=avgW(7,7);
  if(aw!==null){h+='<p style="margin:10px 0 0">Promedio de los últimos 7 días: <b>'+aw+' kg</b>'+(pw!==null?' ('+(aw-pw>=0?'+':'')+r1(aw-pw)+' kg frente a la semana anterior)':'')+'.</p><p class="muted" style="margin:4px 0 0">Mira la tendencia, no un día suelto. Un cambio de peso no indica por sí solo si es músculo o grasa.</p>';}
  h+='<p class="muted">'+(S.settings.metaAuto?'La meta de proteína se recalcula con tu peso (1,6 g por kilo).':'Tu meta de proteína está fijada a mano y no cambia con el peso.')+'</p></div>';

  h+='<div class="card"><h2>Historial</h2>';
  var hk=Object.keys(S.sessions).sort(function(a,b){var x=S.sessions[a],y=S.sessions[b];return x.date<y.date?1:(x.date>y.date?-1:(y.ts||0)-(x.ts||0));}).slice(0,10);
  if(!hk.length){h+='<p class="muted">Aún no hay sesiones guardadas.</p>';}
  hk.forEach(function(k){var x=S.sessions[k],ns=Object.keys(x.sets||{}).reduce(function(a,id){return a+x.sets[id].length;},0);
    h+='<div class="entry"><span><b>'+x.date.slice(8)+'/'+x.date.slice(5,7)+' · '+esc(SES[x.sess]?SES[x.sess].n:x.sess)+'</b><br><span class="muted">'+ns+' series'+(x.rpe?' · '+RPE[x.rpe]:'')+(rirAvg(x)!==null?' · RIR '+rirAvg(x):'')+(x.pain?' · '+['','molestia leve','dolor'][x.pain]:'')+(x.note?' · '+esc(x.note):'')+'</span></span>'+
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

  h+='<div class="card"><h2>Niveles</h2><p class="muted">Se sube de variante cuando llegas al máximo del rango en todas las series, con buena técnica y RIR adecuado, durante dos sesiones seguidas. Las flexiones de casa usan el mismo nivel que las del parque. Puedes cambiarlo a mano.</p>';
  ['dom-pro','remo','flexiones'].forEach(function(id){
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
    '<li><b>Sábado</b>, parque: sesión A. Tirón y piernas.</li>'+
    '<li><b>Domingo</b>, parque: sesión B. Empuje y core, sin dominadas ni remos exigentes.</li>'+
    '<li><b>Miércoles o jueves</b>, casa: sesión C, de 15 a 20 minutos, con peso corporal y una mochila.</li>'+
    '<li><b>Otros días</b>: recuperación.</li></ul>'+
    '<p class="muted">Si una semana vas sobrecargado, reduce o salta la C. No compenses duplicando el fin de semana.</p></div>';
  var po='';[1,2,3].forEach(function(n){po+='<option value="'+n+'"'+(n===ci.phase?' selected':'')+'>Fase '+n+': '+PHASES[n].n+'</option>';});
  h+='<div class="card"><h2>Fase de entrenamiento</h2><label class="lbl">Fase actual<select data-act="phase">'+po+'</select></label>'+
    '<p style="margin:10px 0 0">'+esc(PHASES[ci.phase].txt)+' Objetivo: '+esc(PHASES[ci.phase].rir)+'. Semana '+ci.week+' en esta fase.</p>'+
    '<p class="muted">Las semanas son orientativas. Cambia de fase según tu técnica, tu recuperación y tu rendimiento, no solo por el calendario.</p>'+
    '<label class="hab"><input type="checkbox" data-act="easy"'+(s.easyWeek?' checked':'')+'><span>Semana suave: una serie menos por ejercicio</span></label>'+
    '<p class="muted" style="margin:6px 0 0">Actívala si acumulas fatiga, duermes mal o tienes molestias. No hay descarga obligatoria cada cierto número de semanas.</p>'+
    '<button class="btn alt" data-act="resetcycle">Reiniciar el conteo de semanas de esta fase</button></div>';
  h+='<div class="card"><h2>Reglas</h2><ul class="plain">'+
    '<li>Deja repeticiones en reserva: la meta no es llegar al fallo. Lo ajustas en cada ejercicio con el RIR.</li>'+
    '<li>No tienes que mejorar en cada sesión. Si la técnica se deteriora o vienes cansado, mantén.</li>'+
    '<li>Descansa lo que necesites: 2 a 3 minutos en dominadas, 1 a 2 en el resto. Puedes ampliar el descanso en la sesión.</li>'+
    '<li>Baja con control. Si hay dolor agudo, en una articulación o que no se va, para y busca orientación profesional.</li>'+
    '<li>Duerme 7 a 8 horas y come lo suficiente. Ahí se produce la mejora.</li></ul></div>';
  h+='<div class="card"><h2>Ajustes</h2><div class="fields">'+
    '<label class="lbl">Peso (kg)<input type="number" id="s-peso" step="0.1" inputmode="decimal" value="'+s.peso+'"></label>'+
    '<label class="lbl">Meta de proteína (g)<input type="number" id="s-meta" inputmode="numeric" value="'+s.metaProt+'"></label>'+
    '<label class="lbl">Ajuste de descanso (segundos, + o −)<input type="number" id="s-rest" step="15" inputmode="numeric" value="'+(+s.restAdj||0)+'"></label></div>'+
    '<p class="muted">La meta se calcula como 1,6 g por kilo de peso. Si la cambias a mano, deja de actualizarse sola. El descanso base depende del ejercicio; este ajuste lo alarga o lo acorta en todos.</p>'+
    '<button class="btn" data-act="savesettings">Guardar ajustes</button></div>';
  var hasPrev=false;try{hasPrev=!!localStorage.getItem(KEY+'-prev');}catch(e){}
  h+='<div class="card"><h2>Respaldo</h2><p class="muted">Tus datos viven solo en este teléfono. Si cambias de teléfono o borras los datos del navegador, se pierden. Descarga un respaldo de vez en cuando.</p>'+
    '<button class="btn" data-act="export">Descargar respaldo</button>'+
    '<label class="btn alt" style="display:block;text-align:center;cursor:pointer">Restaurar respaldo<input type="file" id="imp" accept="application/json,.json" hidden></label>'+
    '<p class="muted" style="margin:8px 0 0">Antes de restaurar, la app guarda una copia de tus datos actuales.</p>'+
    (hasPrev?'<button class="btn alt" data-act="undoimport">Volver a los datos anteriores a la última restauración</button>':'')+
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
function validBackup(o){
  var isObj=function(x){return x&&typeof x==='object'&&!Array.isArray(x);};
  if(!isObj(o)||!isObj(o.settings)||!isObj(o.sessions)){return false;}
  if(['tests','habits','protein','weights','meals'].some(function(k){return o[k]!==undefined&&!isObj(o[k]);})){return false;}
  return Object.keys(o.sessions).every(function(k){var x=o.sessions[k];return isObj(x)&&typeof x.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&(x.sets===undefined||isObj(x.sets));});
}
function importData(file){
  var fr=new FileReader();
  fr.onload=function(){
    try{
      var o=JSON.parse(fr.result);
      if(!validBackup(o)){throw new Error('formato');}
      if(!window.confirm('Esto reemplaza los datos actuales de la app (se guarda una copia por si te arrepientes). ¿Continuar?')){return;}
      var prev=localStorage.getItem(KEY);
      if(prev){localStorage.setItem(KEY+'-prev',prev);}
      localStorage.setItem(KEY,JSON.stringify(o));load();renderAll();celebrate('Respaldo restaurado.');
    }catch(e){$('bstatus').textContent='El archivo no es un respaldo válido. No se cambió nada.';}
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
      (S.protein[ymd(y0)]||[]).forEach(function(x){var tt=today();S.protein[tt]=S.protein[tt]||[];S.protein[tt].push({n:x.n,g:x.g,m:x.m,ts:Date.now()});});
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
    case 'slot':slot=el.getAttribute('data-k');renderProt();break;
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
    case 'resetcycle':S.settings.phaseStart=ymd(mondayOf(new Date()));save();renderPlan();renderHoy();toast('Conteo reiniciado.');break;
    case 'savesettings':
      var peso=parseFloat($('s-peso').value),meta=parseFloat($('s-meta').value),rest=parseFloat($('s-rest').value);
      var metaEdited=meta>0&&Math.round(meta)!==S.settings.metaProt;
      if(peso>0){
        S.settings.peso=peso;
        if(!metaEdited&&S.settings.metaAuto){S.settings.metaProt=Math.round(peso*1.6);}
      }
      if(metaEdited){S.settings.metaProt=Math.round(meta);S.settings.metaAuto=false;}
      if(isFinite(rest)){S.settings.restAdj=clamp(Math.round(rest),-30,90);}
      save();renderAll();toast('Ajustes guardados.');break;
    case 'export':exportData();break;
    case 'undoimport':
      try{var pv=localStorage.getItem(KEY+'-prev');if(pv&&window.confirm('Esto vuelve a los datos que tenías antes de restaurar. ¿Continuar?')){localStorage.setItem(KEY,pv);localStorage.removeItem(KEY+'-prev');load();renderAll();toast('Datos anteriores recuperados.');}}catch(e){}
      break;
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
  else if(act==='level'){S.settings.levels[lvKey(el.getAttribute('data-id'))]=+el.value;save();renderHoy();toast('Nivel actualizado.');}
  else if(act==='phase'){S.settings.phase=+el.value;S.settings.phaseStart=ymd(mondayOf(new Date()));save();renderAll();toast('Fase: '+PHASES[phaseNo()].n+'.');}
  else if(act==='easy'){S.settings.easyWeek=el.checked;save();renderAll();toast(el.checked?'Semana suave activada.':'Semana suave desactivada.');}
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
