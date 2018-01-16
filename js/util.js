//全局变量请求地址
var rootPath = 'http://120.27.13.112:81/api/';
var accessToken='un23n4no2bu4bs34';
var systemType = "1";//sie系统
var studentId = "1";
var userInfo;
/**
 * 时间格式化
 * @param fmt 格式
 * @returns
 */
Date.prototype.Format = function (fmt) {
    if(!this  || !this.getMonth()){
        return "";
    }
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };

    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


$.fn.serializeJson=function(){
    var serializeObj={};
    $(this.serializeArray()).each(function(){
        serializeObj[this.name]=this.value;
    });
    return serializeObj;
};

//上传照片后可以进行文件展示功能
jQuery.fn.extend({
    uploadPreview: function (opts) {
        var _self = this,
            _this = $(this);
        opts = jQuery.extend({
            Img: "ImgPr",
            Width: 100,
            Height: 100,
            ImgType: ["gif", "jpeg", "jpg", "bmp", "png"],
            Callback: function () {}
        }, opts || {});
        _self.getObjectURL = function (file) {
            var url = null;
            if (window.createObjectURL != undefined) {
                url = window.createObjectURL(file)
            } else if (window.URL != undefined) {
                url = window.URL.createObjectURL(file)
            } else if (window.webkitURL != undefined) {
                url = window.webkitURL.createObjectURL(file)
            }
            return url
        };
        _this.change(function () {
            if (this.value) {
                if (!RegExp("\.(" + opts.ImgType.join("|") + ")$", "i").test(this.value.toLowerCase())) {
                    alert("选择文件错误,图片类型必须是" + opts.ImgType.join("，") + "中的一种");
                    this.value = "";
                    return false
                }
                if ($.browser.msie) {
                    try {
                        $("#" + opts.Img).attr('src', _self.getObjectURL(this.files[0]))
                    } catch (e) {
                        var src = "";
                        var obj = $("#" + opts.Img);
                        var div = obj.parent("div")[0];
                        _self.select();
                        if (top != self) {
                            window.parent.document.body.focus()
                        } else {
                            _self.blur()
                        }
                        src = document.selection.createRange().text;
                        document.selection.empty();
                        obj.hide();
                        obj.parent("div").css({
                            'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)',
                            'width': opts.Width + 'px',
                            'height': opts.Height + 'px'
                        });
                        div.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = src
                    }
                } else {
                    $("#" + opts.Img).attr('src', _self.getObjectURL(this.files[0]))
                }
                opts.Callback()
            }
        })
    }
});


<!-- 将json值设置到form中 -->
$.fn.loadJson = function(jsonValue) {
    var obj = this;
    $.each(jsonValue, function(name, ival) {
        var $oinput = obj.find(":input[name=" + name + "]");
        if ($oinput.attr("type") == "radio"
            || $oinput.attr("type") == "checkbox") {
            $oinput.each(function() {
                if (Object.prototype.toString.apply(ival) == '[object Array]') {//是复选框，并且是数组
                    for (var i = 0; i < ival.length; i++) {
                        if ($(this).val() == ival[i])
                            $(this).attr("checked", "checked");
                    }
                } else {
                    if ($(this).val() == ival)
                        $(this).attr("checked", "checked");
                }
            });
        } else if ($oinput.attr("type") == "textarea") {//多行文本框
            obj.find("[name=" + name + "]").html(ival);
        } else {
            obj.find("[name=" + name + "]").val(ival);
        }
    });
};



//JS操作cookies方法!
//写cookies
function setCookie(name,value) {
    var Days = 1;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+";path=/";
}

/**
 * 获取cookie
 * @param name
 * @returns {null}
 */
function getCookie(name) {
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

/**
 * 删除cookie
 * @param name
 */
function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString()+";path=/";
}


dhcc={};
dhcc.Unit = {}
/** 提交的form, 显示输出结果的renderer */
dhcc.Unit.ajaxUtil = function (attrs, api, successBack, errorBack) {

    var params = {
        params:  JSON.stringify(attrs),
        accessToken: accessToken,
    };
    $.post(rootPath+api, params, function(result){
        if(result.success  && typeof(eval(successBack))=="function"){
            successBack(result.data);
        }else if(!result.success && typeof(eval(errorBack))=="function") {
            errorBack(result.message);
        }
        else{
            commonErrorBack(result.message);
        }
    });

};

