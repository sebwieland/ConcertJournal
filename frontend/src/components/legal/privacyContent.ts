// Privacy policy text (GDPR Art. 13). Every statement here describes an
// actual data flow in this codebase — when a flow changes (new cookie, new
// third-party call, logging, analytics), update BOTH languages and the date.

export type Language = "de" | "en";

/** A paragraph, or a bullet list when given as an array. */
export type Block = string | string[];

export interface PrivacySection {
  heading: string;
  blocks: Block[];
}

export interface PrivacyContent {
  title: string;
  updated: string;
  sections: PrivacySection[];
}

export const CONTROLLER_NAME = "Sebastian Wieland";
export const CONTACT_EMAIL = "webmaster@concertjournal.de";

export const privacyContent: Record<Language, PrivacyContent> = {
  de: {
    title: "Datenschutzerklärung",
    updated: "Stand: 23. Oktober 2026",
    sections: [
      {
        heading: "1. Verantwortlicher",
        blocks: [
          "Verantwortlich für die Datenverarbeitung auf concertjournal.de ist:",
          `${CONTROLLER_NAME}, E-Mail: ${CONTACT_EMAIL}`,
          "Concert Journal ist ein privates, nicht-kommerzielles Projekt ohne Werbung und ohne kostenpflichtige Funktionen.",
        ],
      },
      {
        heading: "2. Hosting und Sicherheit",
        blocks: [
          "Website und Datenbank laufen auf einem von mir selbst betriebenen Server; ein externer Hosting-Dienstleister ist nicht beteiligt. Die Verbindung ist per TLS (HTTPS) verschlüsselt. Passwörter werden ausschließlich als bcrypt-Hash gespeichert, nie im Klartext.",
        ],
      },
      {
        heading: "3. Zugriffsdaten und Missbrauchsschutz",
        blocks: [
          "Beim Aufruf der Website verarbeitet der Server technisch bedingt Ihre IP-Adresse, Datum und Uhrzeit, die aufgerufene Adresse sowie Browser-Informationen. Soweit diese Daten in Server-Protokollen gespeichert werden, dienen sie ausschließlich dem sicheren Betrieb und der Fehleranalyse und werden spätestens nach 14 Tagen gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.",
          "Zum Schutz vor Missbrauch wird die Zahl der Anfragen pro Minute begrenzt. Dafür wird Ihre IP-Adresse kurzzeitig im Arbeitsspeicher des Servers verarbeitet, nicht dauerhaft gespeichert und in der Regel nach wenigen Minuten verworfen. Rechtsgrundlage ist mein berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).",
        ],
      },
      {
        heading: "4. Benutzerkonto und Konzerttagebuch",
        blocks: [
          "Wenn Sie ein Konto anlegen und die App nutzen, werden folgende Daten gespeichert:",
          [
            "E-Mail-Adresse",
            "Vor- und Nachname",
            "Passwort (nur als Hash)",
            "Ihre Tagebucheinträge: Band, Ort, Datum, Bewertung und Kommentar",
            "Zeitpunkte der Erstellung und Änderung",
          ],
          "Der im Registrierungsformular abgefragte Benutzername wird nicht gespeichert.",
          "Zweck ist die Bereitstellung Ihres Kontos und Ihres Konzerttagebuchs; Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Nutzungsvertrag). Ihre Einträge sind nur für Sie sichtbar und werden nicht an Dritte weitergegeben.",
          "Die Daten werden gespeichert, bis Sie Ihr Konto löschen. Das können Sie jederzeit selbst unter „Settings“ tun; dabei werden Ihr Konto und alle Einträge sofort gelöscht. Sofern Sicherungskopien des Servers bestehen, werden die Daten dort mit dem regelmäßigen Überschreiben der Sicherungen entfernt.",
        ],
      },
      {
        heading: "5. Cookies und lokale Speicherung",
        blocks: [
          "Es werden ausschließlich technisch notwendige Cookies verwendet, keine Tracking- oder Werbe-Cookies:",
          [
            "refreshToken – hält Sie angemeldet; Laufzeit 30 Tage, wird beim Abmelden oder Löschen des Kontos entfernt",
            "XSRF-TOKEN – Schutz vor Cross-Site-Request-Forgery; Laufzeit 30 Tage",
            "JSESSIONID – technische Sitzungskennung des Servers; wird beim Schließen des Browsers gelöscht",
          ],
          "Außerdem speichert Ihr Browser lokal (Local Storage) Ihre Anzeigeeinstellungen: helles oder dunkles Design und die Sortierung des Tagebuchs. Diese Angaben verlassen Ihr Gerät nicht.",
          "Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG: Die Speicherung ist für den von Ihnen gewünschten Dienst unbedingt erforderlich, eine Einwilligung ist daher nicht notwendig.",
        ],
      },
      {
        heading: "6. MusicBrainz (Künstlervorschläge)",
        blocks: [
          "Wenn Sie im Eintragsformular einen Bandnamen eingeben, schlägt die App passende Künstler vor und zeigt Angaben wie Genre, Herkunftsland und Gründungsjahr an. Dazu sendet Ihr Browser den eingegebenen Bandnamen direkt an die öffentliche Schnittstelle von MusicBrainz (musicbrainz.org), betrieben von der MetaBrainz Foundation Inc. in den USA.",
          "Dabei werden technisch bedingt Ihre IP-Adresse und Informationen über Ihren Browser an MetaBrainz übermittelt. Ihre Kontodaten und Ihre übrigen Tagebucheinträge werden nicht übertragen.",
          "Rechtsgrundlage ist mein berechtigtes Interesse an einer komfortablen und korrekten Eingabe (Art. 6 Abs. 1 lit. f DSGVO). Die Übermittlung erfolgt in die USA, für die möglicherweise kein der EU vergleichbares Datenschutzniveau besteht. Informationen zum Datenschutz bei MetaBrainz: https://metabrainz.org/privacy",
        ],
      },
      {
        heading: "7. Keine Analyse- und Trackingdienste",
        blocks: [
          "Es werden keine Analyse- oder Trackingdienste, keine Werbung, keine Social-Media-Plugins, keine externen Schriftarten und keine Content-Delivery-Netzwerke eingesetzt. Alle Dateien der Website, einschließlich der Schriftarten, werden vom eigenen Server ausgeliefert.",
        ],
      },
      {
        heading: "8. Ihre Rechte",
        blocks: [
          "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Verarbeitungen auf Grundlage berechtigter Interessen können Sie widersprechen (Art. 21).",
          `Eine Kopie Ihrer Daten (Export) und die Löschung Ihres Kontos können Sie jederzeit selbst unter „Settings“ veranlassen. Für alle anderen Anliegen schreiben Sie an ${CONTACT_EMAIL}.`,
          "Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO), insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.",
        ],
      },
      {
        heading: "9. Weitere Hinweise",
        blocks: [
          "Die Angabe von E-Mail-Adresse und Passwort ist für die Nutzung erforderlich; ohne sie kann kein Konto angelegt werden. Eine automatisierte Entscheidungsfindung einschließlich Profiling (Art. 22 DSGVO) findet nicht statt.",
          "Diese Erklärung wird angepasst, wenn sich die Website oder die Datenverarbeitung ändert.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: 23 October 2026",
    sections: [
      {
        heading: "1. Controller",
        blocks: [
          "The controller responsible for data processing on concertjournal.de is:",
          `${CONTROLLER_NAME}, email: ${CONTACT_EMAIL}`,
          "Concert Journal is a private, non-commercial project with no advertising and no paid features.",
        ],
      },
      {
        heading: "2. Hosting and security",
        blocks: [
          "The website and its database run on a server I operate myself; no external hosting provider is involved. Connections are encrypted with TLS (HTTPS). Passwords are stored only as bcrypt hashes, never in plain text.",
        ],
      },
      {
        heading: "3. Access data and abuse protection",
        blocks: [
          "When you visit the website, the server technically processes your IP address, date and time, the requested address and browser information. Insofar as this data is stored in server logs, it is used solely for secure operation and troubleshooting and deleted after 14 days at the latest. The legal basis is Art. 6(1)(f) GDPR.",
          "To protect against abuse, the number of requests per minute is limited. For this, your IP address is processed briefly in the server's memory, not stored permanently, and usually discarded within a few minutes. The legal basis is my legitimate interest in secure operation (Art. 6(1)(f) GDPR).",
        ],
      },
      {
        heading: "4. User account and concert journal",
        blocks: [
          "When you create an account and use the app, the following data is stored:",
          [
            "Email address",
            "First and last name",
            "Password (as a hash only)",
            "Your journal entries: band, venue, date, rating and comment",
            "Creation and modification timestamps",
          ],
          "The username requested in the sign-up form is not stored.",
          "The purpose is to provide your account and your concert journal; the legal basis is Art. 6(1)(b) GDPR (terms of use). Your entries are visible only to you and are not shared with third parties.",
          "Your data is kept until you delete your account. You can do this yourself at any time under “Settings”, which deletes your account and all entries immediately. If server backups exist, the data is removed from them when the backups are routinely overwritten.",
        ],
      },
      {
        heading: "5. Cookies and local storage",
        blocks: [
          "Only technically necessary cookies are used — no tracking or advertising cookies:",
          [
            "refreshToken – keeps you signed in; expires after 30 days and is removed when you sign out or delete your account",
            "XSRF-TOKEN – protection against cross-site request forgery; expires after 30 days",
            "JSESSIONID – technical session identifier of the server; deleted when you close the browser",
          ],
          "In addition, your browser stores your display preferences locally (local storage): light or dark theme and the journal's sort order. This information never leaves your device.",
          "The legal basis is Section 25(2)(2) TDDDG (German Telecommunications Digital Services Data Protection Act): storage is strictly necessary for the service you requested, so no consent is required.",
        ],
      },
      {
        heading: "6. MusicBrainz (artist suggestions)",
        blocks: [
          "When you type a band name in the entry form, the app suggests matching artists and shows details such as genre, country of origin and year of formation. For this, your browser sends the band name you typed directly to the public MusicBrainz API (musicbrainz.org), operated by the MetaBrainz Foundation Inc. in the USA.",
          "For technical reasons, your IP address and information about your browser are transmitted to MetaBrainz in the process. Your account data and your other journal entries are not transmitted.",
          "The legal basis is my legitimate interest in convenient and accurate data entry (Art. 6(1)(f) GDPR). The data is transferred to the USA, which may not offer a level of data protection comparable to the EU. MetaBrainz privacy information: https://metabrainz.org/privacy",
        ],
      },
      {
        heading: "7. No analytics or tracking",
        blocks: [
          "No analytics or tracking services, advertising, social media plugins, external fonts or content delivery networks are used. All website files, including fonts, are served from my own server.",
        ],
      },
      {
        heading: "8. Your rights",
        blocks: [
          "You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18) and data portability (Art. 20). You may object to processing based on legitimate interests (Art. 21).",
          `You can export a copy of your data and delete your account yourself at any time under “Settings”. For anything else, write to ${CONTACT_EMAIL}.`,
          "You also have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR), in particular in the member state of your habitual residence, place of work or place of the alleged infringement.",
        ],
      },
      {
        heading: "9. Further information",
        blocks: [
          "Providing an email address and password is required to use the app; without them no account can be created. No automated decision-making, including profiling (Art. 22 GDPR), takes place.",
          "This policy will be updated when the website or its data processing changes.",
        ],
      },
    ],
  },
};
