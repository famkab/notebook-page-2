/* home page: show the clean address */
try{if(/\/index\.html$/.test(location.pathname)&&history.replaceState){history.replaceState(null,"",location.pathname.replace(/index\.html$/,"")+location.search+location.hash);}}catch(e){}
/* shared interactive layer: reading settings, pages, and the interactive figures */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var store={get:function(k,d){try{return localStorage.getItem("fa-"+k)||d}catch(e){return d}},set:function(k,v){try{localStorage.setItem("fa-"+k,v)}catch(e){}}};
var page=document.body.getAttribute("data-page")||"";

/* ---------- reading settings ---------- */
var PAPER={dots:"radial-gradient(var(--ccfcabd) 1.2px, transparent 1.3px)",lined:"linear-gradient(var(--cddd8cc) 1px, transparent 1px)",grid:"linear-gradient(90deg, var(--cddd8cc) 1px, transparent 1px), linear-gradient(var(--cddd8cc) 1px, transparent 1px)",blank:"none"};
var SIZE={dots:"22px 22px",lined:"100% 32px",grid:"28px 28px",blank:"auto"};
var bg=$("main > div > div[aria-hidden='true']"), own=bg?{img:bg.style.backgroundImage,size:bg.style.backgroundSize}:null;
function apply(){
  var r=document.documentElement, th=store.get("theme","light");
  var dark=th==="dark";
  r.setAttribute("data-theme",dark?"dark":"light");
  r.setAttribute("data-ink",store.get("ink","colour"));
  var p=store.get("paper","page");
  if(bg){ if(p==="page"||!PAPER[p]){bg.style.backgroundImage=own.img;bg.style.backgroundSize=own.size}else{bg.style.backgroundImage=PAPER[p];bg.style.backgroundSize=SIZE[p]} }
}
apply();

var PAGES=[["Start here",""],["index.html","1","Contents"],["how-i-work.html","2","About me"],
 ["Projects",""],["beeline.html","3–8","Beeline"],["learning-meter.html","9–14","Learning Meter"],["jump-math.html","15–18","JUMP Math Lab"],["sugar.html","19–21","The Artificial Leaf"],
 ["Beeline artefacts",""],["beeline-service-landscape.html","·","Service landscape"],["beeline-problem-model.html","·","Problem model"],["beeline-decision-trail.html","·","Decision trail"],["beeline-metric-ladder.html","·","Metric ladder"],["beeline-experience-curve.html","·","MVP experience curve"],["beeline-conversational-layer.html","·","Conversational layer"],
 ["Other work",""],["edeh.html","22","Digital Education Hub"],["beeline-unplugged.html","23–26","Beeline Unplugged"],["mbacc-summit.html","27","MBacc Summit"],
 ["Skills",""],["skill-llm-evaluation.html","·","LLM evaluation"],["skill-feedback-design.html","·","Feedback design"],["skill-journey-mapping.html","·","Journey and experience mapping"],["skill-service-blueprints.html","·","Service blueprints"],["skill-co-design.html","·","Co-design"],["skill-personas.html","·","Personas"],["skill-ab-testing.html","·","A/B testing"],["skill-learning-analytics.html","·","Learning analytics"],["skill-prototyping.html","·","Prototyping"],
 ["Rough work",""],["rough-work-beeline.html","·","Behind Beeline"],["rough-work-learning-meter.html","·","Behind the Learning Meter"],["rough-work-jump-math.html","·","Behind JUMP Math Lab"],["rough-work-artificial-leaf.html","·","Behind The Artificial Leaf"]];
var here=location.pathname.split("/").pop()||"index.html";
function pagesHTML(){return PAGES.map(function(p){
  if(p[1]==="") return '<div class="grp">'+p[0].toUpperCase()+'</div>';
  return '<a href="'+(p[0]==="index.html"?"./":p[0])+'"'+(p[0]===here?' aria-current="page"':'')+'><small>'+(p[1]==="·"?"":"P. "+p[1])+'</small><span>'+p[2]+'</span></a>';}).join("")}
