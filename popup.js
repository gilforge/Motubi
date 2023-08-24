document.getElementById('highlightColor').addEventListener('change', function() {
  chrome.storage.sync.set({ highlightColor: this.value });
});

document.getElementById('dictionary').addEventListener('change', function() {
  chrome.storage.sync.set({ selectedDictionary: this.value });
});

document.getElementById('scanButton').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
      }, function() {
          chrome.tabs.sendMessage(tabs[0].id, { action: "findDuplicates" });
      });
  });
});
