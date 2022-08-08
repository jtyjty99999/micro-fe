define(function (require, exports, module) {
    //返回 缩略图、完整正文段落、正文纯文本
    exports.resolveContent = function(content, pictures){
        if(typeof pictures =='string'){
            try{
                pictures = JSON.parse(pictures);
            }
            catch(err){
                //no picture in content
				pictures = {};
            };
        }
		else if (pictures == undefined)
			pictures = {};
        var contentObj = {
            thumbnails : [],
            fullContent : '',
            pureTextContent : '',
            paragraphes : 0,
            imgResources : {image : {}}
        };
        var div = document.createElement('div'),
            tempCon = '';

        contentObj.thumbnails = [];
        div.innerHTML = content;
        tempCon = div.innerText || div.textContent;
        
        //转换图片伪标签  
       //return tempCon.replace(/<!--(IMG_[0-9]+)-->/g, "<img src='" + pictures['$1'].url + ">"); 
        contentObj.fullContent = tempCon.replace(/<!--(IMG_[0-9]+)-->/g, function(name){
            var img = pictures[name.replace(/<!--/,'').replace(/-->/, '')] || {};
			if (img != undefined) {
				if(img.width > 120 && img.height > 120 && contentObj.thumbnails.length < 3){
					contentObj.thumbnails.push(img.url+'/100');
				}
                contentObj.imgResources.image[img.url+'/640']  = img;
				return "<img src='" + img.url + "/640'>";
			}
        });
        
        contentObj.pureTextContent = tempCon.replace(/<P>|<\/P>|<!--IMG_\d+-->/g, '');

        tempCon.replace(/<p>/gi, function(aPara){
            contentObj.paragraphes++;
            return aPara;
        })

        return contentObj;
    }

    
     exports.getThumbnails = function(content, pictures){
        if(typeof pictures =='string'){
            try{
                pictures = JSON.parse(pictures);
            }
            catch(err){
                //no picture in content
				pictures = {};
            };
        }
        var div = document.createElement('div'),
            tempCon = '',
            thumbnails = [];
        div.innerHTML = content;
        tempCon = div.innerText || div.textContent;
        
        //转换图片伪标签  
        tempCon.replace(/<!--(IMG_[0-9]+)-->/g, function(name){
            var img = pictures[name.replace(/<!--/,'').replace(/-->/, '')] || {};
			if (img != undefined) {
				if(img.width > 120 && img.height > 120 && contentObj.thumbnails.length < 3){
					contentObj.thumbnails.push(img.url+'/100');
				}
				return "<img src='" + img.url + "/640'>";
			}
        });

        return thumbnails;
    }

    exports.getFullContent = function(content, pictures){
        if(typeof pictures =='string'){
            try{
                pictures = JSON.parse(pictures);
            }
            catch(err){
                //no picture in content
				pictures = {};
            };
        }
        var div = document.createElement('div'),
            tempCon = '';
    
        div.innerHTML = content;
        tempCon = div.innerText || div.textContent;
        
        //转换图片伪标签  
       //return tempCon.replace(/<!--(IMG_[0-9]+)-->/g, "<img src='" + pictures['$1'].url + ">"); 
        return tempCon.replace(/<!--(IMG_[0-9]+)-->/g, function(name){
			var img = pictures[name.replace(/<!--/,'').replace(/-->/, '')];
			if (img != undefined) {
				var imgUrl = img.url;
				return "<img src='" + imgUrl + "/640'>";
			}
        });
    }
    exports.getPureTextContent = function(content){
        var div = document.createElement('div'),
            tempCon = '';

        div.innerHTML = content;
        tempCon = div.innerText || div.textContent;
    
        return tempCon.replace(/<P>|<\/P>|<!--IMG_\d+-->/g, '');
    }

    exports.getParagraphes = function(content){
        var div = document.createElement('div'),
            tempCon = '',
            para = 0;

        div.innerHTML = content;
        tempCon = div.innerText || div.textContent;
        tempCon.replace(/<p>/gi, function(aPara){
            para++;
            return aPara;
        })
        return para;
    }


    //根据 ueditor 内容提取 缩略图数组
    exports.getThumbnailsFromEditor = function(content){
        var thumbnails = [];
    
        var patt = new RegExp("<IMG(.*?) (src|data-src)=\"(.*?)\/640\"", "gi");
        var result;

        while ((result = patt.exec(content)) != null && thumbnails.length < 3)  {
            thumbnails.push(result[3] + '/100');
         }
        return thumbnails;
    }
    
})
