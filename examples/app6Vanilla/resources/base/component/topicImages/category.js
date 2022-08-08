define(function (require, exports, module) {
    var template = require('base/component/template');

    function Category(config) {
        this.subCategoryId = '';
        this.$container = config.wrap;
        this.categoryData = [
            {
                "id": "",
                "name": "推荐"
            },
            {
                "id": "220634,220635",
                "name": "新闻",
                "sub": [
                    {
                        "id": "220563,220576",
                        "name": "趣闻"
                    },
                    {
                        "id": "220571",
                        "name": "社会"
                    },
                    {
                        "id": "220569",
                        "name": "时政"
                    }
                ]
            },
            {
                "id": "220638",
                "name": "娱乐",
                "sub": [
                    {
                        "id": "220863,220649",
                        "name": "国内"
                    },
                    {
                        "id": "220862,220650",
                        "name": "国际"
                    }
                ]
            },
            {
                "id": "220637",
                "name": "体育",
                "sub": [
                    {
                        "id": "220589",
                        "name": "国内足坛"
                    },
                    {
                        "id": "220599",
                        "name": "国际足坛"
                    },
                    {
                        "id": "220607",
                        "name": "篮球"
                    },
                    {
                        "id": "220699,220716",
                        "name": "体育明星"
                    },
                    {
                        "id": "220620",
                        "name": "综合体育"
                    }
                ]
            },
            {
                "id": "220671",
                "name": "时尚",
                "sub": [
                    {
                        "id": "220711",
                        "name": "明星街拍"
                    },
                    {
                        "id": "220672",
                        "name": "T台秀场"
                    },
                    {
                        "id": "220714",
                        "name": "活动星装"
                    },
                    {
                        "id": "220712,220867,220612",
                        "name": "时尚潮流"
                    }
                ]
            },
            {
                "id": "220720,220766,220746,220566,220572",
                "name": "生活",
                "sub": [
                    {
                        "id": "220766,220746,220726",
                        "name": "休闲"
                    },
                    {
                        "id": "220566,220572",
                        "name": "文化教育"
                    },
                    {
                        "id": "220565,220573",
                        "name": "环境"
                    }
                ]
            },
            {
                "id": "234844,220567,220570",
                "name": "科技",
                "sub":[]
            },
            {
                "id": "223291",
                "name": "旅游",
                "sub":[]
            },
            {
                "id": "220636",
                "name": "财经",
                "sub":[]
            }
        ]
        this.state = {
            category: '',
            categoryName:'',
            subCategory: '',
            subCategorys: []
        }
    }
    Category.prototype = {
        init: function (options) {
            var self = this;
            self.options = $.extend({}, options || {})
            
            self.bindEvent()
        },
        getSubCategorys:function(id){
            var self = this
            var ret = []
            if(id){
                $.each(self.categoryData, function(i, c){
                    if(c.id == id){
                        ret = [{id:'',name:'全部'}].concat(c.sub)
                    }
                })
            }
            return ret
        },
        bindEvent: function () {
            var self = this

            self.$container.on('click', '.firstLevel li', function (e) {
                var $li = $(this);
                var category = $li.attr('data-id')
                var categoryName = $li.attr('data-name')

                self.setState({
                    category: category,
                    categoryName: categoryName,
                    subCategory: ''
                }).rend()

                self.options.onChange && self.options.onChange(self.state)
            })
            self.$container.on('click', '.secondLevel li', function (e) {
                var $li = $(this);
                var categoryId = $li.attr('data-id')

                self.setState({
                    subCategory: categoryId
                }).rend()
                
                self.options.onChange && self.options.onChange(self.state)
            })
        },
        rend: function () {
            this.setState({
                subCategorys: this.getSubCategorys(this.state.category) || []
            })

            this.$container.html(template('topicImages/category', $.extend({}, this.state, {categoryData:this.categoryData})))
        },
        setState: function (data) {
            this.state = $.extend({}, this.state, data)
            return this;
        },
        get:function(){
            return $.extend({}, this.state)
        }
    }

    return Category
})