define(function(require, modules, exports) {
    var api = require('base/api/jdproduct');
	var renameProduct = require('base/dialog/jdRenameProduct');
    var omtemplate = require('base/dialog/template');
    var layerId;
    var selectedData = {};
    var kw = ""; //检索关键字
    var pageNum = 1;
    var loading = false;
    var sortByPrice = 0;
	var sortByCommision = 0;
	var data = {};
	var config = {};
	var selectedProd = false;

    DialogJDProduct = function(params) {
        $.extend(true, config, params);
		data.sortByPrice = 0;
		data.sortByCommision = 0;
		data.isSortByPrice = 0;
		data.isSortByCommision = 0;
		data.page = pageNum;
		data.size = 10;
		data.totalData = 0;
		data.catalog = "";
        data.source = 1;
    };

    DialogJDProduct.prototype = {
        show: function(callback) {
            var _this = this;
			var templateData = {};
			templateData.source = config.source || 'article';
			templateData.keyword = config.keyword || '';
            $("body").css("overflow", "hidden");
			if (templateData.source == 'article') {
				layerId = layer.open({
					type: 1,
					title: "插入商品",
					content: omtemplate("art-dialog-jdproduct", templateData),
					area: ['800px', '660px'],
					move: false,
					btn: [
						'确定',
						'取消'
					],
					success: function($container, index) {
						selectedData = {};
						loadData(data, $container, true);
						// here we start to init the category selection
						initCategory($container);
						eventBind($container);
					},
					yes: function(index, $container) {
						if (!selectedData.id) {
							layer.msg("未选择任何商品");
						} else {
							callback && callback(selectedData);
						}
						initPopData();
					},
					end: function() {
						$("body").css("overflow", "auto");
						initPopData();
					}
				});
			}
			else if (templateData.source == 'video') {
				layerId = layer.open({
					type: 1,
					title: "推广商品",
					content: omtemplate("art-dialog-jdproduct", templateData),
					area: ['800px', '660px'],
					move: false,
					btn: [
						'下一步',
						'取消'
					],
					success: function($container, index) {
						selectedData = {};
						selectedProd = false;
						kw = templateData.keyword;
						loadData(data, $container, true);
						eventBind($container);
						if (kw != "") {
							$("#product_kw").siblings(".placeholder").hide();
							$("#product_kw").val(templateData.keyword);
							$container.find('[data-action="clearProd"]').show();
						}
					},
					yes: function(index, $container) {
						selectedProd = true;
						if (!selectedData.id) {
							layer.msg("未选择任何商品");
						} else {
							// here we need to show rename product popup
							showRenamePopup(callback);
						}
						initPopData();
					},
					end: function() {
						if (selectedProd == false)
							callback && callback({});
						$("body").css("overflow", "auto");
						initPopData();
					}
				});
			}
        },
        hide: function() {
            layer.close(layerId);
        }
    };

	function showRenamePopup(callback) {
		// at first, fetch product infomation from api
		api.getProductById(selectedData).then(function(resp) {
			var prodData = resp.data;
			if (resp.response.code == 0) {
				if (prodData && prodData.url) {
					prodData.url = prodData.promotion_link;
				}
				// 弹出商品改名的对话框
				var tempParam = {};
				tempParam.data = prodData;
				tempParam.keyword = config.keyword;
				selectedData = prodData;
				layer.close(layerId);
				var renamePopup = new jdRenameProduct(tempParam);
				renamePopup.show(callback);
			}
			else if (resp.response.code == -1) {
				layer.msg("获得商品信息失败，请重试");
			}
		}).fail(function() {
			layer.msg("获得商品信息失败，请重试");
		});
	}

	function initPopData() {
		data.sortByPrice = 0;
		data.sortByCommision = 0;
		data.isSortByPrice = 0;
		data.isSortByCommision = 0;
		data.page = 1;
		data.size = 10;
		selectedData = {};
		kw = "";
		config = {};
		data.totalData = 0;
	}

	function loadData(data, $container, isFirst) {
		loading = true;
		data.keyword = kw;
		api.getProductsList(data)
			.then(function(resp) {
				var list = resp.data.list;
				data.totalData = resp.data.total;
				loading = false;
				if (isFirst) {
					var templateData = {};
					templateData.sortByCommision = data.sortByCommision;
					templateData.sortByPrice = data.sortByPrice;
					templateData.isSortByPrice = data.isSortByPrice;
					templateData.isSortByCommision = data.isSortByCommision;
					templateData.list = resp.data.list;
					templateData.keyword = kw;
					var templateHtml = omtemplate("art-dialog-jdproduct-search", templateData);
					$container.find('.jdProdBody').html(templateHtml);
				}
				else {
					var templateData = {};
					templateData.list = resp.data.list;
					var templateHtml = omtemplate("art-dialog-jdproduct-item", templateData);
					$container.find('.table-insert-goods tbody').append(templateHtml);
				}
				eventBindForTable($container);
			}).fail(function() {
				if (isFirst) {
					loading = false;
					var templateData = {};
					templateData.sortByCommision = 0;
					templateData.sortByPrice = 0;
					templateData.list = null;
					templateData.keyword = kw;
					var templateHtml = omtemplate("art-dialog-jdproduct-search", templateData);
					$container.find('.jdProdBody').html(templateHtml);
					layer.msg("获取商品失败");
				}
				else
					layer.msg("获取更多商品失败");
			});
	}

	function initCategory($container,config) {
		$container.find('[categoryFlag]').html("<option value='' >" + "选择分类" + "</option>");
		$container.find('[categoryFlag]').chosen("destroy").chosen({width: "140px",disable_search: true});
        if(config!==undefined && config.source == 2) {
            api.getYPCategory()
    			.then(function(resp) {
    				if (resp.response.code == 0) {
    					if (!!resp.data) {
    						$container.find('[categoryFlag]').html(buildCategory(resp.data));
    						$container.find('[categoryFlag]').val('');
    						$container.find('[categoryFlag]').chosen("destroy").chosen({width: "140px",disable_search: true});
    					}
    				}
    			}).fail(function(resp) {
    				omlayer.msg('获得分类出错');
    			});
        } else {
            api.getProductCategory()
    			.then(function(resp) {
    				if (resp.response.code == 0) {
    					if (!!resp.data) {
    						$container.find('[categoryFlag]').html(buildCategory(resp.data));
    						$container.find('[categoryFlag]').val('');
    						$container.find('[categoryFlag]').chosen("destroy").chosen({width: "140px",disable_search: true});
    					}
    				}
    			}).fail(function(resp) {
    				omlayer.msg('获得分类出错');
    			});
        }
	}

	function buildCategory(categoryData) {
        var tmpArr=[];
        tmpArr.push("<option value='' >" + "选择分类" + "</option>");
        if (categoryData != undefined) {
			for (var key in categoryData) {
				tmpArr.push('<option value="{0}">{1}</option>'.format(key, categoryData[key]));
			}
        }
        return tmpArr.join('');
    }

	function eventBindForTable($container) {
		var temp = $container.find(".insert-goods-body.scroll-theme");
        $container.find(".insert-goods-body").on('scroll', function(e) {
            var panel = this;
			if (data.page * data.size < data.totalData) {
				if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
					if (pageNum != 0 && !loading) {
						pageNum = pageNum + 1;
						data.page = pageNum;
						loadData(data, $container, false);
					}
				}
			}
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
	}

    function eventBind($container) {
		// below is for the click sortby price and sortbyfeedback
		$container.on('click', '.priceSort', function(e) {
			if (data.isSortByPrice == 0) {
				data.isSortByPrice = 1;
				data.isSortByCommision = 0;
				if (data.sortByPrice == 0)
					data.sortByPrice = 1;
				else
					data.sortByPrice = 0;
			}
			else {
				data.isSortByPrice = 0;
				data.isSortByCommision = 0;
				if (data.sortByPrice == 0)
					data.sortByPrice = 1;
				else
					data.sortByPrice = 0;
			}
            loadData(data, $container, true);
        });

		$container.on('click', '.commisionSort', function(e) {
			if (data.isSortByCommision == 0) {
				data.isSortByPrice = 0;
				data.isSortByCommision = 1;
				if (data.sortByCommision == 0)
					data.sortByCommision = 1;
				else
					data.sortByCommision = 0;
			}
			else {
				data.isSortByPrice = 0;
				data.isSortByCommision = 0;
				if (data.sortByCommision == 0)
					data.sortByCommision = 1;
				else
					data.sortByCommision = 0;
			}
            loadData(data, $container, true);
        });

        $container.on('click', 'tr.productDataRow .cell-radio', function(e) {
            e.stopPropagation();
            e.preventDefault();
            $container.find(".ui-radio .icon-radio").removeClass("radio-active");
            $(this).find('.icon-radio').addClass("radio-active");
            var tempData = $(this).attr("data");
			selectedData.id = tempData;
            var index = $container.find('.tab li.active').index();
            if(index == 1){
                selectedData.source = 2;
            } else {
                selectedData.source = 1;
            }
			return false;
        });

        $container.on('click', '[data-action="searchProdBtn"]', function() {
			initPopData();
            kw = $("#product_kw").val();
            loadData(data, $container, true);
            $container.find('.jdProdBody').html("");
            $container.find('.help-info').hide();
        });

        $container.on('click', '.tab li', function(e) {
           var target = e.currentTarget;
           $container.find('.tab li').removeClass('active');
           $(target).addClass('active');
           var index = $container.find($(target)).index();
           if( index==1 ){
               data.source = 2;
           } else {
               data.source = 1;
           }
           initCategory($container,data);
           loadData(data, $container, true);
       });

        $container.on('click', '[data-action="clearProd"]', function() {
            $("#product_kw").val("");
            kw = "";
            $("#product_kw").siblings(".placeholder").show();
            $(this).hide();
            $container.find('.help-info').hide();
            $container.find('.jdProdBody').html("");
        });

        $container.on('blur', '#product_kw', function(e) {
            if (!$(this).val()) {
                $(this).siblings(".placeholder").show();
            }
        });

        /*$container.on('focus', '#product_kw', function(e) {
            $(this).siblings(".placeholder").hide();
        });*/

        $container.on('keydown', '#product_kw', function(e) {
            if (e.keyCode == 13) {
				initPopData();
                $container.find('.help-info').hide();
                kw = $("#product_kw").val();
                loadData(data, $container, true);
                $container.find('.jdProdBody').html("");
                $container.find('.help-info').hide();
            }
        });

        $container.find(".input-clear-btn").hide();
        $container.on('keydown keyup change', '#product_kw', function(e) {
            if (utils.trim($(this).val()).length > 0) {
                $container.find(".input-clear-btn").show();
                $("#product_kw").siblings(".placeholder").hide();
            } else {
                $container.find(".input-clear-btn").hide();
                $("#product_kw").siblings(".placeholder").show();
            }
        });

        if (config.source == undefined || config.source == "article") {
	        $container.on('change', '[categoryFlag]', function(e) {
	            var tempCategory = $container.find('[categoryFlag]').val();
				data.catalog = tempCategory;
	        });
        }
    }
    return DialogJDProduct;
});
