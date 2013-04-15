(function($){

	var languagesPath = "/images/flags/";


	$.fn.languageDropdown = function() {
		if (arguments.length == 0) {
			// create language dropdown hosted in the given element(s)
			return this.each(function () {
    			create.call($(this));
    		});
		}
		else if (arguments.length == 1 && typeof arguments[0] == "string") {
			switch (arguments[0]) {
				case "selection":
					var iso = this.data("selected");
					if (iso in languages)
						return $.extend({}, languages[iso], { iso: iso });
					return;
			}
		}
		else if (arguments.length == 2 && typeof arguments[0] == "string") {
			switch (arguments[0]) {
				case "select":
					var iso = arguments[1];
					if (typeof iso == "string")
						select.call(this, iso);
					return;
			}
		}

		throw "invalid arguments";
	};

	function create() {
		this.html(markup);

		var lis = [];

		for (var iso in languages) {
			var language = languages[iso];

			var li = "<li><a href=\"#\" data-iso=\"" + iso
				+ "\"><i class=\"img-rounded img-flag " + language.icon + "\" /> "
				+ language.name + "</a></li>";
			lis.push(li);
		}

		this.find("ul").html(lis.join(""));

		var self = this;
		this.on("click", "ul", function (event) {
			var iso = $(event.target).data("iso");
			if (!iso) return;

			select.call(self, iso);
		});
	}

	function select(iso) {
		var language = languages[iso];
		this.attr("data-selected", iso);

		var selection = "<i class=\"img-rounded img-flag " + language.icon +  "\" /> " + language.name + " ";

		this.find("a.btn span:first").html(selection);
	}

	var markup = [
		"<div class=\"btn-group\">",
			"<a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">",
	    		"<span>Select language </span>",
	    		"<span class=\"caret\"></span>",
	  		"</a>",
	  		"<ul class=\"dropdown-menu\"></ul>",
		"</div>"
	].join("");

	// selected ISO 639-1 codes (see http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
	var languages = {
		"af": { name: "Afrikaans", icon: "flag-za" },
		"al": { name: "Albanian", icon: "flag-al" },
		"ar": { name: "Arabic", icon: "flag-ara" },
		"hy": { name: "Armenian", icon: "flag-am" },
		"az": { name: "Azerbaijani", icon: "flag-az" },
		"be": { name: "Belarusian", icon: "flag-by" },
		"bn": { name: "Bengali", icon: "flag-bd" },
		"bs": { name: "Bosnian", icon: "flag-ba" },
		"bg": { name: "Bulgarian", icon: "flag-bg" },
		"zh": { name: "Chinese", icon: "flag-cn" },
		"hr": { name: "Croatian", icon: "flag-hr" },
		"cs": { name: "Czech", icon: "flag-cz" },
		"da": { name: "Danish", icon: "flag-dk" },
		"nl": { name: "Dutch", icon: "flag-nl" },
		"en": { name: "English", icon: "flag-gb" },
		"eo": { name: "Esperanto", icon: "flag-esp" },
		"et": { name: "Estonian", icon: "flag-ee" },
		"fo": { name: "Faroese", icon: "flag-fo" },
		"fi": { name: "Finnish", icon: "flag-fi" },
		"fr": { name: "French", icon: "flag-fr" },
		"ka": { name: "Georgian", icon: "flag-ge" },
		"de": { name: "German", icon: "flag-de" },
		"el": { name: "Greek", icon: "flag-gr" },
		"he": { name: "Hebrew", icon: "flag-il" },
		"hi": { name: "Hindi", icon: "flag-in" },
		"hu": { name: "Hungarian", icon: "flag-hu" },
		"id": { name: "Indonesian", icon: "flag-id" },
		"ga": { name: "Irish", icon: "flag-ie" },
		"is": { name: "Icelandic", icon: "flag-is" },
		"it": { name: "Italian", icon: "flag-it" },
		"ja": { name: "Japanese", icon: "flag-jp" },
		"jv": { name: "Javanese", icon: "flag-id" },
		"kk": { name: "Kazakh", icon: "flag-kz" },

		// todo: finish the list

		"sk": { name: "Slovak", icon: "flag-sk" }
	};

})(jQuery);