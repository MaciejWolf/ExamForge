# Dokument wymagań produktu (PRD) - ExamForge
## 1. Przegląd produktu
ExamForge to aplikacja webowa przeznaczona do tworzenia, zarządzania i przeprowadzania testów z dynamicznym doborem pytań. Celem produktu jest usprawnienie procesu egzaminowania dla nauczycieli, szkoleniowców i innych edukatorów. Wersja MVP (Minimum Viable Product) skupi się na dostarczeniu kluczowej funkcjonalności: zarządzania globalnym bankiem pytań jednokrotnego wyboru, tworzenia szablonów testów z lokalnymi pulami pytań, przeprowadzania sesji testowych dla uczestników za pomocą unikalnych kodów oraz generowania podstawowych raportów z wynikami. Aplikacja w pierwszej wersji będzie skierowana na rynek ogólny, bez integracji z zewnętrznymi systemami.

## 2. Problem użytkownika
Egzaminatorzy (nauczyciele, trenerzy) stają przed wyzwaniem czasochłonnego i pracochłonnego procesu tworzenia, dystrybucji i oceniania testów. Ręczne przygotowywanie wielu wariantów egzaminu w celu zapewnienia uczciwości jest nieefektywne, a proces oceniania podatny na błędy i opóźnienia. Z drugiej strony, Uczestnicy (studenci, kursanci) potrzebują prostego, intuicyjnego i niezawodnego narzędzia do rozwiązywania testów, które zapewni im natychmiastową informację zwrotną o uzyskanych wynikach. Brak zautomatyzowanych narzędzi prowadzi do frustracji po obu stronach, obniża efektywność nauczania i utrudnia analizę postępów.

## 3. Wymagania funkcjonalne
- FR-01: System Kont Egzaminatorów: Rejestracja, logowanie i odzyskiwanie hasła dla egzaminatorów.
- FR-02: Zarządzanie Bankiem Pytań: Egzaminatorzy mogą tworzyć, edytować i usuwać pytania jednokrotnego wyboru w globalnym banku pytań. Pytania mogą istnieć niezależnie, bez przypisania do żadnej puli. Pytania składają się z treści, od 2 do 6 odpowiedzi tekstowych, wskazania prawidłowej odpowiedzi i liczby punktów. System blokuje usunięcie pytania, jeśli jest ono używane w jakimkolwiek szablonie. Edycja pytania w banku jest widoczna we wszystkich szablonach, które używają tego pytania.
- FR-02A: Tagowanie Pytań: Każde pytanie w banku może mieć przypisane dowolną liczbę tagów (w tym zero). Tagi są tworzone dynamicznie przez egzaminatorów podczas tworzenia lub edycji pytań. Egzaminatorzy mogą filtrować pytania w banku według tagów. Przy dodawaniu pytań do puli w szablonie dostępne są filtry tagów ułatwiające wyszukiwanie odpowiednich pytań. System sugeruje istniejące tagi podczas wpisywania, aby zachować spójność nazewnictwa.
- FR-03: Zarządzanie Pulami Pytań w Szablonie: Pule pytań są lokalne dla każdego szablonu testu. Egzaminator tworzy pule w kontekście szablonu i przypisuje do nich pytania z globalnego banku pytań. W ramach jednego szablonu dane pytanie może należeć maksymalnie do jednej puli. Pytanie może być używane w wielu szablonach, ale w każdym szablonie może być przypisane tylko do jednej puli. Przeniesienie pytania z jednej puli do drugiej w tym samym szablonie usuwa je z pierwszej puli i dodaje do drugiej. Usunięcie puli ze szablonu powoduje, że pytania stają się nieprzypisane w kontekście tego szablonu.
- FR-04: Zarządzanie Szablonami Testów: Egzaminatorzy mogą tworzyć szablony testów, które muszą zawierać co najmniej jedną pulę pytań. W szablonie egzaminator definiuje lokalne pule, przypisuje do nich pytania z banku pytań oraz określa, ile pytań ma zostać losowo wybranych z każdej puli. System blokuje zapisanie szablonu, jeśli liczba pytań do wylosowania z danej puli jest większa niż liczba pytań dostępnych w tej puli.
- FR-05: Uruchamianie Testu i Zarządzanie Uczestnikami: Egzaminator może uruchomić test na podstawie szablonu, wkleić listę identyfikatorów uczestników i otrzymać dla każdego unikalny kod dostępu. Możliwe jest również ustawienie limitu czasu dla testu.
- FR-06: Interfejs Uczestnika do Rozwiązywania Testu: Uczestnicy uzyskują dostęp do testu za pomocą kodu. Test wyświetla jedno pytanie na raz, nawigację (następne/poprzednie) oraz widoczny licznik czasu. Postęp jest zapisywany automatycznie.
- FR-07: Automatyczne Ocenianie: System automatycznie kończy test po upływie czasu i oblicza wynik na podstawie udzielonych odpowiedzi.
- FR-08: Podsumowanie dla Uczestnika: Po zakończeniu testu, uczestnik widzi swój wynik punktowy oraz listę wszystkich pytań z zaznaczeniem poprawnych odpowiedzi.
- FR-09: Raportowanie dla Egzaminatora: Egzaminator ma dostęp do raportu online, który przedstawia wyniki punktowe każdego uczestnika oraz zbiorcze statystyki poprawności odpowiedzi dla każdego pytania.

