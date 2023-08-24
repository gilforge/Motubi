chrome.storage.sync.get(['selectedDictionary', 'highlightColor'], function(data) {
  var selectedDictionary = data.selectedDictionary || 'french'; // valeur par défaut
  var highlightColor = data.highlightColor || 'yellow'; // valeur par défaut

  // URL du dictionnaire sur GitHub
  var dictionaryUrl = `https://raw.githubusercontent.com/yourusername/yourrepository/main/${selectedDictionary}.json`;

  fetch(dictionaryUrl)
      .then(response => response.json())
      .then(dictionary => {
          // Utilisez le dictionnaire chargé pour la mise en évidence
          highlightDuplicates(highlightColor, dictionary);
      })
      .catch(error => {
          console.error('Erreur lors du chargement du dictionnaire:', error);
      });
});

function findDuplicates() {
  var allWords = document.body.innerText.split(/\s+/);
  var duplicates = {};

  allWords.forEach(function(word) {
      word = word.toLowerCase().replace(/[.,!?]/g, '');
      if (word.length > 0) {
          duplicates[word] = (duplicates[word] || 0) + 1;
      }
  });

  for (var word in duplicates) {
      if (duplicates[word] > 1) {
          highlightDuplicates(word);
      }
  }
}

function highlightDuplicates(word) {
  var excludeWords = dictionary.excludeWords || [];
  // var excludeWords = ["le", "la", "les", "un", "une", "de", "des", "es", "est", "et", "à", "a"];
  if (excludeWords.includes(word.toLowerCase())) return;

  // Ignorer les mots d'une seule lettre ou les chiffres
  if (word.length <= 1 || !isNaN(word)) return;

  var escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var re = new RegExp('\\b(' + escapedWord + ')\\b', 'gi');

  function shouldIgnoreNode(node) {
    var currentNode = node;
    while (currentNode && currentNode.parentNode && currentNode.parentNode.nodeName !== 'BODY') {
        var parentNodeName = currentNode.parentNode.nodeName.toLowerCase();
        if (parentNodeName === 'script' ||
            parentNodeName === 'noscript' ||
            parentNodeName === 'style' ||
            parentNodeName === 'nav' ||
            parentNodeName === 'a' ||
            parentNodeName === 'ul' ||
            parentNodeName === 'button') {
            return true; // Ignorer si l'un des ancêtres est l'une de ces balises
        }
        currentNode = currentNode.parentNode;
    }
    return false;
}

  function replaceInNode(node) {
      if (node.nodeType === Node.TEXT_NODE && !shouldIgnoreNode(node)) {
          var newNode = node;
          var match;
          while ((match = re.exec(node.textContent)) !== null) {
              var before = node.textContent.slice(0, match.index);
              var matchedWord = match[0];
              var after = node.textContent.slice(match.index + matchedWord.length);

              if (before) {
                  newNode.parentNode.insertBefore(document.createTextNode(before), newNode);
              }

              var span = document.createElement('span');
              span.style.backgroundColor = 'yellow'; // Appliquer le style directement
              span.textContent = matchedWord;
              newNode.parentNode.insertBefore(span, newNode);

              newNode.textContent = after;
              re.lastIndex = 0;
          }
      } else {
          for (var i = 0; i < node.childNodes.length; i++) {
              replaceInNode(node.childNodes[i]);
          }
      }
  }

  replaceInNode(document.body);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "findDuplicates") {
      findDuplicates();
  }
});
