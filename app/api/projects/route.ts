import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { findings, projects } from "@/db/schema";

const now = () => new Date().toISOString();

function ownerId(request: Request) {
  return request.headers.get("oai-authenticated-user-id") || "local-owner";
}

const seedProjects = (owner: string) => [
  { id: `simply-${owner}`, ownerId: owner, name: "Simply B2B", sector: "Doradztwo i wdrażanie sprzedaży B2B", region: "Polska", icp: "Właściciele firm B2B i dyrektorzy sprzedaży, zespoły 2–20 osób", question: "Jak pozycjonować usługę jako działający system sprzedaży, a nie kolejne szkolenie?", score: 78, demand: 86, saturation: 58, readiness: 72, status: "ready", updatedAt: now() },
  { id: `biogas-${owner}`, ownerId: owner, name: "Mikrobiogazownie", sector: "Energetyka rolnicza i biogaz", region: "Polska", icp: "Gospodarstwa hodowlane i firmy rolno-spożywcze z własnymi substratami", question: "Które argumenty inwestycyjne najsilniej skracają drogę od zainteresowania do decyzji?", score: 83, demand: 81, saturation: 37, readiness: 76, status: "ready", updatedAt: now() },
  { id: `storage-${owner}`, ownerId: owner, name: "MagazynZysku.pl", sector: "Magazyny energii i dotacje", region: "Polska", icp: "Firmy i gospodarstwa z wysokim zużyciem energii oraz potencjałem dotacyjnym", question: "Jak połączyć język oszczędności, bezpieczeństwa i dotacji w jednej wiarygodnej ofercie?", score: 74, demand: 84, saturation: 66, readiness: 61, status: "ready", updatedAt: now() },
];

const seedFindings = (owner: string) => [
  { id:`f1-${owner}`,projectId:`simply-${owner}`,kind:"opportunity",title:"„System sprzedaży” wygrywa z „doradztwem”",summary:"Klienci oczekują wdrożenia, kontroli i powtarzalnego sposobu pracy — nie samej rekomendacji.",sourceLabel:"Hipoteza startowa",confidence:"Do walidacji",metric:"Priorytet 1",createdAt:now() },
  { id:`f2-${owner}`,projectId:`simply-${owner}`,kind:"gap",title:"Luka między konsultingiem a prostym kursem",summary:"Małe zespoły potrzebują praktycznego wdrożenia bez kosztu i ciężaru dużego projektu konsultingowego.",sourceLabel:"Mapa konkurencji",confidence:"Modelowa",metric:"Luka oferty",createdAt:now() },
  { id:`f3-${owner}`,projectId:`simply-${owner}`,kind:"signal",title:"CRM jest objawem, nie rozwiązaniem",summary:"W rozmowie sprzedażowej należy zaczynać od procesu i odpowiedzialności, a dopiero potem od narzędzia.",sourceLabel:"Wiedza projektowa",confidence:"Wysoka",metric:"Teza komunikacji",createdAt:now() },
  { id:`f4-${owner}`,projectId:`biogas-${owner}`,kind:"opportunity",title:"Niezależność energetyczna łączy korzyści",summary:"Prąd, ciepło i przewidywalność kosztów tworzą mocniejszą narrację niż pojedynczy parametr urządzenia.",sourceLabel:"Wiedza projektowa",confidence:"Wysoka",metric:"Argument główny",createdAt:now() },
  { id:`f5-${owner}`,projectId:`biogas-${owner}`,kind:"signal",title:"Poferment usuwa dwa problemy naraz",summary:"Wartość nawozowa i ograniczenie zapachów rozszerzają uzasadnienie inwestycji poza samą energię.",sourceLabel:"Wiedza projektowa",confidence:"Wysoka",metric:"Argument łączony",createdAt:now() },
  { id:`f6-${owner}`,projectId:`storage-${owner}`,kind:"gap",title:"Klient potrzebuje wyniku po dotacji",summary:"Rynek często komunikuje parametry techniczne, pomijając prostą odpowiedź: ile zostaje w firmie po inwestycji.",sourceLabel:"Hipoteza startowa",confidence:"Do walidacji",metric:"Kalkulator ROI",createdAt:now() },
];

export async function GET(request: Request) {
  try {
    const db = getDb();
    const owner = ownerId(request);
    const existing = await db.select().from(projects).where(eq(projects.ownerId, owner)).limit(1);
    if (!existing.length) {
      await db.insert(projects).values(seedProjects(owner)).onConflictDoNothing();
      await db.insert(findings).values(seedFindings(owner)).onConflictDoNothing();
    }
    const projectRows = await db.select().from(projects).where(eq(projects.ownerId, owner)).orderBy(desc(projects.updatedAt));
    const findingRows = await db.select().from(findings).orderBy(desc(findings.createdAt));
    const ownedIds = new Set(projectRows.map((project) => project.id));
    return Response.json({ projects: projectRows, findings: findingRows.filter((finding) => ownedIds.has(finding.projectId)) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Nie udało się wczytać projektów." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const owner = ownerId(request);
    const body = await request.json() as { name?:string; sector?:string; region?:string; icp?:string; question?:string };
    const required = [body.name, body.sector, body.region, body.icp, body.question].map((value) => value?.trim() || "");
    if (required.some((value) => !value)) return Response.json({ error:"Uzupełnij wszystkie pola." }, { status:400 });
    const id = crypto.randomUUID();
    const [project] = await db.insert(projects).values({ id, ownerId:owner, name:required[0], sector:required[1], region:required[2], icp:required[3], question:required[4], score:50, demand:50, saturation:50, readiness:40, status:"new", updatedAt:now() }).returning();
    const starterFindings = [
      { id:crypto.randomUUID(),projectId:id,kind:"opportunity",title:"Hipoteza przewagi do sprawdzenia",summary:`Sprawdź, czy ${required[2]} ma niedostatecznie obsłużoną grupę: ${required[3]}.`,sourceLabel:"Hipoteza z briefu",confidence:"Do walidacji",metric:"Start",createdAt:now() },
      { id:crypto.randomUUID(),projectId:id,kind:"signal",title:"Pytanie, które ma zarabiać",summary:required[4],sourceLabel:"Brief projektu",confidence:"Pytanie badawcze",metric:"Kierunek",createdAt:now() },
    ];
    await db.insert(findings).values(starterFindings);
    return Response.json({ project, findings:starterFindings }, { status:201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Nie udało się utworzyć projektu." }, { status:500 });
  }
}
