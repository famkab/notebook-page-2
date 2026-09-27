/* ============ shared shell: navigation, reading settings, glossary, tabs ============ */
(function(){
"use strict";

/* ---------- pages ---------- */
const PAGES=[
  {g:"start here",   gh:1, href:"index.html",    n:"p. 1",     t:"Contents"},
  {g:"Current work", href:"beeline.html",        n:"p. 2–7",   t:"Beeline"},
  {g:"Work before",  href:"learning-meter.html", n:"p. 8–13",  t:"Learning Meter"},
  {g:"",             href:"jump-math.html",      n:"p. 14–17", t:"JUMP Math Lab"},
  {g:"",             href:"sugar.html",          n:"p. 18–20", t:"The Artificial Leaf"},
  {g:"About",        href:"how-i-work.html",     n:"p. 21",    t:"How I work", bk:1},
  {g:"Also",         href:"beeline-unplugged.html", n:"p. 22–25", t:"Beeline Unplugged"},
  {g:"",             href:"mbacc-summit.html",   n:"p. 26",    t:"MBacc Summit"},
  {g:"",             href:"edeh.html",           n:"p. 27",    t:"European Digital Education Hub"}
];
const here=(location.pathname.split("/").pop()||"index.html");
const group=h=>h;

/* ---------- reading settings ---------- */
const store={
  get(k,d){ try{ return localStorage.getItem("fa-"+k)||d }catch(e){ return d } },
  set(k,v){ try{ localStorage.setItem("fa-"+k,v) }catch(e){} }
};
function applySettings(){
  const r=document.documentElement;
  r.dataset.paper=store.get("paper","blank");
  r.dataset.ink=store.get("ink","colour");
  const th=store.get("theme","light");
  if(th==="auto") r.removeAttribute("data-theme"); else r.dataset.theme=th;
  r.dataset.rail=store.get("rail","open");
}
applySettings();

/* ---------- build nav ---------- */
function pageList(withTitle){
  let out="", lastG=null;
  PAGES.forEach(p=>{
    if(p.g&&p.g!==lastG){ out+=`<div class="grp${p.gh?" hand":""}">${p.g}</div>`; lastG=p.g; }
    const cur=group(p.href)===group(here);
    out+=`<a href="${p.href}"${cur?' aria-current="page"':''}${withTitle?` title="${p.t}"`:""}>`+
      `<span class="thumb" aria-hidden="true"><i></i>${p.bk?"<b></b>":""}</span>`+
      `<span class="pshort" aria-hidden="true">${p.n.replace("p. ","").split("–")[0]}</span>`+
      `<span class="pcopy"><strong>${p.t}</strong><small>${p.n}</small></span></a>`;
  });
  return out;
}
function settingsPop(){
  const paper=store.get("paper","blank"), ink=store.get("ink","colour"), th=store.get("theme","light");
  const opt=(group,val,cur,label)=>`<button type="button" data-set="${group}" data-val="${val}" aria-pressed="${cur===val}">${label}</button>`;
  return `<div class="pop" id="setPop" role="dialog" aria-label="Reading settings">
    <div><h4>Paper</h4><div class="opts">
      ${opt("paper","dots",paper,"Dots")}${opt("paper","lined",paper,"Lined")}${opt("paper","grid",paper,"Grid")}${opt("paper","blank",paper,"Blank")}
    </div></div>
    <div><h4>Ink</h4><div class="opts">
      ${opt("ink","colour",ink,"Muted colour")}${opt("ink","black",ink,"Black only")}
    </div></div>
    <div><h4>Light</h4><div class="opts">
      ${opt("theme","auto",th,"Auto")}${opt("theme","light",th,"Day")}${opt("theme","dark",th,"Night")}
    </div></div>
  </div>`;
}
const cur=PAGES.find(p=>group(p.href)===group(here))||PAGES[0];

document.body.insertAdjacentHTML("afterbegin",`
<header class="topbar">
  <a class="brand" href="index.html">Fatima Abid</a>
  <button type="button" class="pagesbtn" id="pagesBtn" aria-expanded="false" aria-haspopup="dialog"
    aria-label="Pages, current page ${cur.n.replace("p. ","")}: ${cur.t}">
    <span class="pn">${cur.n.replace("p. ","P. ")}</span><span class="cur">${cur.t}</span><span aria-hidden="true">▾</span>
  </button>
  <button type="button" class="setbtn" id="setBtnTop" aria-expanded="false" aria-label="Reading settings">⚙</button>
</header>`);

const layout=document.querySelector(".layout");
if(layout){
  layout.insertAdjacentHTML("afterbegin",`
  <div class="rail-col">
    <nav class="rail" aria-label="Portfolio notebook navigation">
      <div class="pages">${pageList(true)}</div>
      <div class="rail-settings">
        <button type="button" class="collapsebtn" id="railBtn" aria-label="Collapse sidebar" title="Collapse sidebar">«</button>
        <button type="button" class="setbtn" id="setBtnRail" aria-expanded="false" aria-label="Reading settings" title="Reading settings">⚙<span>Reading settings</span></button>
      </div>
    </nav>
  </div>`);
  // wrap the page in a paper surface with a page number
  const main=layout.querySelector("main");
  if(main){
    ["ring","walkBar"].forEach(id=>{const el=document.getElementById(id); if(el) document.body.appendChild(el);});
    const paper=document.createElement("div");
    paper.className="paper";
    main.parentNode.insertBefore(paper,main);
    paper.appendChild(document.createElement("span")).outerHTML=`<span class="page-number">${cur.n}</span>`;
    paper.appendChild(main);
    const f=main.querySelector("footer.pagefoot");
    if(f){ f.className="journal-footer"; paper.appendChild(f); }
    else {
      paper.insertAdjacentHTML("beforeend",`<footer class="journal-footer"><p>Fatima Abid · product &amp; service design</p><div><a href="https://linkedin.com/in/famkab">LinkedIn</a><a href="mailto:famkab2@gmail.com">Email</a></div></footer>`);
    }
  }
}

/* ---------- collapse the rail ---------- */
function syncRailBtn(){
  const b=document.getElementById("railBtn"); if(!b) return;
  const collapsed=document.documentElement.dataset.rail==="collapsed";
  b.textContent=collapsed?"»":"«";
  b.setAttribute("aria-label",collapsed?"Expand sidebar":"Collapse sidebar");
  b.title=collapsed?"Expand sidebar":"Collapse sidebar";
  b.setAttribute("aria-expanded",String(!collapsed));
}
syncRailBtn();

/* ---------- disclosure behaviour ---------- */
let openEl=null, openBtn=null;
function closeAll(){
  if(openEl){ openEl.remove(); openEl=null; }
  if(openBtn){ openBtn.setAttribute("aria-expanded","false"); openBtn=null; }
}
function openSettings(btn){
  if(openBtn===btn){ closeAll(); return; }
  closeAll();
  document.body.insertAdjacentHTML("beforeend",settingsPop());
  const pop=document.getElementById("setPop");
  const r=btn.getBoundingClientRect();
  const top=r.bottom+window.scrollY+8, above=r.top+window.scrollY-8;
  pop.style.left=Math.max(10,Math.min(r.left+window.scrollX,window.innerWidth-240))+"px";
  pop.style.top=(r.bottom+230>window.innerHeight? Math.max(10,above-200) : top)+"px";
  pop.querySelectorAll("button").forEach(b=>b.onclick=()=>{
    store.set(b.dataset.set,b.dataset.val); applySettings();
    pop.querySelectorAll(`button[data-set="${b.dataset.set}"]`).forEach(x=>x.setAttribute("aria-pressed",x===b));
  });
  btn.setAttribute("aria-expanded","true"); openEl=pop; openBtn=btn;
  pop.querySelector("button").focus();
}
function openPages(btn){
  if(openBtn===btn){ closeAll(); return; }
  closeAll();
  document.body.insertAdjacentHTML("beforeend",`<nav class="sheet-pages" id="pagesSheet" aria-label="Notebook pages"><p class="ph">Notebook pages</p>${pageList(true)}</nav>`);
  btn.setAttribute("aria-expanded","true");
  openEl=document.getElementById("pagesSheet"); openBtn=btn;
  openEl.querySelector("a").focus();
}
document.addEventListener("click",e=>{
  const rb=e.target.closest("#railBtn");
  if(rb){
    const collapsed=document.documentElement.dataset.rail==="collapsed";
    store.set("rail",collapsed?"open":"collapsed"); applySettings(); syncRailBtn(); closeAll(); return;
  }
  const s=e.target.closest("#setBtnRail,#setBtnTop"), p=e.target.closest("#pagesBtn");
  if(s){ openSettings(s); return; }
  if(p){ openPages(p); return; }
  if(openEl&&!e.target.closest(".pop,.sheet-pages")) closeAll();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&openEl){ const b=openBtn; closeAll(); b&&b.focus(); }
});

/* ---------- glossary ---------- */
const GLOSSARY={
 "GMCA":"Greater Manchester Combined Authority, the regional government for Greater Manchester’s ten boroughs.",
 "MBacc":"The Greater Manchester Baccalaureate, a framework that shows young people technical and academic routes into work.",
 "gateways":"The seven broad sectors in the MBacc, like Digital or Financial, that young people explore careers through.",
 "Beeline":"The Greater Manchester service that helps young people up to 25 explore careers and find a next step.",
 "Beeline Unplugged":"The offline card toolkit version of Beeline, for groups with low digital access or additional needs.",
 "Launch & Learn":"The pilot where Beeline was tested with schools, local authorities and youth organisations across all ten boroughs.",
 "design assurance":"Collecting feedback from partners and young people in one log, so each point leads to a fix, a research question or a decision.",
 "Show & Tell":"A working session where work in progress is shown with its evidence, and decisions and trade-offs are agreed in the open.",
 "Programme Board":"The group that governs the MBacc programme. It receives a quarterly report.",
 "DfE":"The Department for Education, the UK government department responsible for schools, colleges and skills in England.",
 "DWP":"The Department for Work and Pensions, the UK government department responsible for welfare, jobcentres and employment support.",
 "National Careers Service":"The government-funded careers advice service for adults and young people aged 13 and over in England.",
 "NEET":"Not in education, employment or training. The UK term for a young person who has left school and has none of the three.",
 "EHCP":"An Education, Health and Care Plan: a legal document setting out the support a child or young person with special educational needs must receive.",
 "key stage":"The blocks England divides schooling into. Key Stage 3 is roughly ages 11–14, Key Stage 4 is 14–16 and leads to GCSEs, and Key Stage 5 is 16–18.",
 "T Level":"A two-year technical qualification in England for 16 to 19 year olds, equivalent to three A Levels, with an industry placement built in.",
 "EBacc":"The English Baccalaureate, a set of GCSE subjects the government encourages schools to enter pupils for. It is a measure of the school, not a qualification.",
 "UCAS":"The Universities and Colleges Admissions Service, the single system through which people apply to UK universities.",
 "PRU":"A Pupil Referral Unit: a school for children who cannot attend a mainstream school, often after exclusion or for health reasons.",
 "alternative provision":"Education arranged for pupils who cannot attend a mainstream school, including pupil referral units and specialist providers.",
 "Connexions":"The careers and support service for young people run by many local authorities, and the name still used for it in parts of Greater Manchester.",
 "Skills Builder":"A framework that breaks eight essential skills, such as listening and problem solving, into numbered steps so progress can be described.",
 "statutory":"Required by law. A statutory duty is one a school or authority must carry out, rather than one it chooses to.",
 "destination":"Where a young person goes after finishing a key stage: a course, an apprenticeship, a job, or none of them. Schools report it.",
 "apprenticeship":"A paid job with training built in, leading to a recognised qualification. An alternative to full-time study after 16 or 18.",
 "careers lead":"The person in a school or college responsible for the careers programme. Every English secondary school must have one.",
 "Local Skills Improvement Plan":"An employer-led plan setting out the skills a local area needs, which colleges and training providers are expected to respond to.",
 "GM Skills Plan":"Greater Manchester\u2019s strategy for skills and employment across the ten boroughs.",
 "Lundy model":"A model for children and young people’s participation, built on four parts: space, voice, audience and influence.",
 "GMYCA":"The Greater Manchester Youth Combined Authority, the region’s elected youth assembly. Its members are the Beeline co-design group for 2026-27.",
 "micro-action":"A short activity a co-design member runs with their own youth group between sessions, bringing the answers back to the next one.",
 "SEND":"Special educational needs and disabilities, the UK term for young people who need extra support to learn.",
 "“I can…” outcomes":"The statements of what a young person should be able to do by the end, which Beeline’s features and metrics are built around.",
 "Learning Moments":"Five stages of progress that Beeline measures, from first exploring careers to taking a real next step.",
 "Meaningful Next Step Rate":"The share of young people who go on to a real next step, rather than just using the service.",
 "rubric band":"A level on the marking scale used to judge a child’s spoken or written answer.",
 "false pass":"When the AI said an answer met the level but a human grader said it didn’t. The error that matters most for children.",
 "xAPI":"A data standard that records what learners do inside a course, so dashboards can use it.",
 "formative":"Checks that happen during learning, to adjust teaching. Summative checks measure what was learned at the end.",
 "Gatsby benchmarks":"Eight benchmarks that set what schools and colleges in England are expected to provide for careers education.",
 "Equalex":"The tiers that set how deep a careers experience goes: introduce and inspire, investigate and explore, apply and demonstrate."
};
let termPop=null, termBtn=null;
function closeTerm(){ if(termPop){termPop.remove();termPop=null;} if(termBtn){termBtn.setAttribute("aria-expanded","false");termBtn=null;} }
function showTerm(btn){
  if(termBtn===btn) { closeTerm(); return; }
  closeTerm();
  const key=btn.dataset.term, def=GLOSSARY[key];
  if(!def) return;
  document.body.insertAdjacentHTML("beforeend",`<div class="termpop" role="tooltip"><b>${key}</b>${def}</div>`);
  termPop=document.querySelector(".termpop:last-of-type");
  const r=btn.getBoundingClientRect(), w=Math.min(280,window.innerWidth-20);
  termPop.style.width=w+"px";
  let left=r.left+window.scrollX; left=Math.min(left,window.innerWidth-w-10); left=Math.max(10,left);
  termPop.style.left=left+"px";
  const below=r.bottom+window.scrollY+8, h=termPop.offsetHeight;
  termPop.style.top=(r.bottom+h+16>window.innerHeight ? r.top+window.scrollY-h-8 : below)+"px";
  btn.setAttribute("aria-expanded","true"); termBtn=btn;
}

/* ---------- auto-link jargon: first plain occurrence of each glossary term ---------- */
function autoTerms(){
  const seen=new Set();
  document.querySelectorAll(".term[data-term]").forEach(b=>seen.add(b.dataset.term.toLowerCase()));
  const keys=Object.keys(GLOSSARY).sort((a,b)=>b.length-a.length);
  const main=document.querySelector("main"); if(!main) return;
  const hosts=[...main.querySelectorAll("p,li,dd")].filter(el=>{
    if(el.closest(".term,.termpop,figcaption,.mono,h1,h2,h3,h4,a,button")) return false;
    // a grid/flex parent turns each inserted button into its own track, so skip those
    const d=getComputedStyle(el).display;
    return d!=="grid"&&d!=="flex"&&d!=="inline-grid"&&d!=="inline-flex";
  });
  keys.forEach(k=>{
    if(seen.has(k.toLowerCase())) return;
    const esc=k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const re=new RegExp("(?<![\\w-])("+esc+")(?![\\w-])", k===k.toLowerCase()?"i":"");
    for(const el of hosts){
      if(seen.has(k.toLowerCase())) break;
      for(const node of [...el.childNodes]){
        if(node.nodeType!==3) continue;
        const m=node.nodeValue.match(re); if(!m) continue;
        const i=node.nodeValue.indexOf(m[1]);
        const after=node.splitText(i); after.nodeValue=after.nodeValue.slice(m[1].length);
        const btn=document.createElement("button");
        btn.className="term"; btn.type="button"; btn.dataset.term=k; btn.textContent=m[1];
        after.parentNode.insertBefore(btn,after);
        seen.add(k.toLowerCase()); break;
      }
    }
  });
  initTerms();
}
function initTerms(root){
  (root||document).querySelectorAll(".term").forEach(b=>{
    if(b.dataset.ready) return; b.dataset.ready="1";
    if(!b.querySelector("sup")) b.insertAdjacentHTML("beforeend","<sup>?</sup>");
    b.setAttribute("aria-expanded","false");
    b.addEventListener("mouseenter",()=>showTerm(b));
    b.addEventListener("focus",()=>showTerm(b));
    b.addEventListener("mouseleave",e=>{ if(!e.relatedTarget||!e.relatedTarget.closest(".termpop")) closeTerm(); });
    b.addEventListener("blur",()=>closeTerm());
    b.addEventListener("click",e=>{ e.preventDefault(); showTerm(b); });
  });
}
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeTerm(); });
document.addEventListener("click",e=>{ if(termPop&&!e.target.closest(".term,.termpop")) closeTerm(); });
window.addEventListener("scroll",()=>closeTerm(),{passive:true});

