(function($){

	var _markup = [
		"<div data-bind=\"if: words().length\">",
			"<button class=\"close reset\"><i class=\"icon-repeat\"></i></button>",
		"</div>",
		
		"<div class=\"control-group\" data-bind=\"if: !words().length, css: validationState()\">",
			"<input data-bind=\"value: sentence, valueUpdate: 'afterkeydown'\" type=\"text\" class=\"span11\" placeholder=\"Enter the sentence and press the Return key.\" />",
		"</div>",
		
		"<div class=\"words\" data-bind=\"foreach: words()\">",
			"<span class=\"word\" data-bind=\"text: text, attr: { 'data-selected': selected(), 'data-index': $index }\"></span>",
		"</div>",

		"<div data-bind=\"if: selection().length > 1\">",
			"<button class=\"btn btn-mini merge\">Merge</button>",
		"</div>",

		"<div data-bind=\"if: selection().length == 1\">",
			"<button class=\"btn btn-mini split\">Split</button>",
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
				"click .reset": "_onResetClick",
				"click .merge": "_onMergeClick"
			});

			this.element.find(".words"); //.sortable();
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
				words.map(function (word) {
					vm.words.push($.extend(word, {
						selected: ko.observable(false)
					}));
				});
			}
		},

		_onWordClick: function(evt) {
			var index = $(evt.target).attr("data-index"),
				word = this._viewModel.words()[index];

			this._viewModel.toggleSelect(word);
		},

		_onResetClick: function(evt) {
			this._viewModel.words.removeAll();
			this._viewModel.selection.removeAll();
		},

		_onMergeClick: function(evt) {
			var vm = this._viewModel,
				words = vm.selection();

			// the index of the first word in the selection (= place to insert the result)
			var index = Math.min.apply(null, words.map(function (w) { return vm.words.indexOf(w); }));

			var singleWords = [].concat.apply([], words.map(function (w) { return w.words || [w]; }));

			// sort the words by their natural order in the sentence
			singleWords.sort(function (w1, w2) { return w1.occurences[0].start - w2.occurences[0].start });

			var mergedWord = {
				text: singleWords.map(function (w) { return w.text }).join(" "),
				occurences: [].concat.apply([], singleWords.map(function (w) { return w.occurences; })),
				words: singleWords,
				selected: ko.observable(true)
			};

			this._viewModel.words.removeAll(words);
			this._viewModel.selection.removeAll(words);

			this._viewModel.words.splice(index, 0, mergedWord);
			this._viewModel.selection.push(mergedWord);
		},

		_parseSentence: function(sentence) {
			if (!sentence)
				return [];

			var split = function(str, delim) {
 				var ret = [];
 				var splits = str.split(delim);
 				var index = 0;
 				for (var i = 0; i < splits.length; i++) {
 					ret.push({ 
 						text: splits[i],
 						occurences: [{
 							start: index,
 							length: splits[i].length
 						}]
 					});
  					index += splits[i].length + delim.length;
 				}
				return ret;
			};

			return split(sentence, " ");
		}
	});

	function ViewModel(o) {
		$.extend(this, {
			sentence: ko.observable(""),
			validationState: ko.observable(),
			words: ko.observableArray(),
			selection: ko.observableArray()
		})
	}

	$.extend(ViewModel.prototype, {

		toggleSelect: function(word) {
			if (word.selected()) {
				word.selected(false);
				this.selection.remove(word);
			}
			else {
				word.selected(true);
				this.selection.push(word);
			}
		}
	});

})(jQuery);