## 4. Granice produktu
### W zakresie MVP
- Uwierzytelnianie i konta wyłącznie dla Egzaminatorów.
- Dostęp dla Uczestników za pomocą jednorazowych, unikalnych kodów.
- Obsługa wyłącznie pytań jednokrotnego wyboru.
- Czas testu odliczany centralnie na serwerze.
- Automatyczne zapisywanie postępu uczestnika w tle.
- Podstawowe raporty z wyników dla egzaminatora i uczestnika.

### Poza zakresem MVP
- Tryb testu adaptacyjnego.
- Podgląd wygenerowanego testu przez egzaminatora przed jego uruchomieniem.
- Możliwość zakończenia testu przed czasem przez uczestnika.
- Import/eksport pytań lub wyników (np. z/do CSV).
- Obsługa innych typów pytań (np. otwartych, wielokrotnego wyboru).
- Integracje z zewnętrznymi systemami (np. platformami e-learningowymi, systemami uczelnianymi).
- Generowanie certyfikatów.
- Wersjonowanie pytań.

## 5. Historyjki użytkowników
### Zarządzanie Kontem Egzaminatora
- ID: US-001
- Tytuł: Rejestracja konta Egzaminatora
- Opis: Jako Egzaminator, chcę móc założyć nowe konto w systemie przy użyciu mojego adresu e-mail i hasła, aby uzyskać dostęp do funkcji aplikacji.
- Kryteria akceptacji:
  1. Formularz rejestracji zawiera pola na adres e-mail, hasło i potwierdzenie hasła.
  2. System waliduje, czy podany adres e-mail jest w poprawnym formacie i czy nie jest już zajęty.
  3. System sprawdza, czy hasła w obu polach są identyczne i spełniają minimalne wymogi bezpieczeństwa.
  4. Po pomyślnej rejestracji, jestem automatycznie zalogowany i przekierowany do panelu głównego.

- ID: US-002
- Tytuł: Logowanie Egzaminatora
- Opis: Jako zarejestrowany Egzaminator, chcę móc zalogować się na moje konto, aby zarządzać moimi testami.
- Kryteria akceptacji:
  1. Formularz logowania zawiera pola na e-mail i hasło.
  2. Po poprawnym podaniu danych, jestem zalogowany i przekierowany do panelu głównego.
  3. W przypadku podania błędnych danych, wyświetlany jest odpowiedni komunikat.

