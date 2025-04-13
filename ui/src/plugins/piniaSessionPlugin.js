export function createSessionStoragePlugin(secretKey) {
  const encrypt = async (data) => {
    const encodedData = new TextEncoder().encode(data);
    const encodedKey = new TextEncoder().encode(secretKey).slice(0, 16); // 16 Bytes für AES
    const iv = crypto.getRandomValues(new Uint8Array(16)); // Initialisierungsvektor
    const key = await crypto.subtle.importKey(
      "raw",
      encodedKey,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      encodedData
    );
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
  };

  const decrypt = async (encrypted) => {
    const { iv, data } = encrypted;
    const encodedKey = new TextEncoder().encode(secretKey).slice(0, 16);
    const key = await crypto.subtle.importKey(
      "raw",
      encodedKey,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    );
    return new TextDecoder().decode(decrypted);
  };

  return async (context) => {
    const { store } = context;

    // Store initialisieren: Daten aus sessionStorage laden
    const storedData = sessionStorage.getItem(store.$id);
    if (storedData) {
      try {
        const decryptedData = await decrypt(JSON.parse(storedData));
        store.$patch(JSON.parse(decryptedData));
      } catch (error) {
        console.error("Fehler beim Entschlüsseln der Daten", error);
      }
    }

    // Speichern bei Änderungen
    store.$subscribe(async (mutation, state) => {
      try {
        const encrypted = await encrypt(JSON.stringify(state));
        sessionStorage.setItem(store.$id, JSON.stringify(encrypted));
      } catch (error) {
        console.error("Fehler beim Verschlüsseln der Daten", error);
      }
    });
  };
}