function opt(g,v,label){var cur=g==="theme"?(document.documentElement.getAttribute("data-theme")==="dark"?"dark":"light"):store.get(g,g==="paper"?"page":"colour");return '<button type="button" data-set="'+g+'" data-val="'+v+'" aria-pressed="'+(cur===v)+'">'+label+'</button>'}
function setHTML(){return '<div><h4>PAPER</h4><div class="opts">'+opt("paper","page","As drawn")+opt("paper","dots","Dots")+opt("paper","lined","Lined")+opt("paper","grid","Grid")+opt("paper","blank","Blank")+'</div></div>'+
 '<div><h4>INK</h4><div class="opts">'+opt("ink","colour","Muted colour")+opt("ink","black","Black only")+'</div></div>'}
document.body.insertAdjacentHTML("beforeend",'<div class="nb-dock"><button type="button" id="nbPages" aria-expanded="false" aria-controls="nbPop">PAGES</button><button type="button" id="nbSet" aria-expanded="false" aria-controls="nbPop" aria-label="Reading settings">⚙ READING</button></div>');
var open=null;
function close(){var p=$("#nbPop");if(p)p.remove();if(open)open.setAttribute("aria-expanded","false");open=null}
function show(btn,html,label){
  if(open===btn){close();return} close();
  document.body.insertAdjacentHTML("beforeend",'<div class="nb-pop" id="nbPop" role="dialog" aria-label="'+label+'">'+html+'</div>');
  btn.setAttribute("aria-expanded","true"); open=btn;
  $$("#nbPop button[data-set]").forEach(function(b){b.onclick=function(){store.set(b.dataset.set,b.dataset.val);apply();if(typeof syncDN==="function")syncDN();
    $$('#nbPop button[data-set="'+b.dataset.set+'"]').forEach(function(x){x.setAttribute("aria-pressed",x===b)})}});
  var f=$("#nbPop button, #nbPop a");f&&f.focus();
}
$("#nbPages").onclick=function(){show(this,pagesHTML(),"Notebook pages")};
$("#nbSet").onclick=function(){show(this,setHTML(),"Reading settings")};
document.addEventListener("click",function(e){if(open&&!e.target.closest(".nb-pop,.nb-dock"))close()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&open){var b=open;close();b.focus()}});

/* ---------- helper: numbered points on a chart open a note ---------- */
function hotspots(svg,list,opts){
  if(!svg||!list) return;
  var items=$$(":scope > li",list), marks=opts.marks(svg);
  if(!items.length||items.length!==marks.length) return;
  var note=document.createElement("div"); note.className="nb-note"; note.setAttribute("aria-live","polite");
  list.parentNode.insertBefore(note,list); list.classList.add("nb-hidden");
  var tip=document.createElement("p"); tip.className="nb-tip"; tip.style.margin="0"; tip.textContent=opts.tip||"TAP A NUMBERED POINT ON THE CURVE TO READ WHAT HAPPENED THERE";
  note.parentNode.insertBefore(tip,note);
  function sel(i){
    note.innerHTML=""; var c=items[i].cloneNode(true); c.style.border="0"; c.style.padding="0"; note.appendChild(c);
    marks.forEach(function(m,j){m.g.setAttribute("aria-pressed",String(i===j)); m.ring.setAttribute("fill",i===j?"#e9dda8":"#fbfaf6")});
  }
  marks.forEach(function(m,j){
    m.g.classList.add("nb-hot"); m.g.setAttribute("tabindex","0"); m.g.setAttribute("role","button");
    m.g.setAttribute("aria-label",(items[j].querySelector("b")||items[j]).textContent.trim());
    m.g.addEventListener("click",function(){sel(j)});
    m.g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();sel(j)}});
  });
  sel(opts.start||0);
}
/* wrap each circle (and the number drawn next to it) in a <g> so it can be focused */
function groupCircles(svg,r){
  var out=[];
  $$("circle",svg).forEach(function(c){
    if(r&&Math.abs(parseFloat(c.getAttribute("r"))-r)>0.5) return;
    var g=document.createElementNS("http://www.w3.org/2000/svg","g"); c.parentNode.insertBefore(g,c); g.appendChild(c);
    var t=g.nextElementSibling; if(t&&t.tagName.toLowerCase()==="text") g.appendChild(t);
    out.push({g:g,ring:c});
  });
  return out;
}

/* ---------- pressure curve ---------- */
if(page==="beeline-service-landscape"){
  var sec=$("section[aria-labelledby='pc-h']");
  if(sec) hotspots($("svg",sec),$("ol",sec),{start:2,tip:"TAP A POINT ON THE CURVE TO SEE WHAT IS HAPPENING THERE",marks:function(s){return groupCircles(s,11)}});
}

