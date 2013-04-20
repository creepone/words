(function($){

	var _markup = [
		"<span class=\"letters\" data-bind=\"foreach: letters\">",
			"<span class=\"letter\" data-bind=\"text: $data, attr: { 'data-index': $index }\"></span>",
		"</span>"
	].join("");

	$.widget("words.wordEditor", {

		_create: function() {

			this.element
				.addClass("wordEditor")
				.append(_markup);

			this._viewModel = new ViewModel({
				word: this.options.word || ""
			});

			ko.applyBindings(this._viewModel, this.element[0]);

			this.element.find(".letters")
				.bind("mousedown", function (e) {
					e.metaKey = false;
					e.ctrlKey = false;
				}).selectable();
		},

		_destroy: function() {
			ko.cleanNode(this.element[0]);
			this.element.empty().removeClass("wordEditor");
		},

		select: function() {
			var startIndex = this.element.find(".letter.ui-selected:first").data("index");
			var endIndex = this.element.find(".letter.ui-selected:last").data("index");

			if (startIndex === null || endIndex === null)
				return null;
			
			return {
				start: Math.min(startIndex),
				length: Math.abs(endIndex - startIndex) + 1
			};
		}
	});

	function ViewModel(o) {
		this.letters = o.word.split("");
	}

})(jQuery);