//设置学生申请功能步骤哪些不可用
function initApplicationStep(){
    var attrs={};
    attrs.studentId=userInfo.id+"";
    /**
     * 不可用的申请功能初始化
     */
    dhcc.Unit.ajaxUtil(attrs,"getApplicationStep.json",function(data){
        var step = $("#application-step").find("a");
        var erroMsg;
        if(data == 0){
            erroMsg = "请先填写申请表";
        }else if(data == 1){
            erroMsg = "请先完成项目报名";
        }else if(data == 2){
            erroMsg = "请先完成缴费";
        }else{

        }
        //不可用的功能
        for(var i=data+2; i<5; i++){
            $(step[i]).attr("href","#");
            $(step[i]).bind("click",function(){
                dhcc.Unit.successMessage(erroMsg);
            });
        }
        step = data;
    });
}


//TODO 错误处理公共函数
function commonErrorBack(message){
    $("#modal-fail").find(".mt10").html(message);
    $('#modal-fail').modal('show');
    $("body").addClass("modal-scroll").css({
        "overflow":"hidden",
        "padding-right":0
    });
   setTimeout(function(){
        $('#modal-fail').modal('hide');
        $("body").removeClass("modal-scroll").css({
            "overflow":"auto"
        });
    }, 1500);
}


/** 提交的form, 显示输出结果的renderer */
dhcc.Unit.ajaxFile = function (attrs,fileId, api, successBack, errorBack) {
    var formData = new FormData();
    var name = $("input").val();
    formData.append("headImage",$("#"+fileId)[0].files[0]);
    formData.append("params",JSON.stringify(attrs));
    formData.append("accessToken",accessToken);
    $.ajax({
        url : rootPath+api,
        type : 'POST',
        data : formData,
        processData : false,
        contentType : false,
        success : function(result) {
            if(result.success  && typeof(eval(successBack))=="function"){
                successBack(result.data);
            }else if(!result.success && typeof(eval(errorBack))=="function") {
                errorBack(result.message);
            }else{
                commonErrorBack(result.message);
            }
        },
        error : function(responseStr) {
            commonErrorBack("获取不到信息");
        }
    });



};


dhcc.Unit.successMessage=function(message,callBack){
    $("#modal-success").find(".mt10").html(message);
    $('#modal-success').modal('show');
    $("body").addClass("modal-scroll").css({
        "overflow":"hidden",
        "padding-right":0
    });
    setTimeout(function(){
        $('#modal-success').modal('hide');
        $("body").removeClass("modal-scroll").css({
            "overflow":"auto"
        });
        if(typeof(eval(callBack))=="function"){
            callBack();
        }
    }, 1500);

}


dhcc.Unit.hideModal=function(modalId){
    $("#"+modalId).modal("hide");
    $("body").removeClass("modal-scroll").css({
        "overflow":"auto"
    });
}

//判断json对象是否有控制 有设置为''
function removeNull(json){

    if(!json){
        return {};
    }
    $.each(json,function(key,value){
        if(value == null){
            json[key] = '';
        }
    });
    return json;
}

/**
 * 判断是否登录
 * @returns {boolean}
 */
function judgeLogin(){
    if(userInfo && userInfo.id && userInfo.id>0){
        return true;
    }
    else{
        $("#login_modal_btn").click();
        return false;
    }
}

function checkEmail(value){
    //对电子邮件的验证
    var myreg = /^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
    if (!myreg.test(value)) {
        return false;
    }
    return true;
}


$.extend($.validator.messages, {
    required: "× 必填项",
    email: "非法邮件",
    digits: "只能输入整数",
    maxlength: $.validator.format("长度最大为{0}"),
    minlength: $.validator.format("长度最小为{0}"),
    rangelength: $.validator.format("长度介于{0}和{1}之间"),
    range: $.validator.format("介于{0}和{1}之间的值"),
    max: $.validator.format("最大为{0}"),
    min: $.validator.format("最小为{0}")
});

function isEmptyObject(e) {
    var t;
    for (t in e)
        return !1;
    return !0
}