- ID: US-003
- Tytuł: Odzyskiwanie hasła
- Opis: Jako Egzaminator, który zapomniał hasła, chcę mieć możliwość jego zresetowania, aby odzyskać dostęp do konta.
- Kryteria akceptacji:
  1. Na stronie logowania znajduje się link "Zapomniałem hasła".
  2. Po jego kliknięciu i podaniu adresu e-mail, otrzymuję na skrzynkę wiadomość z linkiem do resetu hasła.
  3. Link jest unikalny i ma ograniczony czas ważności.
  4. Po kliknięciu w link, mogę ustawić nowe hasło dla mojego konta.

### Zarządzanie Treścią przez Egzaminatora
- ID: US-004
- Tytuł: Zarządzanie Bankiem Pytań
- Opis: Jako Egzaminator, chcę zarządzać globalnym bankiem pytań, tworząc, edytując i usuwając pytania jednokrotnego wyboru, aby mieć centralne repozytorium pytań dostępne dla wszystkich moich szablonów.
- Kryteria akceptacji:
  1. Mogę tworzyć nowe pytania w banku pytań, podając treść pytania, od 2 do 6 odpowiedzi, wskazując poprawną odpowiedź i liczbę punktów.
  2. System waliduje, że co najmniej dwie odpowiedzi zostały podane i dokładnie jedna jest oznaczona jako poprawna.
  3. Pytania mogą istnieć w banku bez przypisania do żadnej puli.
  4. Mogę przypisać do pytania dowolną liczbę tagów (lub pozostawić pytanie bez tagów).
  5. Podczas wpisywania tagów system sugeruje istniejące tagi, aby zachować spójność nazewnictwa.
  6. W widoku banku pytań mogę filtrować pytania według jednego lub wielu tagów.
  7. Mogę edytować pytanie w banku (w tym jego tagi), a zmiany są widoczne we wszystkich szablonach, które używają tego pytania.
  8. System blokuje usunięcie pytania, jeśli jest ono używane w jakimkolwiek szablonie (w jakiejkolwiek puli).
  9. Po zapisaniu, pytanie jest widoczne w banku pytań.

- ID: US-005
- Tytuł: Tworzenie Puli Pytań w Szablonie
- Opis: Jako Egzaminator, chcę tworzyć pule pytań w kontekście szablonu testu, nadając im nazwy i przypisując do nich pytania z banku, aby organizować pytania tematycznie w ramach szablonu.
- Kryteria akceptacji:
  1. W edycji szablonu mogę stworzyć nową pulę pytań, podając jej nazwę.
  2. Nazwa puli musi być unikalna w obrębie danego szablonu.
  3. Mogę stworzyć pulę bez pytań (pustą pulę).
  4. Mogę przypisać pytania z banku pytań do puli w szablonie.
  5. Przy dodawaniu pytań do puli mogę filtrować bank pytań według tagów, aby łatwiej znaleźć odpowiednie pytania.
  6. W ramach jednego szablonu dane pytanie może należeć tylko do jednej puli.
  7. Mogę przenieść pytanie z jednej puli do drugiej w tym samym szablonie (usuwa z pierwszej, dodaje do drugiej).
  8. Po usunięciu puli ze szablonu, pytania przypisane do tej puli stają się nieprzypisane w kontekście tego szablonu.

- ID: US-006
- Tytuł: Tworzenie Szablonu Testu
- Opis: Jako Egzaminator, chcę stworzyć szablon testu z lokalnymi pulami pytań, przypisać do nich pytania z banku i zdefiniować, ile pytań z każdej puli ma być losowanych, aby móc wielokrotnie generować na jego podstawie testy.
- Kryteria akceptacji:
  1. Mogę stworzyć nowy szablon testu, nadając mu nazwę.
  2. W szablonie tworzę lokalne pule pytań (szablon musi mieć co najmniej jedną pulę).
  3. Przypisuję pytania z banku pytań do pul w szablonie.
  4. Dla każdej puli określam liczbę pytań do wylosowania.
  5. System blokuje zapisanie szablonu, jeśli liczba pytań do wylosowania z danej puli jest większa niż liczba pytań dostępnych w tej puli.
  6. Szablon zostaje zapisany i jest dostępny na liście szablonów.

