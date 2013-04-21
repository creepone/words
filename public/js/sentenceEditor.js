(function($){

	var _markup = [
		"<div data-bind=\"if: words().length\">",
			"<button class=\"close reset\"><i class=\"icon-repeat\"></i></button>",
		"</div>",
		
		"<div class=\"control-group sentence\" data-bind=\"if: !words().length, css: validationState()\">",
			"<input data-bind=\"value: sentence, valueUpdate: ['afterkeydown', 'afterpaste']\" type=\"text\" class=\"span11\" placeholder=\"Enter the sentence and press the Return key.\" />",
		"</div>",
		
		"<div class=\"words\" data-bind=\"foreach: words()\">",
			"<span class=\"word\" data-bind=\"text: text, css: { 'ui-selected': selected(), 'ready': !!baseForm() }, attr: { 'data-index': $index }\"></span>",
		"</div>",

		"<div class=\"details\" data-bind=\"if: selection().length > 1\">",
			"<button class=\"btn btn-mini merge\">Merge</button>",
		"</div>",

		"<div class=\"details\" data-bind=\"if: selection().length == 1\">",
			"<button class=\"btn btn-mini split\">Split</button>",
			"<span class=\"word-split\"></span>",
			"<div class=\"baseForm\">",
				"<input type=\"text\" autocomplete=\"off\" placeholder=\"Base form\" data-bind=\"value: selection()[0].baseForm, valueUpdate: ['afterkeydown', 'afterpaste']\" />",
			"</div>",
		"</div>"

	].join("");

	$.widget("words.sentenceEditor", {

		model: function() {
			var plain = ko.toJS(this._viewModel);

			return {
				sentence: plain.sentence,
				words: plain.words.map(function (w) {
					return {
						text: w.text,
						baseForm: w.baseForm,
						occurences: w.occurences
					}
				})
			}
		},

		_create: function() {

			this.element
				.addClass("sentenceEditor")
				.append(_markup);

			this._viewModel = new ViewModel({});

			ko.applyBindings(this._viewModel, this.element[0]);

			this._on({ 
				"keydown .sentence input": "_onSentenceInputKeydown",
				"keydown .baseForm input": "_onBaseFormInputKeydown",
				"click .reset": "_onResetClick",
				"click .merge": "_onMergeClick",
				"click .split": "_onSplitClick",
				"selectablestop .words": "_onSelectableStop"
			});
			
			this.element.find(".words").selectable();  
			
			this._subscription = this._viewModel.selection
				.subscribe(this._onSelectionChange.bind(this));
		},

		_destroy: function() {
			this._subscription.dispose();  
			ko.cleanNode(this.element[0]);
			this.element.empty().removeClass("sentenceEditor");
		},

		_onSentenceInputKeydown: function(evt) {

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
						selected: ko.observable(false),
						baseForm: ko.observable()
					}));
				});
			}
		}, 

		_onBaseFormInputKeydown: function(evt) {
			if (evt.which == 13) {
				var vm = this._viewModel;

				if (vm.selection().length == 1) {
					var word = vm.selection()[0];
					word.selected(false);

					var index = vm.words.indexOf(word);
					if (index + 1 < vm.words().length) {
						var nextWord = vm.words()[index + 1];
						nextWord.selected(true);
					}
				}
			}
		},
	   
		_onResetClick: function(evt) {
			this._viewModel.words.removeAll();
		},

		_onMergeClick: function(evt) {
			var vm = this._viewModel,
				words = vm.selection();

			// the index of the first word in the selection (= place to insert the result)
			var index = Math.min.apply(null, words.map(function (w) { return vm.words.indexOf(w); }));

			var singleWords = [].concat.apply([], words.map(function (w) { return w.words || [w]; }));

			// sort the words by their natural order in the sentence
			singleWords.sort(this._compareWords);     
			
			var occurences = [].concat.apply([], singleWords.map(function (w) { return w.occurences; })),
			 	mergedOccurence = this._getContinuosOccurence(occurences),
				texts = singleWords.map(function (w) { return w.text });
			         
			var mergedWord = { 
				selected: ko.observable(true), 
				baseForm: ko.observable() 
			};
			
			if (mergedOccurence) {
				$.extend(mergedWord, {
					text: texts.join(""),
					occurences: [mergedOccurence]
				});
			}
			else {
				$.extend(mergedWord, {
					text: texts.join(" "),
					occurences: occurences,
					words: singleWords
				});
			}

			vm.words.removeAll(words);
			vm.words().forEach(function (w) { w.selected(false); });

			vm.words.splice(index, 0, mergedWord);
		},       
		
		_onSplitClick: function(evt) {
			var self = this,
				vm = this._viewModel,
				word = vm.selection()[0];         
				
			var replace = function(splitWords) {
				word.selected(false);
				vm.words.remove(word);
				
				ko.utils.arrayPushAll(vm.words, splitWords);

				vm.words.sort(self._compareWords);
			};
			
			// composite word, split into original words
			if (word.words) {
				replace(word.words); 
			}
			else {
				// split single word   
				var selection = this.element.find(".word-split").wordEditor("select");
				if (!selection)
					return;
				
				var location = word.occurences[0],
					splitWords = []; 
					
				if (selection.start > 0) {
					splitWords.push({
						text: word.text.substr(0, selection.start),
						occurences: [{ start: location.start, length: selection.start }],
						selected: ko.observable(true), 
						baseForm: ko.observable()
					});
				}
				
				splitWords.push({
					text: word.text.substr(selection.start, selection.length),
					occurences: [{ start: location.start + selection.start, length: selection.length }],
					selected: ko.observable(true),
					baseForm: ko.observable()
				});
				  
				var restLength = location.length - selection.length - selection.start;
				if (restLength > 0) {
					splitWords.push({
						text: word.text.substr(selection.start + selection.length, restLength),
						occurences: [{ start: location.start + selection.start + selection.length, length: restLength }],
						selected: ko.observable(true),
						baseForm: ko.observable()
					});
				} 
				
				replace(splitWords);  
			}
		},
               
		_onSelectableStop: function(evt, ui) {
			var vm = this._viewModel;
		                            
          	this.element.find(".word").each(function () {
	        	var $word = $(this),
					word = vm.words()[$word.attr("data-index")];
				
				word.selected($word.is(".ui-selected"));
			});			
		},

		_onSelectionChange: function(evt) {
			
			var $wordEditor = this.element.find(".word-split");
			if ($wordEditor.is(".wordEditor"))
				$wordEditor.wordEditor("destroy");
			     
			var selection = this._viewModel.selection();
			if (selection.length == 1) {
				var word = selection[0];
				if (!word.words)         
					$wordEditor.wordEditor({ word: word.text });

				this.element.find(".baseForm input")
					.typeahead({ source: this._queryTypeahead.bind(this) })
					.focus();
			}
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
		},
		
		_compareWords: function(w1, w2) { 
			return w1.occurences[0].start - w2.occurences[0].start;
		},

		_getContinuosOccurence: function(occurences) {
			// returns a single merged occurence if the given sequence is continuos
			if (occurences.length <= 1)
				return occurences;
				
			var current = occurences[0].start;
			for (var i = 0; i < occurences.length; i++) {    
				var occurence = occurences[i];
				if (current != occurence.start)
					return null;
				current += occurence.length;
			}          
			
			return { start: occurences[0].start, length: current - occurences[0].start };
		},

		_queryTypeahead: function(query) {
			var selection = this._viewModel.selection();
		    if (selection.length == 1) {
				var word = selection[0];

				if (word.text.indexOf(query) == 0)
					return [ word.text ];
			}
			return [];
		}
	});

	function ViewModel(o) {
		$.extend(this, {
			sentence: ko.observable(""),
			validationState: ko.observable(),
			words: ko.observableArray()
		});

		// add computed selection for convenience
		this.selection = ko.computed(function () {
			return ko.utils.arrayFilter(this.words(), function (word) {
				return word.selected();
			});
		}, this);
	}

})(jQuery);