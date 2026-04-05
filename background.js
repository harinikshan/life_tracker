chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["setupComplete"], (data) => {
    if (!data.setupComplete) {
      chrome.storage.sync.set({
        birthDate: null,
        expectedLifespan: 80,
        widgetVisible: true,
        setupComplete: false
      });
    }
  });
});
