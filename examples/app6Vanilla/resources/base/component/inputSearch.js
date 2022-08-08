define(function (require, exports, module) {
	var componentTemplate = require('base/component/template');
	var selectorCache = []; //防止事件重复绑定
	return {
		init: function (config) {
			$(config.container).append(componentTemplate('inputSearch', {
				placeHolder: config.placeHolder,
				className: config.className || 'search-form-zbtk'
			}));
			if (config.containerStyle) {
				$(config.container).addClass(config.containerStyle);
			}
			if (this.checkISexist(config.container)) {
				this.eventBind(config);
			}
		},
		checkISexist: function (str) {
			for (var i = 0; i < selectorCache.length; i++) {
				if (selectorCache[i] == str) return false;
			}
			selectorCache.push(str);
			return true;
		},
		eventBind: function (config) {
			var inputSelector = config.container + " .search-form input";
			var clearSelector = config.container + " .search-form .input-clear-btn";
			var searchSelector = config.container + " .search-form button";

			$('body').on("keyup", inputSelector, function () {
				if (!!$(this).val()) {
					$(this).next().hide();
					$(clearSelector).show();
				} else {
					$(this).next().show();
					$(clearSelector).hide();
				}
			});

			$('body').on('click', clearSelector, function () {
				$(inputSelector).val('');
				$(inputSelector).next().show();
				$(clearSelector).hide();
			});

			$('body').on("click", searchSelector, function () {
				config.keyword = $(inputSelector).val();
				config.callback && config.callback();
			});

			$('body').on("keydown", inputSelector, function (e) {
				if (e.keyCode != 13) return;
				config.keyword = $(inputSelector).val();
				config.callback && config.callback();
			})
		}
	}
})
