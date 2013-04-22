(function () {
	
	$(function() {	
		var count = 2;
		if (window.localStorage)
			count = window.localStorage["index/languageCount"] || 2;

		for (var i = 0; i < count; i++)
			addLanguage();

		$("#addLanguage").click(addLanguage);
		$("#submit").click(submit);
	});


	function addLanguage() {
		var $container = $("#sentences")
		var $languageDropdown = $("<span>").appendTo($container);
		var $sentenceEditor = $("<div>").appendTo($container);

		var iso, index = $(".languageDropdown").length;
		if (window.localStorage) {
			iso = window.localStorage["index/language/" + index];
		}

		$languageDropdown.languageDropdown({ iso: iso });
		$sentenceEditor.sentenceEditor({
			cancel: function() {
				$languageDropdown.fadeOut("fast", function() { $(this).remove(); });
				$sentenceEditor.fadeOut("fast", function() { $(this).remove(); });
			}
		});
	}

	function submit() {
		if (window.localStorage) {
			var $dropdowns = $(".languageDropdown");
			$dropdowns.each(function (index) {
				var selection = $(this).languageDropdown("select");
				if (selection)
					window.localStorage["index/language/" + index] =  selection.iso;
			});

			window.localStorage["index/languageCount"] = $dropdowns.length;
		}

		var data = [], valid = true;

		$(".sentenceEditor").each(function (index) {
			if (!$(this).sentenceEditor("validate")) {
				valid = false;
				return;
			}

			data[index] = $(this).sentenceEditor("model");
		});

		$(".languageDropdown").each(function (index) {
			if (!$(this).languageDropdown("validate")) {
				valid = false;
				return;
			}

			var language = $(this).languageDropdown("select");

			$.extend(data[index], {
				language: language.iso
			});
		});

		// todo: actual call to the service passing "data"
		console.log(data);
	}
	
}());