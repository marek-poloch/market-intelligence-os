"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Building2, CheckCircle2, CircleDashed, Crosshair,
  Download, FileText, Gauge, LayoutDashboard, LoaderCircle, MessageSquareQuote,
  Play, Plus, Radar, Search, Sparkles, Target, TrendingUp, Users, X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type Project = { id:string; name:string; sector:string; region:string; icp:string; question:string; score:number; demand:number; saturation:number; readiness:number; status:string; updatedAt:string };
type Finding = { id:string; projectId:string; kind:string; title:string; summary:string; sourceLabel:string; confidence:string; metric:string };
type View = "dashboard" | "projects" | "target" | "competitors" | "voice" | "demand" | "report";

const defaultProjects: Project[] = [
  { id:"simply",name:"Simply B2B",sector:"Doradztwo i wdrażanie sprzedaży B2B",region:"Polska",icp:"Właściciele firm B2B i dyrektorzy sprzedaży, zespoły 2–20 osób",question:"Jak pozycjonować usługę jako działający system sprzedaży, a nie kolejne szkolenie?",score:78,demand:86,saturation:58,readiness:72,status:"ready",updatedAt:"" },
  { id:"biogas",name:"Mikrobiogazownie",sector:"Energetyka rolnicza i biogaz",region:"Polska",icp:"Gospodarstwa hodowlane i firmy rolno-spożywcze z własnymi substratami",question:"Które argumenty inwestycyjne najsilniej skracają drogę od zainteresowania do decyzji?",score:83,demand:81,saturation:37,readiness:76,status:"ready",updatedAt:"" },
  { id:"storage",name:"MagazynZysku.pl",sector:"Magazyny energii i dotacje",region:"Polska",icp:"Firmy i gospodarstwa z wysokim zużyciem energii oraz potencjałem dotacyjnym",question:"Jak połączyć język oszczędności, bezpieczeństwa i dotacji w jednej wiarygodnej ofercie?",score:74,demand:84,saturation:66,readiness:61,status:"ready",updatedAt:"" },
];

const defaultFindings: Finding[] = [
  {id:"f1",projectId:"simply",kind:"opportunity",title:"„System sprzedaży” wygrywa z „doradztwem”",summary:"Klienci oczekują wdrożenia, kontroli i powtarzalnego sposobu pracy — nie samej rekomendacji.",sourceLabel:"Hipoteza startowa",confidence:"Do walidacji",metric:"Priorytet 1"},
  {id:"f2",projectId:"simply",kind:"gap",title:"Luka między konsultingiem a prostym kursem",summary:"Małe zespoły potrzebują praktycznego wdrożenia bez kosztu i ciężaru dużego projektu konsultingowego.",sourceLabel:"Mapa konkurencji",confidence:"Modelowa",metric:"Luka oferty"},
  {id:"f3",projectId:"simply",kind:"signal",title:"CRM jest objawem, nie rozwiązaniem",summary:"W rozmowie sprzedażowej należy zaczynać od procesu i odpowiedzialności, a dopiero potem od narzędzia.",sourceLabel:"Wiedza projektowa",confidence:"Wysoka",metric:"Teza komunikacji"},
  {id:"f4",projectId:"biogas",kind:"opportunity",title:"Niezależność energetyczna łączy korzyści",summary:"Prąd, ciepło i przewidywalność kosztów tworzą mocniejszą narrację niż pojedynczy parametr urządzenia.",sourceLabel:"Wiedza projektowa",confidence:"Wysoka",metric:"Argument główny"},
  {id:"f5",projectId:"biogas",kind:"signal",title:"Poferment usuwa dwa problemy naraz",summary:"Wartość nawozowa i ograniczenie zapachów rozszerzają uzasadnienie inwestycji poza samą energię.",sourceLabel:"Wiedza projektowa",confidence:"Wysoka",metric:"Argument łączony"},
  {id:"f6",projectId:"storage",kind:"gap",title:"Klient potrzebuje wyniku po dotacji",summary:"Rynek często komunikuje parametry techniczne, pomijając prostą odpowiedź: ile zostaje w firmie po inwestycji.",sourceLabel:"Hipoteza startowa",confidence:"Do walidacji",metric:"Kalkulator ROI"},
];

