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
				+ "\"><img class=\"img-rounded img-flag\" src=\""
				+ languagesPath + language.icon + "\" /> "
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

		var selection = "<img class=\"img-rounded img-flag\" src=\""
			+ languagesPath + language.icon + "\" /> " + language.name + " ";

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
		"af": { name: "Afrikaans", icon: "flag-za.png" },
		"al": { name: "Albanian", icon: "flag-al.png" },
		"ar": { name: "Arabic", icon: "flag-ara.png" },
		"hy": { name: "Armenian", icon: "flag-am.png" },
		"az": { name: "Azerbaijani", icon: "flag-az.png" },
		"be": { name: "Belarusian", icon: "flag-by.png" },
		"bn": { name: "Bengali", icon: "flag-bd.png" },
		"bs": { name: "Bosnian", icon: "flag-ba.png" },
		"bg": { name: "Bulgarian", icon: "flag-bg.png" },
		"zh": { name: "Chinese", icon: "flag-cn.png" },
		"hr": { name: "Croatian", icon: "flag-hr.png" },
		"cs": { name: "Czech", icon: "flag-cz.png" },
		"da": { name: "Danish", icon: "flag-dk.png" },
		"nl": { name: "Dutch", icon: "flag-nl.png" },
		"en": { name: "English", icon: "flag-gb.png" },
		"eo": { name: "Esperanto", icon: "flag-esp.png" },
		"et": { name: "Estonian", icon: "flag-ee.png" },
		"fo": { name: "Faroese", icon: "flag-fo.png" },
		"fi": { name: "Finnish", icon: "flag-fi.png" },
		"fr": { name: "French", icon: "flag-fr.png" },
		"ka": { name: "Georgian", icon: "flag-ge.png" },
		"de": { name: "German", icon: "flag-de.png" },
		"el": { name: "Greek", icon: "flag-gr.png" },
		"he": { name: "Hebrew", icon: "flag-il.png" },
		"hi": { name: "Hindi", icon: "flag-in.png" },
		"hu": { name: "Hungarian", icon: "flag-hu.png" },
		"id": { name: "Indonesian", icon: "flag-id.png" },
		"ga": { name: "Irish", icon: "flag-ie.png" },
		"is": { name: "Icelandic", icon: "flag-is.png" },
		"it": { name: "Italian", icon: "flag-it.png" },
		"ja": { name: "Japanese", icon: "flag-jp.png" },
		"jv": { name: "Javanese", icon: "flag-id.png" },
		"kk": { name: "Kazakh", icon: "flag-kz.png" },

		// todo: finish the list

		"sk": { name: "Slovak", icon: "flag-sk.png" }
	};

})(jQuery);