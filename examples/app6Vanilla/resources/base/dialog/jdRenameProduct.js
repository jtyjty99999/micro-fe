define(function(require, modules, exports) {
    var api = require('base/api/jdproduct');
	var jdProducts = require('base/dialog/jdproducts');
    var omtemplate = require('base/dialog/template');
    var layerId;
    var selectedData = {};
    var kw = ""; //检索关键字
    var pageNum = 1;
    var loading = false;
    var sortByPrice = 0;
	var sortByCommision = 0;
	var popupData = {};
	var currentContainer = {};
	var renameProd = false;

    jdRenameProduct = function(params) {
        $.extend(true, popupData, params);
    };

    jdRenameProduct.prototype = {
        show: function(callback) {
            var _this = this;
            $("body").css("overflow", "hidden");
            layerId = layer.open({
                type: 1,
                title: "自定义商品名称",
                content: omtemplate("art-dialog-jdprdname", popupData.data),
                area: ['820px', '660px'],
                move: false,
                success: function($container, index) {
					currentContainer = $container;
					renameProd = false;
                    selectedData = $.extend(true, selectedData, popupData.data);
                    eventBind($container, callback);
                },
				end: function() {
					if (renameProd == false)
						callback && callback({});
					$("body").css("overflow", "auto");
					initPopData();
				}				
            });
        },
        hide: function() {
            layer.close(layerId);
        }
    };
	
	function initPopData() {
		selectedData = {};
		kw = "";
	}

    function eventBind($container, callback) {
		// below is for the click sortby price and sortbyfeedback
		
        $container.on('click', '.backToJDProduct', function(e) {
			// 退回到上一步
			renameProd = true;
			layer.close(layerId);
			var tempPopupData = {};
			tempPopupData.source = 'video';
			tempPopupData.keyword = popupData.keyword;
			var tempJDPopup = new DialogJDProduct(tempPopupData);
			tempJDPopup.show(callback);
			initPopData();
        });

        $container.on('click', '.backToVideoProduct', function(e) {
			//点击确定
			//获得商品新名字
			renameProd = true;
			var newName = $container.find('.jdProdRenameDiv input').val().trim();
			if ((newName.length > 0 && newName.length < 15) || newName.length > 30)
				layer.msg('商品新名字长度为15到30之间');
			else {
				if (newName.length > 0)
					selectedData.name = newName;
				callback && callback(selectedData);	
				initPopData();			
				layer.close(layerId);
			}			
        });		

        $container.on('blur', '.jdProdRenameDiv input', function(e) {
            if (!$(this).val()) {
                $(this).siblings(".placeholder").show();
            }
        });
		
        $container.on('focus', '.jdProdRenameDiv input', function(e) {
            $(this).siblings(".placeholder").hide();
        });

        $container.on('keydown keyup change', '.jdProdRenameDiv input', function(e) {
			var inputLength = $(this).val().trim().replace(/(^\s*)|(\s*$)/g, "").replace(/[\u200B-\u200D\uFEFF]/g, '').length;
			if (inputLength > 30 || inputLength < 0) {
				$(this).siblings('.count').find("em").addClass('error');
			} else {
				$(this).siblings('.count').find("em").removeClass('error');
			}
			$(this).siblings('.count').find("em").text(inputLength);
        });
    }
    return jdRenameProduct;
});