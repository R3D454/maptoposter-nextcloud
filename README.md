# MapToPoster für Nextcloud

Mit **MapToPoster** gestaltest du Kartenposter und speicherst sie als PNG in deinem persönlichen Nextcloud-Ordner **Poster**. Auf dem Desktop steht **In Nextcloud speichern** über dem PNG-Download. Auf dem Smartphone findest du die Aktion unter **Ausgabe**. Beim ersten Speichern legt die App den Ordner an. Die Erfolgsmeldung verlinkt die Datei. Der PNG-Download steht separat zur Verfügung.

## Installation

Das gebaute Paket liegt in `dist/maptoposter.tar.gz`. Es enthält die PHP-App, den gebündelten Editor und die Schriften. Auf dem Nextcloud-Server genügen diese Schritte (Beispiel für das offizielle Docker-Image, mit dem App-Archiv im aktuellen Verzeichnis):

```sh
tar -xzf maptoposter.tar.gz -C /var/www/html/custom_apps
php /var/www/html/occ app:enable maptoposter
```

Die erste Zeile mit Schreibrechten für das App-Verzeichnis, die zweite als Webserver-Benutzer ausführen. Das Paket lässt sich auf Nextcloud 32 bis 35 aktivieren. Das Speichern mit einem normalen Benutzerkonto wurde auf Nextcloud 32.0.15 in der Desktop- und Mobilansicht und auf Nextcloud 35.0.3 in der Desktopansicht geprüft. Nach dem Aktivieren erscheint **MapToPoster** in der Hauptnavigation.

## Aus dem Quellcode bauen

Mit einer aktuellen Node.js-LTS-Version und npm im Projektverzeichnis:

```sh
npm ci
npm test
npm run build
```

Der Build erzeugt auch den entpackten App-Ordner `dist/maptoposter/`. Node.js wird nur beim Bauen benötigt.

## Karte und Speicherung

Die Standardkarte nutzt OpenStreetMap. Die Ortssuche sendet eine Anfrage an Nominatim, wenn du **Suchen** oder die Eingabetaste drückst. Die übrigen Kartenstile und die Routenfunktion verwenden je nach Auswahl OpenFreeMap, CARTO, Esri und OSRM. Die Browser der Benutzer benötigen Zugang zu den gewählten Diensten. Für die CARTO-Stile den öffentlichen Kartenschlüssel vor dem Build als `VITE_CARTO_API_KEY` in einer lokalen `.env` setzen. Im Browser sichtbare Kartenschlüssel beim Anbieter auf die eigene Domain beschränken.

Das fertige PNG geht per WebDAV mit der aktiven Nextcloud-Sitzung in den Ordner `Poster`. Bei Namenskonflikten legt die App eine weitere Datei an. Das Konto benötigt Schreibrechte und genügend Speicherplatz. Der Editor speichert seine Einstellungen pro Nextcloud-Konto im Browser. Der Renderer begrenzt sehr große Ausgaben auf rund 16,8 Megapixel.

Der Editor basiert auf [dimartarmizi/map-to-poster](https://github.com/dimartarmizi/map-to-poster/tree/47e646df23171d836beda4ab061f0cc4875334c0). Die MIT-Lizenz liegt in `LICENSE`. Das Installationspaket enthält weitere Lizenztexte unter `licenses/`.