/* ---------- tabs ---------- */
function initTabs(){
  document.querySelectorAll("[data-tabs]").forEach(bar=>{
    const btns=[...bar.querySelectorAll("button")];
    const panels=btns.map(b=>document.getElementById(b.dataset.panel));
    const show=i=>{
      btns.forEach((b,j)=>b.setAttribute("aria-selected",j===i));
      panels.forEach((p,j)=>{ if(p) p.hidden=j!==i; });
      if(location.hash.slice(1)!==btns[i].dataset.panel) history.replaceState(null,"","#"+btns[i].dataset.panel);
      window.dispatchEvent(new CustomEvent("tabshown",{detail:btns[i].dataset.panel}));
    };
    btns.forEach((b,i)=>{
      b.setAttribute("role","tab"); b.setAttribute("aria-controls",b.dataset.panel);
      b.onclick=()=>show(i);
      b.onkeydown=e=>{
        if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
          e.preventDefault(); const n=(i+(e.key==="ArrowRight"?1:btns.length-1))%btns.length; btns[n].focus(); show(n);
        }
      };
    });
    bar.setAttribute("role","tablist");
    panels.forEach(p=>{ if(p){ p.setAttribute("role","tabpanel"); p.tabIndex=0; } });
    const want=btns.findIndex(b=>b.dataset.panel===location.hash.slice(1));
    show(want>=0?want:0);
  });
}

