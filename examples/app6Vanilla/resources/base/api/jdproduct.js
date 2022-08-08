define(function(require, exports, module) {
    var products = {
        getProductsList: function(data) {
			if (data.isSortByPrice == 1) {
				data.sort = "price";
				if (data.sortByPrice == 1)
					data.order = "asc";
				else
					data.order = "desc";
			}
			else if (data.isSortByCommision == 1) {
				data.sort = "commision";
				if (data.sortByCommision == 1)
					data.order = "asc";
				else
					data.order = "desc";
			}
            var dfd = $.Deferred();
            var url = '/ECAccess/GetECInfoByKeyword';
            $.ajax({
                type: "get",
                url: url,
                dataType: "json",
                data: data
            }).then(function(resp) {
                dfd.resolve(resp);
            }).fail(function() {
                dfd.reject({});
            });
            return dfd.promise();
        },

        getProductById: function(data) {
            var dfd = $.Deferred();
            var url = '/ECAccess/GetECInfoById';
            if(data.source!==undefined && data.source == 2) {
                url = '/ECAccess/GetECInfoYPById'
            }
            $.ajax({
                type: "get",
                url: url,
                dataType: "json",
                data: data
            }).then(function(resp) {
                dfd.resolve(resp);
            }).fail(function() {
                dfd.reject({});
            });
            return dfd.promise();
        },

        getProductCategory: function() {
            var dfd = $.Deferred();
            var url = '/ECAccess/ECInfoCatalogList';
            $.ajax({
                type: "get",
                url: url,
                dataType: "json"
            }).then(function(resp) {
                dfd.resolve(resp);
            }).fail(function() {
                dfd.reject({});
            });
            return dfd.promise();
        },

        getYPCategory: function() {
            var dfd = $.Deferred();
            var url = '/ECAccess/ECInfoYPCatalogList';
            $.ajax({
                type: "get",
                url: url,
                dataType: "json"
            }).then(function(resp) {
                dfd.resolve(resp);
            }).fail(function() {
                dfd.reject({});
            });
            return dfd.promise();
        },

        updateUserEcommerceStatus: function(data) {
            var dfd = $.Deferred();
            var url = '/ECommerce/updatestatus';
            $.ajax({
                type: "post",
                url: url,
                dataType: "json",
                data: data
            }).then(function(resp) {
                dfd.resolve(resp);
            }).fail(function() {
                dfd.reject({});
            });
            return dfd.promise();
        }
    };
    return products;
});
