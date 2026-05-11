# Bilderplan-Software für Formationen

Mit dieser Software kann man eine Webseite hosten, die zur Verwaltung eines Bilderplans dient.
Sie unterstützt derzeit keine Benutzerverwaltung. D.h. jeder der den Link hat, kann den Plan sehen und bearbeiten.
Personen mit zugang zur Datenbank können jedoch jederzeit auf frühere Versionen zurückwechseln


## Setup
Man benötigt eine SQL-DB(Am besten MySQL) und einen PHP-fähigen Webspace.
Beides kann man z.b. auf lima-city kostenlos erhalten

### Schritt 1:
Datenbank aufsetzen:
Es wird eine MySQL-Datenbank benötigt.
Die Datei Init.sql erstellt die benötigte Tabelle mit einem initialen Datensatz
Wenn man andere Datenbanken wie PostGre, Oracle o.Ä. verwenden möchte muss man diese Befehle sowie die Schnittstelle(Siehe Schritt 2) anpassen.

### Schritt 2:
Schnittstelle zur Datenbank.
Sofern man eine MySQL-DB verwendet, kann man die sql.php Datei als Schnittstelle verwenden.
Einfach die Datei auf einem erreichbaren Webspace hochladen. 
Wenn man eine andere DB verwendet, muss man eine Schnittstelle bauen, die genauso funktioniert.
Als test kann man die url mit dem Parameter f=formationBilder aufrufen, also zb https://example-url.de/sql.php?f=formationBilder
Das sollte dann ungefähr so ein ergebnis liefern:
{"success":true,"data":{"id":"1","pairs":8,"bilder":["id": 0, {"point": "", "title": "Start", "leaders": [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]}],"saved":"2025-08-12 13:50:27","team":""}}

### Schritt 3:
Die eigentliche Seite hosten.
Hier gibt es 2 Möglichkeiten:
1. man nimmt die fertige Seite aus dem Ordner "build" und lädt sie auf seinen Webspace hoch.
Dabei muss unbedingt die config.js angepasst werden und der link zu der Schnittstelle aus Schritt 2 eingefügt werden.(die beiden // in Zeile 4 entfernen und die url anpassen)

2. (für Entwickler) das repository branchen und selbst bauen. Dann kann man auch eigene Änderungen vornehmen.
Auch hier muss die config.js wie oben angepasst werden, allerdings die im Ordner public.
Aktuell ist der Code noch nicht wirklich dokumentiert und wahrscheinlich etwas unübersichtlich.
Wahrscheinlich werde ich das noch nachtragen


## Verwaltung

### Mehrere Teams
Man kann mit einer Datenbank mehrere Teams verwalten.
Um ein neues Team anzulegen einfach den Folgenden SQL ausführen (das A am Anfang steht zb für A-Team, die 8 danach für die Anzahl Paare. bei weniger Paare müssen entsprechend viele Punkte ([0, 0]) entfernt werden)

Beispiel A-team mit 8 Paaren
INSERT INTO `Formation_Bilder` (`team`, `pairs`, `bilder`) VALUES
('A', 8, 0, '[{\"id\": 0, \"point\": \"\", \"title\": \"Gong\", \"leaders\": [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]}]');

Beispiel B-Team mit 6 Paaren
INSERT INTO `Formation_Bilder` (`team`, `pairs`, `bilder`) VALUES
('B', 6, 0, '[{\"id\": 0, \"point\": \"\", \"title\": \"Gong\", \"leaders\": [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]}]');

Die Url für das A-Team lautet dann zb https://example-url.de/#/A


### Frühere Version wiederherstellen / Bilderplan kopieren
Die DB-Tabelle erstellt bei jeder Änderung einen neuen Eintrag der den aktuellen Plan enthält.
Verwendet wird immer das neueste (nach der Spalte 'saved').
Umn also eine frühere Version wiederherzustellen oder zb den Plan von einem anderen Team zu kopieren muss der entsprechende Eintrag kopiert werden und mit einem aktuellen Datum versehen werden.

### Bestehenden Bilderplan übernehemen (JSON-Kenntnisse erforderlich)
Falls man schon einen fertigen Bilderplan hat und die Möglichkeit hat, daraus ein JSON zu erstellen, kann man das natürlich auch direkt eintragen. Dazu muss es wiefolgt aussehen:
Ein JSON-Array mit einem Objekt pro Bild, welches die folgenden Attribute hat:
  id: (Zahl) eine eindeutige id innerhalb des Plans, am besten einfach eine fortlaufende nummer
  point: (Text) kurzer Text, was den Punkt definiert. Zb "Herr rechter Fuß"
  title: (Text) Überschrift für das Bild, wird auch in der Tabelle angezeigt. Sollte beinhalten welche Stelle der Choreo dieses Bild definiert
  leaders: (Array) eine Array von Punkten [x,y] welche die Positionen der Paare oder der Leader(bei getrennten Punkten) darstellt sortiert nach Position
  follower (nur bei getrennten punkten): Punkte der follower analog zu leader
Beispiel: siehe die beiden INSERT-Befehle oben
  
