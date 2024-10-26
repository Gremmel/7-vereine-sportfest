import { readFileSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import Database from 'better-sqlite3';

// Pfad zum Verzeichnis mit den JSON-Dateien
const jsonDir = './jsonDBDateien'; // Pfad zu deinem Verzeichnis mit JSON-Dateien

// Verbindung zur SQLite-Datenbank herstellen
const dbFile = './datenbank.db';
const db = new Database(dbFile);

// Verzeichnis mit JSON-Dateien einlesen
const jsonFiles = readdirSync(jsonDir).filter(file => extname(file) === '.json');

if (jsonFiles.length === 0) {
  console.error('Keine JSON-Dateien im Verzeichnis gefunden!');
  process.exit(1);
}

// Für jede JSON-Datei eine Tabelle erstellen und die Daten einfügen
for (const file of jsonFiles) {
  const filePath = join(jsonDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  if (!data || data.length === 0) {
    console.error(`Die Datei ${file} enthält keine Daten!`);
    continue;
  }

  // Tabellenname aus Dateinamen (ohne .json) ableiten
  const tableName = basename(file, '.json');

  // Dynamisch die Spaltennamen und Typen aus der JSON-Datei extrahieren
  const columns = Object.keys(data[0]);
  const columnDefinitions = columns.map(col => `"${col}" TEXT`).join(', ');

  // Tabelle erstellen
  db.exec(`
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      ${columnDefinitions}
    );
  `);

  // Vorbereitung zum dynamischen Einfügen von Daten
  const placeholders = columns.map(col => `@${col}`).join(', ');
  const insert = db.prepare(`
    INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')})
    VALUES (${placeholders})
  `);

  // Daten aus der JSON-Datei in die Tabelle einfügen
  const insertMany = db.transaction((data) => {
    for (const item of data) {
      insert.run(item);
    }
  });

  try {
    // Transaktion ausführen
    insertMany(data);
    console.log(`Daten erfolgreich in die Tabelle ${tableName} eingefügt!`);
  } catch (error) {
    console.error(`Fehler beim Einfügen der Daten in Tabelle ${tableName}:`, error.message);
  }
}

// Datenbank schließen
db.close();
