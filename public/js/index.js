(function () {
	
	$(function() {		

		$("#firstLanguage,#secondLanguage").languageDropdown();

		$("#firstSentence,#secondSentence").sentenceEditor();


		$("#word").wordEditor({ word: "Schnellverbindungsplan"});

	});
	
}());