(function($){

	var _markup = [
		"<div class=\"control-group\" data-bind=\"if: !words().length, css: validationState()\">",
			"<input data-bind=\"value: sentence, valueUpdate: 'afterkeydown'\" type=\"text\" class=\"span11\" placeholder=\"Enter the sentence and press the Return key.\" />",
		"</div>",
		"<div class=\"words\" data-bind=\"foreach: words()\">",
			"<span class=\"word\" data-bind=\"text: name, attr: { 'data-selected': selected(), 'data-index': index }\"></span>",
		"</div>",
		"<div data-bind=\"if: words().length\">",
			"<button class=\"close reset\">&times;</button>",
		"</div>"

	].join("");

	$.widget("words.sentenceEditor", {

		_create: function() {

			this.element
				.addClass("sentenceEditor")
				.append(_markup);

			this._viewModel = new ViewModel({
			});

			ko.applyBindings(this._viewModel, this.element[0]);

			this._on({ 
				"keydown input": "_onInputKeydown",
				"click .word": "_onWordClick",
				"click .reset": "_onResetClick"
			});

			this.element.find(".words").sortable();
		},

		_destroy: function() {
			ko.cleanNode(this.element[0]);
			this.element.empty().removeClass("sentenceEditor");
		},

		_onInputKeydown: function(evt) {

			this._viewModel.validationState("");

			if (evt.which == 13) {

				var sentence = this._viewModel.sentence();

				var words = this._parseSentence(sentence);
				if (words.length == 0) {
					this._viewModel.validationState("error");
					return;
				}

				var vm = this._viewModel;
				words.map(function (word, index) {
					vm.words.push({ 
						name: word,
						index: index,
						selected: ko.observable(false)
					});
				});
			}
		},

		_onWordClick: function(evt) {
			var $word = $(evt.target),
				index = $word.data("index"),
				word = this._viewModel.words()[index];

			var selected = !word.selected();
			word.selected(selected);
		},

		_onResetClick: function(evt) {
			this._viewModel.words.removeAll();
		},

		_parseSentence: function(sentence) {
			if (!sentence)
				return [];
			return sentence.split(" ");
		}
	});

	function ViewModel(o) {
		$.extend(this, {
			sentence: ko.observable(""),
			validationState: ko.observable(),
			words: ko.observableArray()
		})
	}

})(jQuery);