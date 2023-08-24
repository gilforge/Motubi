document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('highlightColor', function(data) {
    if (data.highlightColor) {
      document.getElementById('highlightColor').value = data.highlightColor;
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('selectedDictionary', function(data) {
    if (data.selectedDictionary) {
      document.getElementById('dictionary').value = data.selectedDictionary;
    }
  });
});

document.getElementById('highlightColor').addEventListener('change', function() {
  chrome.storage.sync.set({ highlightColor: this.value });
});

document.getElementById('dictionary').addEventListener('change', function() {
  chrome.storage.sync.set({ selectedDictionary: this.value });
});

document.getElementById('scanButton').addEventListener('click', function() {
  chrome.storage.sync.get(['selectedDictionary', 'highlightColor'], function(data) {

    var highlightColor = document.getElementById('highlightColor').value;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js'] // Assurez-vous que le chemin vers content.js est correct
      }, function() {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "findDuplicates",
          data: {
            selectedDictionary: data.selectedDictionary || 'pronoms_courants.json',
            highlightColor: data.highlightColor || 'yellow'
          }
        });
      });
    });
  });
});