const moduleItems: { id:View; step:string; label:string; detail:string; icon:typeof Crosshair }[] = [
  {id:"target",step:"01",label:"Kierunek",detail:"Rynek i ICP",icon:Crosshair},
  {id:"competitors",step:"02",label:"Konkurencja",detail:"Mapa ofert",icon:Building2},
  {id:"voice",step:"03",label:"Głos klienta",detail:"Język zakupu",icon:MessageSquareQuote},
  {id:"demand",step:"04",label:"Radar popytu",detail:"Trendy i intencje",icon:Radar},
  {id:"report",step:"05",label:"Synteza",detail:"Raport decyzji",icon:FileText},
];

const navItems: { id:View; label:string; icon:typeof LayoutDashboard }[] = [
  {id:"dashboard",label:"Centrum dowodzenia",icon:LayoutDashboard}, {id:"projects",label:"Projekty",icon:Target},
  {id:"competitors",label:"Konkurencja",icon:Building2}, {id:"voice",label:"Głos klienta",icon:MessageSquareQuote},
  {id:"demand",label:"Radar popytu",icon:Radar}, {id:"report",label:"Raporty",icon:FileText},
];

function projectLabel(project: Project) { return `${project.name} — ${project.region}`; }

export default function Home() {
  const [projects,setProjects] = useState(defaultProjects);
  const [findings,setFindings] = useState(defaultFindings);
  const [projectId,setProjectId] = useState(defaultProjects[0].id);
  const [view,setView] = useState<View>("dashboard");
  const [searchOpen,setSearchOpen] = useState(false);
  const [query,setQuery] = useState("");
  const [dialogOpen,setDialogOpen] = useState(false);
  const [saving,setSaving] = useState(false);
  const [storageNote,setStorageNote] = useState("Wczytuję zapisane projekty…");
  const [form,setForm] = useState({name:"",sector:"",region:"Polska",icp:"",question:""});

  useEffect(() => {
    fetch("/api/projects").then(async (response) => {
      if (!response.ok) throw new Error("storage");
      const data = await response.json() as {projects:Project[];findings:Finding[]};
      if (data.projects?.length) {
        setProjects(data.projects); setFindings(data.findings || []); setProjectId(data.projects[0].id);
      }
      setStorageNote("Projekty zapisują się automatycznie");
    }).catch(() => setStorageNote("Tryb podglądu — zapis zostanie włączony po publikacji"));
  },[]);

  useEffect(() => {
    const modelContext = (document as Document & {modelContext?: {registerTool:(tool:unknown,options?:unknown)=>void}}).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    modelContext.registerTool({ name:"select_market_research_module", title:"Otwórz moduł badania", description:"Otwiera wybrany moduł aktywnego projektu badania rynku.", inputSchema:{type:"object",properties:{module:{type:"string",enum:["target","competitors","voice","demand","report"]}},required:["module"],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:(input:{module:View})=>{setView(input.module);return {module:input.module,projectId};} },{signal:lifecycle.signal});
    return () => lifecycle.abort();
  },[projectId]);

  const project = projects.find((item) => item.id === projectId) || projects[0];
  const projectFindings = useMemo(() => findings.filter((item) => item.projectId === project?.id && `${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase())),[findings,project?.id,query]);

  async function createProject(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/projects",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});
      const data = await response.json() as {project?:Project;findings?:Finding[];error?:string};
      if (!response.ok || !data.project) throw new Error(data.error || "Nie udało się zapisać projektu.");
      setProjects((items) => [data.project!,...items]); setFindings((items) => [...(data.findings || []),...items]);
      setProjectId(data.project.id); setView("target"); setDialogOpen(false); setForm({name:"",sector:"",region:"Polska",icp:"",question:""});
    } catch (error) { setStorageNote(error instanceof Error ? error.message : "Nie udało się zapisać projektu."); }
    finally { setSaving(false); }
  }

  function downloadReport() {
    const items = findings.filter((item) => item.projectId === project.id);
    const report = `<!doctype html><html lang="pl"><meta charset="utf-8"><title>Raport — ${project.name}</title><style>body{font:16px/1.55 Arial;max-width:850px;margin:50px auto;color:#17251f}h1{font:38px Georgia}h2{margin-top:32px;border-bottom:1px solid #ccc;padding-bottom:8px}.metric{display:inline-block;margin:4px;padding:10px 14px;background:#eef4dc;border-radius:8px}.note{padding:14px;background:#fff7dd;border-left:4px solid #d0a522}article{margin:18px 0}</style><h1>${project.name}<br>Raport rozpoznania rynku</h1><p>${project.sector} · ${project.region}</p><p class="note"><b>Status źródeł:</b> raport MVP łączy dane projektowe i hipotezy startowe. Wnioski oznaczone „do walidacji” nie są jeszcze potwierdzonymi faktami rynkowymi.</p><h2>Pytanie badawcze</h2><p>${project.question}</p><h2>Ocena modelowa</h2><span class="metric">Szansa ${project.score}/100</span><span class="metric">Popyt ${project.demand}%</span><span class="metric">Nasycenie ${project.saturation}%</span><span class="metric">Gotowość ${project.readiness}%</span><h2>Najważniejsze sygnały</h2>${items.map((item)=>`<article><b>${item.title}</b><p>${item.summary}</p><small>${item.sourceLabel} · ${item.confidence}</small></article>`).join("")}<h2>Następny krok</h2><p>Zweryfikować hipotezy na danych z witryn konkurencji, opinii klientów i aktualnych trendów wyszukiwania.</p></html>`;
    const url = URL.createObjectURL(new Blob([report],{type:"text/html;charset=utf-8"})); const anchor=document.createElement("a"); anchor.href=url; anchor.download=`raport-${project.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}.html`; anchor.click(); URL.revokeObjectURL(url);
  }

  if (!project) return null;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true">S</div><div><strong>SIMPLY</strong><span>MARKET INTELLIGENCE</span></div></div>
        <nav aria-label="Główna nawigacja" className="main-nav">
          <p className="nav-label">PRZESTRZEŃ ROBOCZA</p>
          {navItems.map(({id,label,icon:Icon})=><button onClick={()=>setView(id)} className={view===id?"nav-item active":"nav-item"} key={id}><Icon aria-hidden="true"/><span>{label}</span>{id==="voice"&&<em>{findings.filter((f)=>f.projectId===project.id).length}</em>}</button>)}
        </nav>
        <div className="sidebar-footer"><div className="storage-note"><span/><p>{storageNote}</p></div><div className="user-chip"><span>MP</span><div><strong>Marek</strong><small>Właściciel</small></div></div></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="project-switcher"><span>AKTYWNY PROJEKT</span><NativeSelect value={project.id} onChange={(event)=>{setProjectId(event.target.value);setView("dashboard")}} aria-label="Aktywny projekt">{projects.map((item)=><NativeSelectOption key={item.id} value={item.id}>{projectLabel(item)}</NativeSelectOption>)}</NativeSelect></div>
          <div className="topbar-actions">
            {searchOpen&&<div className="search-field"><Search/><Input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Szukaj w sygnałach…"/><button onClick={()=>{setSearchOpen(false);setQuery("")}} aria-label="Zamknij wyszukiwanie"><X/></button></div>}
            {!searchOpen&&<button onClick={()=>setSearchOpen(true)} aria-label="Szukaj" className="icon-button"><Search/></button>}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button className="new-research"><Plus/> Nowe badanie</Button></DialogTrigger>
              <DialogContent className="research-dialog">
                <DialogHeader><DialogTitle>Nowe badanie rynku</DialogTitle><DialogDescription>Zacznij od dobrego pytania. Reszta systemu będzie pracować pod nie.</DialogDescription></DialogHeader>
                <form onSubmit={createProject} className="research-form">
                  <div className="form-grid"><div><Label htmlFor="name">Nazwa projektu</Label><Input id="name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="np. Nowa usługa B2B" required/></div><div><Label htmlFor="region">Rynek / region</Label><Input id="region" value={form.region} onChange={(e)=>setForm({...form,region:e.target.value})} required/></div></div>
                  <div><Label htmlFor="sector">Branża i oferta</Label><Input id="sector" value={form.sector} onChange={(e)=>setForm({...form,sector:e.target.value})} placeholder="Co sprzedajesz i komu?" required/></div>
                  <div><Label htmlFor="icp">Idealny klient</Label><Textarea id="icp" value={form.icp} onChange={(e)=>setForm({...form,icp:e.target.value})} placeholder="Rola, typ firmy, potrzeba, skala…" required/></div>
                  <div><Label htmlFor="question">Pytanie, które ma zarabiać</Label><Textarea id="question" value={form.question} onChange={(e)=>setForm({...form,question:e.target.value})} placeholder="Jaką decyzję ma ułatwić to badanie?" required/></div>
                  <DialogFooter><Button type="button" variant="outline" onClick={()=>setDialogOpen(false)}>Anuluj</Button><Button type="submit" disabled={saving}>{saving?<LoaderCircle className="animate-spin"/>:<Play/>} Utwórz i rozpocznij</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="content">
          {view!=="dashboard"&&<button className="back-button" onClick={()=>setView("dashboard")}><ArrowLeft/> Centrum dowodzenia</button>}
          {view==="dashboard" ? <Dashboard project={project} findings={projectFindings} setView={setView} query={query}/> : <ModuleView view={view} project={project} projects={projects} findings={projectFindings} setProjectId={setProjectId} setView={setView} downloadReport={downloadReport}/>} 
        </div>
      </section>
    </main>
  );
}

function Dashboard({project,findings,setView,query}:{project:Project;findings:Finding[];setView:(view:View)=>void;query:string}) {
  return <>
    <section className="intro-row"><div><div className="eyebrow"><span/> CENTRUM DOWODZENIA</div><h1>Rynek nie mówi wprost.<br/>Ten system <i>słucha.</i></h1><p>{project.name} · {project.region} · oceny modelowe i wiedza projektowa</p></div><div className="status-pill"><span/> Projekt gotowy</div></section>
    <section className="source-banner"><Sparkles/><p><strong>Uczciwy status danych</strong>Obecna wersja zapisuje projekty, prowadzi analizę i generuje raport. Sygnały startowe są hipotezami; automatyczne pobieranie źródeł będzie kolejnym etapem.</p></section>
    <section className="module-track" aria-label="Moduły badania">{moduleItems.map(({id,step,label,detail,icon:Icon},index)=><button key={id} onClick={()=>setView(id)} className={`module-step ${index<2?"done":index===2?"active":"queued"}`}><div className="module-topline"><span>{step}</span>{index<2?<CheckCircle2/>:<CircleDashed/>}</div><Icon className="module-icon"/><strong>{label}</strong><small>{detail}</small></button>)}</section>
    <section className="dashboard-grid">
      <article className="pulse-card"><div className="card-heading"><div><span className="section-number">01</span><h2>Puls rynku</h2></div><button onClick={()=>setView("report")}>Pełna analiza <ArrowUpRight/></button></div><div className="pulse-body"><div className="score-visual" aria-label={`Ocena szansy rynkowej ${project.score} na 100`}><svg viewBox="0 0 220 220" role="img"><circle className="ring-base" cx="110" cy="110" r="88"/><circle className="ring-value" cx="110" cy="110" r="88" style={{strokeDashoffset:552.9*(1-project.score/100)}}/></svg><div><strong>{project.score}</strong><span>/ 100</span><small>OCENA MODELOWA</small></div></div><div className="pulse-metrics"><Metric icon={TrendingUp} label="Popyt" value={`${project.demand}%`} width={project.demand}/><Metric icon={Users} label="Nasycenie" value={`${project.saturation}%`} width={project.saturation}/><Metric icon={Gauge} label="Gotowość" value={`${project.readiness}%`} width={project.readiness}/></div></div><div className="signal-note"><Sparkles/><p><strong>Pytanie badawcze</strong>{project.question}</p></div></article>
      <article className="activity-card"><div className="card-heading"><div><span className="section-number">02</span><h2>Orkiestrator</h2></div><span className="live-dot">PLAN PRACY</span></div><div className="agent-focus"><div className="agent-orbit"><Sparkles/></div><div><span>NASTĘPNY MODUŁ</span><strong>Głos klienta i język zakupu</strong><small>{project.icp}</small></div></div><div className="activity-list"><Activity done title="Kierunek badania zdefiniowany" detail={`${project.sector} · ${project.region}`}/><Activity done title="Mapa konkurencji przygotowana" detail="Struktura analizy ofert i luk"/><Activity title="Walidacja danych zewnętrznych" detail="Oczekuje na podłączenie źródeł"/></div><Button variant="outline" className="activity-button" onClick={()=>setView("voice")}><Play/> Otwórz bieżący moduł</Button></article>
    </section>
    <section className="insights-section"><div className="card-heading"><div><span className="section-number">03</span><h2>{query?`Wyniki wyszukiwania: „${query}”`:"Sygnały, które zmieniają decyzje"}</h2></div><button onClick={()=>setView("report")}>Raport <ArrowUpRight/></button></div><FindingGrid findings={findings}/></section>
  </>;
}

function Metric({icon:Icon,label,value,width}:{icon:typeof TrendingUp;label:string;value:string;width:number}) { return <div><span><Icon/> {label}</span><strong>{value}</strong><i className="bar"><b style={{width:`${width}%`}}/></i></div>; }
function Activity({done,title,detail}:{done?:boolean;title:string;detail:string}) { return <div className={done?"complete":""}>{done?<CheckCircle2/>:<CircleDashed/>}<p><strong>{title}</strong><span>{detail}</span></p><time>{done?"GOTOWE":"KOLEJKA"}</time></div>; }

function FindingGrid({findings}:{findings:Finding[]}) {
  if (!findings.length) return <div className="empty-state"><Search/><strong>Brak pasujących sygnałów</strong><p>Zmień wyszukiwane hasło albo rozpocznij nowe badanie.</p></div>;
  return <div className="insight-grid">{findings.map((item)=><article key={item.id}><span className={`tag ${item.kind}`}>{item.kind==="opportunity"?"SZANSA":item.kind==="gap"?"LUKA":"SYGNAŁ"}</span><strong>{item.title}</strong><p>{item.summary}</p><footer><span>{item.sourceLabel}</span><b>{item.confidence}</b></footer></article>)}</div>;
}

function ModuleView({view,project,projects,findings,setProjectId,setView,downloadReport}:{view:View;project:Project;projects:Project[];findings:Finding[];setProjectId:(id:string)=>void;setView:(v:View)=>void;downloadReport:()=>void}) {
  const meta = moduleItems.find((item)=>item.id===view);
  if(view==="projects") return <><ModuleHeader eyebrow="PORTFEL BADAŃ" title="Projekty" description="Każdy rynek ma własny brief, hipotezy i raport."/><div className="project-grid">{projects.map((item)=><button key={item.id} onClick={()=>{setProjectId(item.id);setView("dashboard")}} className={item.id===project.id?"project-card selected":"project-card"}><span>{item.region}</span><strong>{item.name}</strong><p>{item.sector}</p><div><b>{item.score}</b><small>ocena modelowa</small><ArrowUpRight/></div></button>)}</div></>;
  return <><ModuleHeader eyebrow={`MODUŁ ${meta?.step || "05"}`} title={meta?.label || "Synteza"} description={moduleDescription(view,project)}/>{view==="target"&&<div className="detail-grid"><InfoCard label="RYNEK" value={project.region} detail={project.sector}/><InfoCard label="IDEALNY KLIENT" value={project.icp} detail="Punkt odniesienia dla wszystkich źródeł i wniosków."/><InfoCard wide label="PYTANIE, KTÓRE MA ZARABIAĆ" value={project.question} detail="Każdy moduł ma dostarczyć materiał do tej decyzji."/></div>}{view==="competitors"&&<CompetitorBoard project={project}/>} {view==="voice"&&<VoiceBoard project={project} findings={findings}/>} {view==="demand"&&<DemandBoard project={project}/>} {view==="report"&&<ReportBoard project={project} findings={findings} onDownload={downloadReport}/>}</>;
}

function ModuleHeader({eyebrow,title,description}:{eyebrow:string;title:string;description:string}) { return <section className="module-header"><div className="eyebrow"><span/> {eyebrow}</div><h1>{title}</h1><p>{description}</p></section>; }
function moduleDescription(view:View,project:Project){const copy:Record<string,string>={target:"Precyzyjny cel chroni przed zbieraniem danych, które wyglądają mądrze, ale niczego nie rozstrzygają.",competitors:`Porównaj sposób, w jaki rynek ${project.sector.toLowerCase()} przedstawia ofertę, cenę i dowody.`,voice:"Oddziel język firmy od języka klienta. Ten drugi zwykle sprzedaje lepiej.",demand:"Uporządkuj tematy według intencji i potencjału, zanim wydasz budżet na promocję.",report:"Jedno miejsce na wnioski, stopień pewności i następne decyzje."};return copy[view]||""}
function InfoCard({label,value,detail,wide}:{label:string;value:string;detail:string;wide?:boolean}){return <article className={wide?"info-card wide":"info-card"}><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>}

function CompetitorBoard({project}:{project:Project}) { const rows=[{name:"Lider kategorii",offer:"Pełna usługa premium",price:"Cena po konsultacji",gap:"Ciężki proces zakupu"},{name:"Specjalista lokalny",offer:"Wdrożenie punktowe",price:"Średni próg wejścia",gap:"Brak mierzalnego systemu"},{name:"Tania alternatywa",offer:"Kurs lub szablony",price:"Niski próg wejścia",gap:"Klient zostaje sam"}]; return <div className="analysis-panel"><div className="panel-note"><Building2/><p><strong>Mapa robocza dla: {project.name}</strong>Nazwy firm i aktualne ceny pojawią się po podłączeniu źródeł. Teraz porównujesz trzy strategiczne pozycje rynkowe.</p></div><div className="comparison-table"><div className="table-row head"><span>POZYCJA</span><span>OFERTA</span><span>CENA</span><span>LUKA</span></div>{rows.map((row)=><div className="table-row" key={row.name}><strong>{row.name}</strong><span>{row.offer}</span><span>{row.price}</span><em>{row.gap}</em></div>)}</div></div> }
function VoiceBoard({project,findings}:{project:Project;findings:Finding[]}) { return <div className="voice-layout"><div className="quote-wall"><span>FRAZY O NAJWYŻSZEJ WARTOŚCI</span><blockquote>„Chcę wiedzieć, co robić w poniedziałek, nie dostać kolejnego slajdu.”</blockquote><blockquote>„Potrzebuję wyniku, który da się kontrolować.”</blockquote><blockquote>„Nie chcę uzależniać firmy od jednej osoby.”</blockquote><p>Przykładowy język do zastąpienia cytatami z rzeczywistych źródeł.</p></div><div><InfoCard label="ODBIORCA" value={project.icp} detail="Filtruj wypowiedzi według roli, momentu zakupu i obiekcji."/><div className="mini-findings"><FindingGrid findings={findings.slice(0,2)}/></div></div></div> }
function DemandBoard({project}:{project:Project}) { const bars=[{label:"Rozwiązanie konkretnego problemu",value:project.demand},{label:"Koszt i zwrot z inwestycji",value:Math.max(35,project.demand-8)},{label:"Porównanie dostawców",value:Math.max(25,project.demand-19)},{label:"Samodzielne wdrożenie",value:Math.max(20,project.demand-31)}]; return <div className="analysis-panel"><div className="panel-note"><Radar/><p><strong>Model intencji dla: {project.name}</strong>Wartości pokazują strukturę roboczą. Po podłączeniu danych zostaną zastąpione aktualnymi trendami i wolumenami.</p></div><div className="demand-chart">{bars.map((bar,index)=><div key={bar.label}><span>{bar.label}</span><i><b style={{width:`${bar.value}%`}}/></i><strong>{index===0?"Wysoki":index===1?"Średnio-wysoki":"Średni"}</strong></div>)}</div></div> }
function ReportBoard({project,findings,onDownload}:{project:Project;findings:Finding[];onDownload:()=>void}) { return <div className="report-sheet"><header><div><span>RAPORT DECYZYJNY · MVP</span><h2>{project.name}</h2><p>{project.sector} · {project.region}</p></div><Button onClick={onDownload}><Download/> Pobierz raport</Button></header><div className="report-warning"><Sparkles/><p><strong>Granica pewności</strong>Hipotezy są wyraźnie oznaczone. Przed decyzją inwestycyjną trzeba je potwierdzić na aktualnych źródłach zewnętrznych.</p></div><div className="report-kpis"><MetricTile label="Szansa" value={`${project.score}/100`}/><MetricTile label="Popyt" value={`${project.demand}%`}/><MetricTile label="Nasycenie" value={`${project.saturation}%`}/><MetricTile label="Gotowość" value={`${project.readiness}%`}/></div><section><span className="report-label">PYTANIE BADAWCZE</span><h3>{project.question}</h3></section><section><span className="report-label">KLUCZOWE SYGNAŁY</span><FindingGrid findings={findings}/></section><section className="next-step"><span>NASTĘPNY KROK</span><strong>Podłącz źródła: strony konkurencji, opinie klientów i trendy wyszukiwania.</strong></section></div> }
function MetricTile({label,value}:{label:string;value:string}) { return <div><span>{label}</span><strong>{value}</strong><small>ocena modelowa</small></div>; }