/* ---------- experience curve: two views, numbered moments ---------- */
if(page==="beeline-experience-curve"){
  var a=$("section[aria-labelledby='curve-h']"), b=$("section[aria-labelledby='next-h']");
  if(a&&b){
    hotspots($("svg",a),$("ol",a),{start:1,marks:function(s){return groupCircles(s,17)}});
    hotspots($("svg",b),$("ol",b),{start:0,tip:"TAP A NUMBERED POINT TO READ WHAT IT WAS DESIGNED TO DO",marks:function(s){return groupCircles(s,17)}});
    var seg=document.createElement("div"); seg.className="nb-seg"; seg.setAttribute("role","group"); seg.setAttribute("aria-label","Which curve");
    seg.innerHTML='<button type="button" aria-pressed="true" data-v="a">WHAT HAPPENED · MVP, JULY 2026</button><button type="button" aria-pressed="false" data-v="b">WHAT WE DESIGNED FOR · PHASE 3</button>';
    a.parentNode.insertBefore(seg,a); b.classList.add("nb-hidden");
    $$("button",seg).forEach(function(btn){btn.onclick=function(){var v=btn.dataset.v;a.classList.toggle("nb-hidden",v!=="a");b.classList.toggle("nb-hidden",v!=="b");
      $$("button",seg).forEach(function(x){x.setAttribute("aria-pressed",x===btn)})}});
  }
}

/* ---------- conversational layer: now / next ---------- */
if(page==="beeline-conversational-layer"){
  var lseg=$("[data-layer-seg]"), views=$$("[data-layer-view]");
  if(lseg&&views.length){
    var lbtns=$$("[data-v]",lseg);
    function showView(v){
      views.forEach(function(x){x.parentNode.classList.toggle("nb-hidden",x.dataset.layerView!==v)});
      lbtns.forEach(function(x){var on=x.dataset.v===v;x.setAttribute("aria-current",on?"true":"false");x.style.background=on?"var(--c1e1e1e)":"var(--cfbfaf6)";x.style.color=on?"var(--cf4f2ec)":"var(--c1e1e1e)"});
    }
    lbtns.forEach(function(x){x.addEventListener("click",function(e){e.preventDefault();showView(x.dataset.v);if(history.replaceState)history.replaceState(null,"","#layer-"+x.dataset.v)})});
    showView(location.hash==="#layer-next"?"next":"now");
  }
}

