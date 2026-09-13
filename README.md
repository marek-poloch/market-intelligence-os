# Simply Market Intelligence OS

Polskojęzyczna aplikacja webowa do prowadzenia uporządkowanych badań rynku. Łączy pięć etapów pracy — od zdefiniowania rynku i klienta idealnego, przez analizę konkurencji i języka klientów, aż po ocenę popytu oraz raport decyzyjny.

Projekt powstał jako funkcjonalna interpretacja koncepcji **AI Market Research Operating System** przedstawionej przez kanał ReStructure AI w filmie:

> [I Built AI Market Research Operating System — YouTube Shorts](https://www.youtube.com/shorts/d5OcgCtkZuI)

## Co potrafi aplikacja

### 1. Kierunek badania

- opis rynku i obszaru geograficznego,
- określenie branży i analizowanej oferty,
- zdefiniowanie idealnego profilu klienta (ICP),
- zapisanie najważniejszego pytania biznesowego, na które badanie ma odpowiedzieć.

### 2. Analiza konkurencji

- porównanie sposobów pozycjonowania ofert,
- uporządkowanie poziomów cenowych,
- wskazanie słabych stron oraz niewykorzystanych luk rynkowych,
- robocza mapa trzech pozycji: lider kategorii, specjalista i tania alternatywa.

### 3. Głos klienta

- gromadzenie języka używanego przez klientów,
- identyfikacja potrzeb, obiekcji i momentów wyzwalających zakup,
- oddzielenie języka firmy od języka klienta,
- prezentacja najważniejszych fraz i hipotez komunikacyjnych.

### 4. Radar popytu

- modelowanie intencji wyszukiwania,
- porównanie potencjału tematów związanych z problemem, ceną, dostawcami i samodzielnym wdrożeniem,
- ocena popytu, nasycenia rynku i gotowości oferty.

### 5. Synteza i raport

- zebranie kluczowych wniosków w jednym widoku,
- oznaczanie rodzaju sygnału, źródła oraz poziomu pewności,
- odróżnienie wiedzy projektowej od hipotez wymagających walidacji,
- pobranie samodzielnego raportu HTML, który można wydrukować do PDF.

## Pozostałe funkcje

- tworzenie i zapisywanie wielu projektów badawczych,
- trwałe przechowywanie danych w Cloudflare D1,
- przełączanie aktywnego projektu,
- wyszukiwanie sygnałów i wniosków,
- trzy przykładowe projekty: Simply B2B, Mikrobiogazownie i MagazynZysku.pl,
- responsywny interfejs na komputer, tablet i telefon,
- prywatna wersja wdrożeniowa w ChatGPT Sites,
- eksperymentalne narzędzie WebMCP do otwierania modułów przez agenta AI.

## Status projektu

To działające **MVP**. Obecna wersja zapewnia interfejs, model danych, projekty, moduły analityczne i raportowanie. Wbudowane sygnały startowe są jawnie opisane jako wiedza projektowa lub hipotezy.

Kolejny etap rozwoju powinien obejmować:

- automatyczne pobieranie stron i ofert konkurencji,
- analizę opinii, komentarzy i studiów przypadków,
- integrację z Google Trends lub innym źródłem danych o popycie,
- podłączenie modelu językowego do syntezy materiałów,
- harmonogram cyklicznych aktualizacji badań,
- cytowanie źródeł i archiwizację dowodów.

## Technologie

- TypeScript,
- React 19,
- Next.js / Vinext,
- Tailwind CSS,
- komponenty Shadcn/Base UI,
- Cloudflare Workers,
- Cloudflare D1,
- Drizzle ORM.

## Uruchomienie lokalne

Wymagany jest Node.js 22.13 lub nowszy oraz `pnpm`.

```bash
pnpm install
pnpm dev
```

Budowanie wersji produkcyjnej:

```bash
pnpm build
```

Przy lokalnym korzystaniu z D1 należy wygenerować i zastosować migracje znajdujące się w katalogu `drizzle/`.

## Ważne ograniczenie

Oceny wyświetlane w MVP są ocenami modelowymi służącymi do organizacji pracy. Nie powinny być traktowane jako potwierdzone dane rynkowe, dopóki nie zostaną poparte aktualnymi źródłami zewnętrznymi.