### Przeprowadzanie Testu
- ID: US-007
- Tytuł: Uruchamianie Testu z szablonu
- Opis: Jako Egzaminator, chcę uruchomić nową sesję testową na podstawie szablonu, zdefiniować czas trwania i listę uczestników, aby przeprowadzić egzamin.
- Kryteria akceptacji:
  1. Mogę wybrać istniejący szablon testu i rozpocząć nową sesję.
  2. Muszę ustawić limit czasu trwania testu w minutach.
  3. Wklejam listę identyfikatorów uczestników (np. imię i nazwisko, numer indeksu).
  4. System generuje unikalny, jednorazowy kod dostępu dla każdego uczestnika z listy.
  5. Widzę listę uczestników wraz z ich kodami, gotową do dystrybucji.

- ID: US-008
- Tytuł: Rozpoczynanie testu przez Uczestnika
- Opis: Jako Uczestnik, chcę użyć otrzymanego kodu, aby wejść na stronę testu i go rozpocząć.
- Kryteria akceptacji:
  1. Strona startowa aplikacji zawiera pole do wpisania kodu dostępu.
  2. Po wpisaniu poprawnego, aktywnego kodu, przechodzę do widoku testu.
  3. W przypadku wpisania błędnego lub już wykorzystanego kodu, widzę stosowny komunikat.
  4. Po wejściu do testu, zegar rozpoczyna odliczanie czasu.

- ID: US-009
- Tytuł: Rozwiązywanie testu przez Uczestnika
- Opis: Jako Uczestnik, chcę wygodnie odpowiadać na pytania, widząc jedno na raz i móc się między nimi poruszać, mając stały podgląd na pozostały czas.
- Kryteria akceptacji:
  1. Na ekranie widoczne jest jedno pytanie i możliwe odpowiedzi w formie pól jednokrotnego wyboru.
  2. Widoczna jest nawigacja "Następne" i "Poprzednie".
  3. Na ekranie stale widoczny jest licznik pozostałego czasu.
  4. Moje odpowiedzi są automatycznie zapisywane w tle przy każdej zmianie.
  5. Po upływie czasu test kończy się automatycznie, a moje dotychczasowe odpowiedzi są zapisywane.

- ID: US-010
- Tytuł: Wyświetlanie podsumowania dla Uczestnika
- Opis: Jako Uczestnik, chcę po zakończeniu testu natychmiast zobaczyć swój wynik oraz poprawne odpowiedzi, aby poznać rezultaty swojej pracy.
- Kryteria akceptacji:
  1. Bezpośrednio po zakończeniu testu (przez czas lub ręcznie) wyświetla się ekran podsumowania.
  2. Na ekranie widoczna jest łączna liczba zdobytych punktów.
  3. Widoczna jest lista wszystkich pytań z moimi odpowiedziami i wyraźnym wskazaniem, które odpowiedzi były poprawne.

- ID: US-011
- Tytuł: Przeglądanie raportu z testu przez Egzaminatora
- Opis: Jako Egzaminator, chcę mieć dostęp do raportu z zakończonej sesji testowej, aby zobaczyć wyniki wszystkich uczestników i przeanalizować odpowiedzi.
- Kryteria akceptacji:
  1. W panelu mogę wejść do widoku zakończonych testów i wybrać konkretną sesję.
  2. Raport pokazuje listę wszystkich uczestników wraz z ich wynikami punktowymi.
  3. Raport zawiera statystyki dla każdego pytania (np. procent poprawnych odpowiedzi).

## 6. Metryki sukcesu
- Aktywacja: Liczba nowo zarejestrowanych Egzaminatorów w tygodniu/miesiącu.
- Zaangażowanie: Liczba stworzonych testów i przeprowadzonych sesji egzaminacyjnych.
- Użyteczność: Niski odsetek porzuconych testów (uczestnicy, którzy zaczęli, ale nie skończyli).
- Retencja: Odsetek Egzaminatorów, którzy wracają do aplikacji, aby przeprowadzić kolejny test w następnym miesiącu.