/* ---------- Learning Meter walkthrough ---------- */
if(page==="learning-meter"&&$("#lmw")){
  var BAND={100:["var(--c83996f)","var(--ceef3e9)","var(--c4d5f3e)"],80:["var(--ca89660)","var(--cf6f1e3)","var(--c6f5f2c)"],60:["var(--c8f80a8)","var(--cf0edf5)","var(--c5d4f78)"],0:["var(--cb07070)","var(--cf7ecec)","var(--c8a4848)"]};
  function band(s){return s>=90?100:s>=70?80:s>=40?60:0}
  var ANSWERS=[
   {id:"a1",said:"It’s half past six.",stt:"its half past six",clean:"it's half past six",seen:true,expected:100,tuned:{score:100,fb:"Great job! That's exactly right."},early:{score:100,fb:"Great job! Your answer is perfect!"}},
   {id:"a2",said:"It is six thirty.",stt:"it is six thirty",clean:"it is six thirty",seen:false,expected:100,tuned:{score:100,fb:"Perfect! Six thirty is right too."},early:{score:80,fb:"Mostly correct. The answer is \"It is six thirty.\""},why:"Early prompts marked a correct alternative down because it didn’t match the first example."},
   {id:"a3",said:"Is half past six.",stt:"is half past six",clean:"is half past six",seen:false,expected:80,tuned:{score:80,fb:"Nearly! Say: It is half past six."},early:{score:100,fb:"Your answer is correct."},why:"The missing “It” went unnoticed. Anchor answers at 80 fixed this."},
   {id:"a4",said:"Half six.",stt:"half six",clean:"half six",seen:true,expected:60,tuned:{score:60,fb:"Good try! Use a full sentence: It's half six."},early:{score:60,fb:"Incomplete sentence. Correct answer: It's half six."}},
   {id:"a5",said:"I think it's around six?",stt:"i think its around six",clean:"i think it's around six",seen:false,expected:0,tuned:{score:0,fb:"Look again: the long hand says half past."},early:{score:60,fb:"Your answer hints at the correct time but is incomplete."},why:"A classic false pass: vague and wrong, but rewarded for “hinting”. The tuned rubric scores it 0."},
   {id:"a6",said:"Son las seis y media.",stt:"son las seis y media",clean:"son las seis y media",seen:false,expected:0,tuned:{score:0,fb:"Try again in English: It’s half past six."},early:{score:80,fb:"Correct time! Try saying it in English."},why:"Right idea, wrong language. It became a hard rule: not English scores 0."}];
  var BANDS=[[100,["Full sentence, clear and relevant","Correct grammar and vocabulary","Clear pronunciation"],"It’s half past six."],[80,["Full sentence, minor slips","Mostly correct grammar","Still easy to understand"],"Is half past six."],[60,["One word or a fragment","Frequent errors","Minimally does the task"],"Half six."],[0,["Wrong or off-topic","Breaks down communication","Not in English"],"Son las seis y media."]];
  var mode="tuned", sel="a5";
  $("#lmw-bands").innerHTML=BANDS.map(function(b){var c=BAND[b[0]];return '<div class="lmw-band" style="--bc:'+c[0]+';--bs:'+c[1]+';--bi:'+c[2]+'"><span class="n">'+b[0]+'</span><ul>'+b[1].map(function(x){return "<li>"+x+"</li>"}).join("")+'</ul><span class="ex">“'+b[2]+'”</span></div>'}).join("");
  function meter(score,col){var r=30,c=2*Math.PI*r,f=c*(Math.max(score,4)/100);
    return '<svg viewBox="0 0 74 74" width="74" height="74" aria-hidden="true"><circle cx="37" cy="37" r="'+r+'" fill="none" stroke="#c9c4b6" stroke-width="8"/><circle cx="37" cy="37" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="8" stroke-dasharray="'+f.toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 37 37)"/><text x="37" y="43" text-anchor="middle" font-family="Silkscreen,monospace" font-size="15" fill="#1e1e1e">'+score+'</text></svg>'}
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
  function answers(){
    $("#lmw-answers").innerHTML=ANSWERS.map(function(a){return '<button type="button" class="lmw-ans" data-id="'+a.id+'" aria-pressed="'+(a.id===sel)+'"><span>“'+a.said+'”</span><small>EXPECTED '+a.expected+'</small></button>'}).join("");
    $$("#lmw-answers .lmw-ans").forEach(function(b){b.onclick=function(){sel=b.dataset.id;answers();pipe()}});
  }
  function pipe(){
    var a=ANSWERS.filter(function(x){return x.id===sel})[0], r=a[mode], cached=a.seen&&mode==="tuned", bk=band(r.score), c=BAND[bk], ok=bk===a.expected;
    var steps=[
      ["Speech to text","","The learner speaks. Speech-to-text is imperfect with young voices and accents, so nothing downstream trusts punctuation.",'heard: "'+a.stt+'"',true],
      ["Clean up","","Normalise spelling, case and punctuation so “I have a red car” and “I have a red car.” count as one answer.",'→ "'+a.clean+'"',true],
      ["Seen this before?",cached?"match · instant · no AI call":"no match",cached?"This exact answer was already scored for this mini-activity, so the stored score is reused. The same answer always gets the same score.":"New answer for this mini-activity, so it goes to the AI with the rubric.","",true],
      ["Grade against the rubric",cached?"skipped":(mode==="tuned"?"tuned prompt · strict settings":"first prompt"),"The AI gets the activity, what to check, and anchor answers at 100 / 80 / 60 / 0, then must reply as a score plus feedback.",cached?"":'{ "score": '+r.score+', "explanation": "'+esc(r.fb)+'" }',!cached],
      ["Back to the learner","",null,"",true],
      ["Logged for review",ok?"agrees with expected":"flagged: disagrees with expected",ok?"Stored with the activity, answer and score.":"Expected "+a.expected+", scored "+r.score+". Flagged answers are reviewed and fed back into the rubric and test set.","",true]];
    $("#lmw-pipe").innerHTML=steps.map(function(s,i){
      var body=s[0]==="Back to the learner"?'<div class="lmw-out" style="--band-soft:'+c[1]+';--band-ink:'+c[2]+'">'+meter(r.score,c[0])+'<div><div class="sc">LEARNING METER · '+r.score+'/100</div><div class="fb">'+esc(r.fb)+'</div></div></div>'
        :(s[2]?'<p class="lmw-d">'+s[2]+'</p>':"")+(s[3]?'<div class="lmw-io">'+esc(s[3])+'</div>':"");
      return '<div class="lmw-step '+(s[4]?"on":"off")+'"><div class="lmw-rail"><span class="lmw-dot">'+(i+1)+'</span></div><div class="lmw-b"><div class="lmw-t">'+s[0]+(s[1]?'<span class="lmw-tag">'+s[1].toUpperCase()+'</span>':"")+'</div>'+body+'</div></div>'}).join("")+
      (a.why&&mode==="early"?'<div class="lmw-why"><span class="k">WHY THE FIRST PROMPT GOT THIS WRONG</span><p>'+a.why+'</p></div>':"");
  }
  function setMode(m){mode=m;$("#lmw-early").setAttribute("aria-pressed",m==="early");$("#lmw-tuned").setAttribute("aria-pressed",m==="tuned");
    $("#lmw-note").textContent=m==="early"?"How the first prompts scored these answers, based on real failure patterns.":"How the tuned rubric and prompts score them.";pipe()}
  $("#lmw-early").onclick=function(){setMode("early")}; $("#lmw-tuned").onclick=function(){setMode("tuned")};
  answers(); setMode("tuned");
}