/* ---------- lifecycle strip ---------- */
const STAGES=["Discover","Prototype","Pilot","Validate","Build","Measure"];
const LIFE={
 beeline:{foot:"All six stages, from mapping the system to the metrics the board reads.",items:[
  ["Landscape map of GM careers education","Problem model"],
  ["Unplugged offline toolkit","Discovery quiz and game"],
  ["Testing in schools, colleges and youth settings","Launch &amp; Learn across ten boroughs"],
  ["Design assurance rounds with young people","Show &amp; Tells"],
  ["Roadmap and feature map","Developer and supplier handoff"],
  ["Learning Moments and next-step rate","A metrics framework that checks itself"]]},
 lm:{foot:"From a rubric to the accuracy numbers that decided what shipped.",items:[
  ["Speech and writing tasks for eight-year-olds","Rubric bands"],
  ["Prompt databases","Anchor answers per activity"],
  ["A test set of about 4,000 answers","Real answers plus synthetic edge cases","10 representative franchise schools"],
  ["Evaluation loop before launch","Every answer graded twice"],
  ["Handoff to engineers","Caching for repeat answers"],
  ["False passes, agreement, latency, cost"]]},
 sugar:{foot:"Five stages of six. The measurement end came later, at Kids&amp;Us and GMCA.",items:[
  ["Desk research across nine fields","Case studies of comparable technologies","Expert and company interviews","Personas per sector"],
  ["A critical experience prototype","Dark horse and funky prototypes"],
  ["Prototype development and testing","Reaching out to companies"],
  ["The challenge rewritten","Knowledge transfer office interview and journey map"],
  ["CO/LAB: survey, technical simulation, financial estimation","Service blueprint and business model canvas"],
  []]},
 jm:{foot:"From a teacher survey to xAPI data the dashboards read.",items:[
  ["Teacher survey","Usage patterns"],
  ["Figma dashboard mocks","Three rounds"],
  ["Forked pathways","Check-in quizzes"],
  ["Teacher feedback on shipped screens"],
  ["xAPI data spec","Needs versus wants for developers"],
  ["Diagnostic, formative and summative views"]]}
};
function initLife(){
  document.querySelectorAll("[data-life]").forEach(el=>{
    const L=LIFE[el.dataset.life]; if(!L) return;
    el.innerHTML=`<div class="life">`+STAGES.map((s,i)=>`<div class="stage">
        <span class="n">${String(i+1).padStart(2,"0")}</span><b>${s}</b>
        <ul>${L.items[i].map(t=>`<li>${t}</li>`).join("")}</ul>
        ${i===3?'<div class="life-break">a traditional brief often stops here</div>':""}
        <span class="band" aria-hidden="true"></span></div>`).join("")+
      `<div class="trad" style="left:calc(100%/6*4)" aria-hidden="true"></div></div>
      <p class="muted" style="margin:0;font-size:14px">${L.foot}</p>`;
  });
}

