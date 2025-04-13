export function createSessionStoragePlugin() {
  return (context) => {
    const { store } = context;

    // Store initialisieren: Daten aus sessionStorage laden
    const storedData = sessionStorage.getItem(store.$id);
    if (storedData) {
      store.$patch(JSON.parse(storedData));
    }

    // Speichern bei Änderungen
    store.$subscribe((mutation, state) => {
      sessionStorage.setItem(store.$id, JSON.stringify(state));
    });
  };
}
