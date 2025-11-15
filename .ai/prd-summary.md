<conversation_summary>
<decisions>
1.  **Zakres MVP**: Aplikacja na start będzie wspierać ogólne rynki (nie tylko akademicki), ale bez integracji z systemami zewnętrznymi.
2.  **Uwierzytelnianie**: Egzaminatorzy będą mieli konta (e-mail/hasło) z opcją odzyskiwania hasła. Uczestnicy nie będą mieli kont; dostęp do testu uzyskają za pomocą unikalnego kodu.
3.  **Identyfikacja Uczestników**: Egzaminator wprowadzi listę identyfikatorów uczestników (np. imię i nazwisko, numer indeksu, pesel), a system wygeneruje dla każdego unikalny kod dostępu.
4.  **Typy Pytań**: MVP będzie obsługiwać wyłącznie pytania jednokrotnego wyboru, z możliwością zdefiniowania liczby punktów za odpowiedź.
5.  **Przebieg Testu**: Uczestnik będzie widział jedno pytanie na raz. Czas będzie odliczany na serwerze, a postęp zapisywany w tle.
6.  **Podsumowanie dla Uczestnika**: Po zakończeniu testu uczestnik zawsze zobaczy pełne podsumowanie z wynikami i wskazaniem poprawnych odpowiedzi.
7.  **Raport dla Egzaminatora**: Egzaminator będzie miał dostęp do raportu online, pokazującego wyniki punktowe każdego uczestnika oraz procent poprawnych odpowiedzi dla każdego pytania.
8.  **Terminologia**: Stosujemy nazewnictwo: `Egzaminator`, `Uczestnik`, `Pula Pytań`, `Szablon Testu`, `Test`.
9.  **Funkcje odłożone (poza MVP)**: Tryb adaptacyjny, podgląd testu przez egzaminatora, możliwość zakończenia testu przed czasem, import/eksport danych.
10. **Panel Egzaminatora**: Dashboard będzie wyświetlał testy w podziale na aktywne, zakończone i nadchodzące. Nawigacja obejmie Pulpit, Pule Pytań, Szablony Testów i Aktywne Testy.
</decisions>

<matched_recommendations>
1.  **Skupienie na MVP**: Pierwszy etap projektu powinien skupić się na kluczowej pętli funkcjonalnej: tworzenie pytań -> tworzenie szablonu testu -> przeprowadzenie testu -> ocena. Zaawansowane funkcje zostaną dodane w późniejszych iteracjach.
2.  **Prosta Identyfikacja**: Użycie unikalnych kodów dla uczestników bez konieczności zakładania przez nich kont upraszcza proces i zmniejsza złożoność związaną z RODO.
3.  **Zapis Postępu**: Automatyczne zapisywanie odpowiedzi w tle jest kluczowe, aby zabezpieczyć uczestników przed utratą postępu w razie problemów z połączeniem internetowym.
4.  **Jasny Interfejs**: Model "jedno pytanie na ekran" z prostą nawigacją i stale widocznym licznikiem czasu zapewni przejrzystość i komfort użytkowania.
5.  **Walidacja Danych**: System powinien aktywnie zapobiegać błędom, np. uniemożliwiając stworzenie testu, jeśli w puli brakuje wystarczającej liczby pytań.
6.  **Spójność Nazewnictwa**: Ustalenie i konsekwentne stosowanie jednolitego słownika pojęć (`Egzaminator`, `Uczestnik` itd.) zapewni spójność komunikacji i interfejsu.
7.  **Zarządzanie Cyklem Życia Testu**: Zablokowanie edycji pytań w aktywnym teście jest kluczowe dla zapewnienia spójności i uczciwości egzaminu.
</matched_recommendations>

<prd_planning_summary>
**1. Główne Wymagania Funkcjonalne:**
*   **System Kont Egzaminatorów**: Rejestracja, logowanie, odzyskiwanie hasła.
*   **Zarządzanie Treścią**: Tworzenie, edycja i usuwanie Pul Pytań. Dodawanie pytań jednokrotnego wyboru (treść, 2-6 odpowiedzi tekstowych, wskazanie poprawnej, punktacja).
*   **Konfiguracja Testów**: Tworzenie Szablonów Testów poprzez definiowanie liczby pytań losowanych z poszczególnych pul.
*   **Uruchamianie i Dystrybucja Testów**: Generowanie unikalnych kodów dostępu na podstawie wklejonej przez Egzaminatora listy identyfikatorów Uczestników. Ustawianie limitu czasu.
*   **Interfejs Uczestnika**: Strona startowa z polem na kod, widok testu z jednym pytaniem na ekranie, nawigacją i licznikiem czasu. Automatyczne zakończenie po upływie czasu.
*   **System Oceniania i Raportowania**: Automatyczne sprawdzanie testów. Ekran podsumowania dla Uczestnika (wynik + poprawne odpowiedzi). Raport dla Egzaminatora (wyniki indywidualne + statystyki pytań).

**2. Kluczowe Historie Użytkownika (User Stories):**
*   **Egzaminator**: *Jako Egzaminator, chcę stworzyć pulę pytań na określony temat, aby móc je później wykorzystywać w różnych testach.*
*   **Egzaminator**: *Jako Egzaminator, chcę zdefiniować strukturę testu, losując określoną liczbę pytań z różnych pul, aby stworzyć zróżnicowany i powtarzalny egzamin.*
*   **Egzaminator**: *Jako Egzaminator, chcę wygenerować unikalne kody dostępu dla moich studentów i monitorować ich wyniki, aby sprawnie przeprowadzić i ocenić sesję egzaminacyjną.*
*   **Uczestnik**: *Jako Uczestnik, chcę użyć otrzymanego kodu, aby rozpocząć test, komfortowo odpowiedzieć na wszystkie pytania w wyznaczonym czasie i od razu poznać swój wynik.*

**3. Kryteria Sukcesu i Mierniki:**
*   **Aktywacja**: Liczba nowo zarejestrowanych Egzaminatorów w tygodniu/miesiącu.
*   **Zaangażowanie**: Liczba stworzonych testów i przeprowadzonych sesji egzaminacyjnych.
*   **Użyteczność**: Niski odsetek porzuconych testów (uczestnicy, którzy zaczęli, ale nie skończyli). Docelowo można wprowadzić ankietę satysfakcji.
*   **Retencja**: Odsetek Egzaminatorów, którzy wracają do aplikacji, aby przeprowadzić kolejny test w następnym miesiącu.

**4. Kwestie Nierozwiązane / Do Dalszej Dyskusji:**
*   Na tym etapie planowania MVP wszystkie kluczowe kwestie zostały rozwiązane. Potencjalne obszary do dyskusji w przyszłości to priorytetyzacja funkcji odłożonych na później (np. import pytań vs. podgląd testu).
</prd_planning_summary>

<unresolved_issues>
[Brak]
</unresolved_issues>
</conversation_summary>