/* ---------- rough-work folders ---------- */
function initRough(){
  document.querySelectorAll(".roughtab").forEach(tab=>{
    if(tab.dataset.ready) return; tab.dataset.ready="1";
    const src=document.getElementById(tab.dataset.rough);
    if(!src) return;
    const items=[...src.querySelectorAll(".rough-item")].map(el=>({
      src:el.dataset.src||"", alt:el.dataset.alt||"", cap:el.dataset.cap||"", note:el.innerHTML.trim()}));
    if(!items.length) return;
    tab.onclick=()=>{
      let i=0;
      document.body.insertAdjacentHTML("beforeend",
        `<div class="lightbox rough" role="dialog" aria-modal="true" aria-label="${tab.dataset.label||"Rough work"}">
           <div class="lb-bar"><span class="lb-cap"></span>
             <span><button type="button" class="lb-zoom">Actual size</button>
             <button type="button" class="lb-close">Close \u2715</button></span></div>
           <div class="lb-body"><div class="lb-img"></div><p class="lb-note"></p>
             <div class="lb-strip" role="group" aria-label="Boards"></div>
             <p class="lb-hand"></p></div>
         </div>`);
      const lb=document.querySelector(".lightbox:last-of-type");
      const draw=()=>{
        const it=items[i];
        lb.querySelector(".lb-cap").textContent=it.cap;
        lb.querySelector(".lb-note").innerHTML=it.src?it.note:"";
        lb.querySelector(".lb-img").classList.toggle("prose",!it.src);
        lb.querySelector(".lb-img").innerHTML=it.src
          ? `<img src="${it.src}" alt="${it.alt.replace(/"/g,"&quot;")}">`
          : `<div class="lb-prose">${it.note}</div>`;
        lb.querySelector(".lb-strip").hidden=items.length<2;
        lb.querySelector(".lb-strip").innerHTML=items.map((x,n)=>
          `<button type="button" data-i="${n}" aria-current="${n===i}">${x.cap||("Board "+(n+1))}</button>`).join("");
        lb.querySelectorAll(".lb-strip button").forEach(b=>b.onclick=()=>{i=+b.dataset.i;draw()});
      };
      lb.querySelector(".lb-hand").innerHTML=tab.dataset.hand||"";
      lb.querySelector(".lb-zoom").hidden=!items.some(x=>x.src);
      draw();
      const close=()=>{lb.remove();tab.focus();document.removeEventListener("keydown",key)};
      const key=e=>{
        if(e.key==="Escape") return close();
        if(e.key==="ArrowRight"){i=(i+1)%items.length;draw()}
        if(e.key==="ArrowLeft"){i=(i+items.length-1)%items.length;draw()}
      };
      lb.querySelector(".lb-close").onclick=close;
      lb.querySelector(".lb-zoom").onclick=e=>{
        const on=lb.classList.toggle("zoomed");
        e.target.textContent=on?"Fit to width":"Actual size";
      };
      lb.onclick=e=>{if(e.target===lb)close()};
      document.addEventListener("keydown",key);
      lb.querySelector(".lb-close").focus();
    };
  });
}