/* ---------- decision trail: pick a barrier ---------- */
var tp=$("[data-trail-picker]");
if(tp){
  var picks=$$("[data-pick]",tp), trails=$$("[data-trail]");
  function showTrail(id){
    trails.forEach(function(t){t.classList.toggle("nb-hidden",t.dataset.trail!==id)});
    picks.forEach(function(p){var on=p.dataset.pick===id;p.setAttribute("aria-current",on?"true":"false");
      p.style.background=on?"var(--cf7ecec)":"var(--cfbfaf6)";p.style.borderColor=on?"var(--c8a4848)":"var(--c1e1e1e)";p.style.boxShadow=on?"4px 4px 0 var(--c8a4848)":"none"});
  }
  picks.forEach(function(p){p.addEventListener("click",function(e){e.preventDefault();showTrail(p.dataset.pick);
    if(history.replaceState)history.replaceState(null,"","#trail-"+p.dataset.pick)})});
  var h=(location.hash||"").replace("#trail-","");
  showTrail(picks.some(function(p){return p.dataset.pick===h})?h:picks[0].dataset.pick);
}

/* ---------- day and night switch in the top bar ---------- */
function effTheme(){return document.documentElement.getAttribute("data-theme")==="dark"?"dark":"light"}
function syncDN(){var t=effTheme();$$(".nb-dn button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.t===t))})}
var topbar=$("main header");
if(topbar){
  topbar.insertAdjacentHTML("beforeend",'<span class="nb-dn" role="group" aria-label="Day or night"><button type="button" data-t="light">DAY</button><button type="button" data-t="dark">NIGHT</button></span>');
  $$(".nb-dn button").forEach(function(b){b.onclick=function(){store.set("theme",b.dataset.t);apply();syncDN()}});
}
syncDN();

/* ---------- depth gauge: where you are on a long page ---------- */
var GAUGE={
 "beeline":[["the discovery quiz","Quiz"],["the whole learner","Learner experience"],["my plan","My Plan"],["understanding careers","Context"],["problem model","Problem model"],["five learning moments","Metrics"],["what i would do","Differently"],["where i work","Lifecycle"]],
 "learning-meter":[["four checkpoints","Checkpoints"],["trade-offs","Trade-offs"],["animal planet","The app"],["what a learner plays","Gameplay"],["what moved engagement","Engagement"],["what i would do","Differently"],["where i worked","Lifecycle"]],
 "jump-math":[["how the teacher dashboard","Dashboard"],["two people","One decision"],["the fork","The fork"],["what i would do","Differently"],["where i worked","Lifecycle"]],
 "sugar":[["what the institute","The brief"],["three diamonds","Triple Diamond"],["nine fields","Nine fields"],["the deadlock","Deadlock"],["what we delivered","CO/LAB"],["nine months","Timeline"],["what i would do","Differently"],["where i worked","Lifecycle"]]};
function txt(el){return (el.textContent||"").replace(/\s+/g," ").trim()}
function gaugeStops(){
  var map=GAUGE[page], hs=$$("main h2"), out=[];
  if(map){ hs.forEach(function(h){var t=txt(h).toLowerCase();map.forEach(function(m){if(t.indexOf(m[0])===0&&!out.some(function(o){return o.label===m[1]}))out.push({el:h,label:m[1]})})}); return out }
  if(hs.length>=3) return hs.map(function(h){var t=txt(h);if(t===t.toUpperCase()&&t.indexOf("·")>0)t=t.split("·")[0].trim();if(t===t.toUpperCase())t=t.charAt(0)+t.slice(1).toLowerCase();return {el:h,label:t.length>28?t.slice(0,27)+"…":t}});
  var figs=$$("main figure[id^='rw']");
  if(figs.length>=3) return figs.sort(function(a,b){return a.getBoundingClientRect().top-b.getBoundingClientRect().top}).map(function(f,i){var fc=f.querySelector("figcaption"), lv=fc?$$("span, b",fc).filter(function(e){return !e.children.length}).map(txt).filter(function(x){return x&&!/^sketch \d+ of \d+$/i.test(x)}):[];var t=lv[0]||"Sketch "+(i+1);if(t===t.toUpperCase())t=t.charAt(0)+t.slice(1).toLowerCase();return {el:f,label:t.length>28?t.slice(0,27)+"…":t}});
  return [];
}
(function(){
  if(page==="index"||here==="index.html") return;
  var stops=gaugeStops(); if(stops.length<3) return;
  stops.forEach(function(s,i){if(!s.el.id)s.el.id="sec-"+(i+1)});
  var nav=document.createElement("nav"); nav.className="nb-gauge"; nav.setAttribute("aria-label","On this page");
  nav.innerHTML='<span class="g-line" aria-hidden="true"><span class="g-fill"></span></span><ol>'+stops.map(function(s,i){return '<li><a href="#'+s.el.id+'"><span class="g-tick" aria-hidden="true"></span><span class="g-lab">'+s.label+'</span></a></li>'}).join("")+'</ol><span class="g-now" aria-hidden="true"></span>';
  var bar=document.createElement("div"); bar.className="nb-gbar"; bar.setAttribute("aria-hidden","true");
  bar.innerHTML='<span class="b-lab"></span><span class="b-line"><span class="b-fill"></span></span><span class="b-n"></span>';
  document.body.appendChild(nav); document.body.appendChild(bar);
  var lis=$$("li",nav), fill=$(".g-fill",nav), now=$(".g-now",nav), line=$(".g-line",nav);
  function place(){
    var max=Math.max(1,document.documentElement.scrollHeight-innerHeight), H=line.offsetHeight;
    stops.forEach(function(s,i){var y=s.el.getBoundingClientRect().top+scrollY-120;lis[i].style.top=Math.min(H,Math.max(0,H*y/max))+"px"});
    var last=-99; lis.forEach(function(li){var t=parseFloat(li.style.top)||0, want=Math.max(t,last+22), lab=li.querySelector(".g-lab"); lab.style.transform="translateY("+(want-t)+"px)"; last=want});
    update();
  }
  function update(){
    var max=Math.max(1,document.documentElement.scrollHeight-innerHeight), p=Math.min(1,Math.max(0,scrollY/max)), H=line.offsetHeight, cur=-1;
    stops.forEach(function(s,i){if(s.el.getBoundingClientRect().top<innerHeight*0.35)cur=i});
    fill.style.height=(p*H)+"px";
    lis.forEach(function(li,i){li.classList.toggle("on",i===cur);li.classList.toggle("past",i<cur)});
    if(cur>=0){now.textContent=stops[cur].label.toUpperCase();now.style.top=(p*H)+"px";now.style.opacity=1}else now.style.opacity=0;
    $(".b-lab",bar).textContent=cur>=0?stops[cur].label.toUpperCase():"";
    $(".b-n",bar).textContent=cur>=0?(cur+1)+"/"+stops.length:"";
    $(".b-fill",bar).style.width=(p*100)+"%";
    bar.classList.toggle("show",cur>=0);
  }
  addEventListener("scroll",update,{passive:true}); addEventListener("resize",place);
  addEventListener("load",place); place();
})();

/* ---------- glossary: terms you have met ---------- */
var GLOSS=["alternative provision","apprenticeship","careers lead","connexions","destination","dfe","dwp","ebacc","ehcp","equalex","gatsby benchmarks","key stage","local skills improvement plan","national careers service","neet","pru","send","skills builder","statutory","t level","ucas","beeline","beeline unplugged","gateways","gm skills plan","gmca","gmyca","i can outcomes","launch & learn","learning moments","mbacc","meaningful next step rate","programme board","design assurance","journey map","lundy model","micro-action","service blueprint","show & tell","triple diamond","a/b test","anchor answer","bigquery","cefr","false pass","formative","ladder of misinference","llm","rubric band","xapi"];
function gnorm(t){return String(t).toLowerCase().replace(/[“”"…\.]/g,"").replace(/&amp;/g,"&").replace(/\s+/g," ").trim()}
function metGet(){try{return JSON.parse(localStorage.getItem("fa-met")||"{}")||{}}catch(e){return {}}}
function metSet(m){try{localStorage.setItem("fa-met",JSON.stringify(m))}catch(e){}}
function metCount(m){return GLOSS.filter(function(t){return m[t]}).length}
var pageLabel=(PAGES.filter(function(p){return p[0]===here})[0]||[,,document.title.split("·")[0].trim()])[2];
if(page!=="glossary"){
  $$("main .gl").forEach(function(g){
    var tip=$(".gl-tip",g), b=tip&&$("b",tip); if(!b) return;
    var key=gnorm(txt(b)); if(GLOSS.indexOf(key)<0) return;
    var line=document.createElement("span"); line.className="gl-met"; tip.appendChild(line);
    function paint(){var m=metGet();line.innerHTML='<span>■ IN YOUR GLOSSARY</span><span>'+metCount(m)+' OF '+GLOSS.length+'</span>'}
    function mark(){var m=metGet();if(!m[key]){m[key]=[here,pageLabel];metSet(m)}paint()}
    paint(); g.addEventListener("mouseenter",mark); g.addEventListener("focusin",mark); g.addEventListener("click",mark);
  });
} else {
  var m=metGet(), secs=$$("main section[id^='g']").filter(function(s){return /^g\d$/.test(s.id)});
  var COL=["var(--c8f80a8)","var(--ca89660)","var(--cb07070)","var(--c83996f)"], INK=["var(--c5d4f78)","var(--c6f5f2c)","var(--c8a4848)","var(--c4d5f3e)"];
  var rows=secs.map(function(sec,si){
    var dts=$$("dt",sec), n=0, cells="";
    dts.forEach(function(dt){var k=gnorm(txt(dt)), hit=m[k];if(hit)n++;
      var mk=document.createElement("span"); mk.className="gl-mark"+(hit?" on":""); mk.style.setProperty("--mc",COL[si]); mk.setAttribute("aria-hidden","true"); dt.parentNode.insertBefore(mk,dt);
      if(hit){var a=document.createElement("a");a.className="gl-where";a.href=hit[0]==="index.html"?"./":hit[0];a.textContent="MET IN "+String(hit[1]).toUpperCase();a.style.color=INK[si];dt.parentNode.appendChild(a)}
      cells+='<span class="gl-cell'+(hit?" on":"")+'" style="--mc:'+COL[si]+'"></span>'});
    var cnt=$("div > span:last-child",sec); if(cnt&&/TERMS/.test(txt(cnt))) cnt.textContent=dts.length+" TERMS · "+n+" MET";
    var h=$("h2",sec);
    return '<div class="gl-row"><span class="gl-rl" style="color:'+INK[si]+'">'+(h?txt(h):"")+'</span><span class="gl-cells">'+cells+'</span><span class="gl-rn">'+n+"/"+dts.length+'</span></div>';
  }).join("");
  var nav=$("main nav[aria-label='Glossary sections']");
  if(nav&&secs.length){
    var total=metCount(m);
    nav.insertAdjacentHTML("afterend",'<section class="gl-prog" aria-label="Terms you have met"><div class="gl-ph"><span>TERMS YOU HAVE MET ON THIS SITE</span><span>'+total+' OF '+GLOSS.length+(total?' · <button type="button" id="glClear">CLEAR</button>':'')+'</span></div>'+rows+'<p class="gl-pn">Open a dotted term in any project and it is marked here. This is saved in your own browser only.</p></section>');
    var c=$("#glClear"); if(c) c.onclick=function(){metSet({});location.reload()};
  }
}

})();
