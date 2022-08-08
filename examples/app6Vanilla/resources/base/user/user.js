define(function (require, exports, module) {
    var g_userInfo = {
        nick: '雷土豪的媒体',
        icon: 'http://inews.gtimg.com/newsapp_ls/0/182306174_200200/0',
        mediaId: '5054276',
        uin: '',
        email: '3116742949@qq.com',
        user_original:'0'
    }
    var user = window.g_userInfo || {};
    user.checkIsOver18Age=function(value){
        var age = "";
        var val= $.trim(value);
        if(val.length == 15){
            age = "19"+val.substr(6,6);
        } else if(val.length == 18){
            age = val.substr(6,8);
        }
        age = age.replace(/(.{4})(.{2})/,"$1-$2-");
        var arrDate = age.split("-");
        var jsNow;
        var arrJsNow;
        if(user&&user.date){//如果有服务器时间
            arrJsNow=user.date.split("-");
            jsNow = new Date(arrJsNow[0],arrJsNow[1]-1,arrJsNow[2]);
        }else{
            jsNow=new Date();
        }

        var ageDate = new Date(arrDate[0],arrDate[1]-1,arrDate[2]);
        var nowYear= jsNow.getFullYear();    //获取完整的年份(4位,1970-????)
        var nowMonth=jsNow.getMonth()+1;       //获取当前月份(0-11,0代表1月)
        var nowDate=jsNow.getDate();        //获取当前日(1-31)

        var jsYear=ageDate.getFullYear();
        var jsMonth=ageDate.getMonth()+1;
        var jsDate=ageDate.getDate();
        var result=true;
        if(nowYear-jsYear<18){ //如果年份小于18，直接返回false
            //return false;
            result=false;
        }else if(nowYear-jsYear==18) { //如果年份差等于18，则比较月份

            if (nowMonth < jsMonth) {//年份等于18时，当前月份小于出生月份
                //return false;
                result=false;
            } else if (nowMonth == jsMonth) {//如果月份也相等，则比较日期
                if (nowDate < jsDate) { //年份等于18，月份相等时，如果当前日期小于出生日期，
                    //return false;
                    result=false;
                }
            }
        }
        return result;
    };
    return user;
});