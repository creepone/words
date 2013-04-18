(function($){

	var _markup = [
		"<a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">",
    		"<span>",
    			"<i class=\"img-rounded img-flag\" data-bind=\"css: icon()\" />",
    			"<span data-bind=\"text: name()\"></span>",
    		"</span>",
    		"<span> </span>",
    		"<span class=\"caret\"></span>",
  		"</a>",
  		"<ul class=\"dropdown-menu\" data-bind=\"foreach: languages\">",
  			"<li>",
  				"<a href=\"#\" data-bind=\"attr: { 'data-iso': iso }, click: onItemClick\">",
  					"<i class=\"img-rounded img-flag\" data-bind=\"css: icon\" />",
  					"<span data-bind=\"text: name\"></span>",
  				"</a>",
  			"</li>",
  		"</ul>"
	].join("");

	$.widget("words.languageDropdown", {

		_create: function() {

			this.element
				.addClass("btn-group")
				.append(_markup);

			this._viewModel = new ViewModel({
				iso: this.options.iso,
				onItemClick: this._onItemClick.bind(this)
			});

			ko.applyBindings(this._viewModel, this.element[0]);
		},

		_destroy: function() {
			ko.cleanNode(this.element[0]);
			this.element.empty().removeClass("btn-group");
		},

		_onItemClick: function() {

			var iso = $(event.target).closest("[data-iso]").data("iso");
			if (!iso) 
				return;

			this.select(iso);
		},

		select: function(iso) {

			if (!iso) {
				if (!this._viewModel.iso)
					return null;

				return { 
					iso: this._viewModel.iso,
					name: this._viewModel.name()
				};
			}

			this._viewModel.selectLanguage(iso);
		}
	});

	function ViewModel(o) {

		$.extend(this, {
			languages: [],
			icon: ko.observable(),
			name: ko.observable("Select language")
		});

		if (o.iso) 
			this.selectLanguage(o.iso);

		for (var iso in languages) {
			this.languages.push($.extend({}, languages[iso], {
				iso: iso,
				onItemClick: o.onItemClick
			}));
		}
	}

	$.extend(ViewModel.prototype, {

		selectLanguage: function(iso) {

			var lang = languages[iso];
			this.iso = iso;
			this.icon(lang.icon);
			this.name(lang.name);
		}
	});

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
		"ky": { name: "Kyrgyz", icon: "flag-kg" },
		"ko": { name: "Korean", icon: "flag-kr" },
		"la": { name: "Latin", icon: "flag-va" },
		"lb": { name: "Luxembourgish", icon: "flag-lu" },
		"lt": { name: "Lithuanian", icon: "flag-lt" },
		"lv": { name: "Latvian", icon: "flag-lv" },
		"mk": { name: "Macedonian", icon: "flag-mk" },
		"ms": { name: "Malay", icon: "flag-my" },
		"mt": { name: "Maltese", icon: "flag-mt" },
		"mn": { name: "Mongolian", icon: "flag-mn" },
		"ne": { name: "Nepali", icon: "flag-np" },
		"no": { name: "Norwegian", icon: "flag-no" },
		"fa": { name: "Persian", icon: "flag-ir" },
		"pl": { name: "Polish", icon: "flag-pl" },
		"pt": { name: "Portuguese", icon: "flag-pt" },
		"ro": { name: "Romanian", icon: "flag-ro" },
		"ru": { name: "Russian", icon: "flag-ru" },
		"sr": { name: "Serbian", icon: "flag-rs" },
		"sk": { name: "Slovak", icon: "flag-sk" },
		"sl": { name: "Slovene", icon: "flag-si" },
		"es": { name: "Spanish", icon: "flag-es" },
		"sv": { name: "Swedish", icon: "flag-se" },
		"tg": { name: "Tajik", icon: "flag-tj" },
		"th": { name: "Thai", icon: "flag-th" },
		"tk": { name: "Turkmen", icon: "flag-tm" },
		"tr": { name: "Turkish", icon: "flag-tr" },
		"uk": { name: "Ukrainian", icon: "flag-ua" },
		"uz": { name: "Uzbek", icon: "flag-uz" },
		"vi": { name: "Vietnamese", icon: "flag-vn" }
	};

})(jQuery);