/* ---------- figures: click to enlarge ---------- */
function initFigs(){
  document.querySelectorAll("figure.fig button, figure.shot button").forEach(b=>{
    if(b.dataset.ready) return; b.dataset.ready="1";
    if(!b.querySelector(".zoom")) b.insertAdjacentHTML("beforeend",'<span class="zoom" aria-hidden="true">⤢</span>');
    b.onclick=()=>{
      const img=b.querySelector("img"), cap=b.closest("figure").querySelector("figcaption");
      document.body.insertAdjacentHTML("beforeend",
        `<div class="lightbox" role="dialog" aria-modal="true" aria-label="${img.alt.replace(/"/g,"&quot;")}">
           <div class="lb-bar"><span class="lb-cap">${cap?cap.textContent:""}</span>
             <button type="button" class="lb-close">Close ✕</button></div>
           <div class="lb-img"><img src="${img.src}" alt="${img.alt.replace(/"/g,"&quot;")}"></div>
         </div>`);
      const lb=document.querySelector(".lightbox:last-of-type");
      const close=()=>{lb.remove();b.focus();document.removeEventListener("keydown",esc)};
      const esc=e=>{if(e.key==="Escape")close()};
      lb.querySelector(".lb-close").onclick=close;
      lb.onclick=e=>{if(e.target===lb)close()};
      document.addEventListener("keydown",esc);
      lb.querySelector(".lb-close").focus();
    };
  });
}

/* ---------- go ---------- */
function ready(){ initTerms(); initTabs(); initLife(); initFigs();initRough(); initTerms();
  setTimeout(autoTerms,0); }
if(document.readyState!=="loading") ready(); else document.addEventListener("DOMContentLoaded",ready);
window.FA={initTerms,autoTerms,GLOSSARY};
})();
