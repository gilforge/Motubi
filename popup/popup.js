document.getElementById('scanButton').addEventListener('click', function() {
  chrome.storage.sync.get(['selectedDictionary', 'highlightColor'], function(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id }
      }, function() {
        chrome.tabs.sendMessage(tabs[0].id, { action: "findDuplicates" });
      });
    });
  });
});
