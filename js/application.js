var school;
$(function(){

    if(!judgeLogin()){
        window.location.href="login.html";
    }

    //身份证号校验规则
    $.validator.addMethod('card', function( value, element ){

        // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
        var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        return reg.test(value);

    }, '非法身份证');
    //拼音校验规则
    $.validator.addMethod('pinyin', function( value, element ){
        var reg =  /[a-zA-Z]$/;
        return reg.test(value);

    }, '必须为拼音');
    //添加校验规则
    $("#data-form").validate({
        rules : {
            lastName:{
                required: true,
                pinyin:true
            },
            firstName:{
                required: true,
                pinyin:true
            },
            chineseName :{
                required: true,
                minlength: 2
            },
            birthday:{
                required: true
            },
            email:{
                email:true
            },
            idNumber:{
                required: true,
                card:true
            },
            passportNumber:{
                required: true
            },
            telephone:{
                required: true
            },
            weiXin:{
                required: true
            },
            schoolName:{
                required: true
            },
            profession:{
                required: true
            },
            gpa:{
                required: true
            },
            graduationYear:{
                required: true,
                digits:true
            }
        }
    });

    //绑定国籍变化事件
    $('input[type=radio][name=nationality]').change(function() {
        if (this.value == '中国') {
            $("input[name='idNumber']").parent().show();
            $("input[name='passportNumber']").parent().hide();
        }
        else if (this.value == '非中国') {
            $("input[name='idNumber']").parent().hide();
            $("input[name='passportNumber']").parent().show();
        }
    });


    /**
     * 加载学生信息
     */
    var attrs={};
    attrs.studentId=userInfo.id+"";

    initApplicationStep();

    /**
     * 获取我的订单
     */
    dhcc.Unit.ajaxUtil(attrs,"getStudnetInfo.json",function(data){
        var birthDay =    new Date(data.birthday).Format("yyyy-MM-dd");
        data.birthday=birthDay;
        $("#data-form").loadJson(data);
        $("input[name='nationality'][value='" + data.nationality + "']").change();//出发change事件
        //加载照片
        if (data.image != null && data.image != undefined && data.image != '') {
            var params = {"image":data.image};
            //$('#uploadCard').attr('src',  );
            //$("#test").trigger("click")
            var imgHref = encodeURI(rootPath + 'loadImage?params=' + JSON.stringify(params) + '&accessToken='+accessToken);
            $(".file-img").html('<img src="" class="img-responsive" alt="头像">')
            $(".file-img").find("img").attr("src",imgHref)
        }
    });

    $("#saveApplication").bind("click",function(){
        if(!$("#data-form").valid()){
            return;
        }
        $("#saveApplication").attr("disabled", true);
        var params = $("#data-form").serializeJson();

        attrs=params;
        dhcc.Unit.ajaxFile(attrs,"headImage","saveApplicationForm.json",function(data){
            //等待1.5秒后消失
            dhcc.Unit.successMessage("提交成功",function(){
                //页面进行跳转
                window.location.href = "project-registration.html";
            });
        });
    });

    dhcc.Unit.ajaxUtil({}, "getSchool.json",function(data){
        if(data && data.length > 0){
            var schools = {};
            for(var i=0; i<data.length; i++){
                var obj = data[i];
                $("#president").append("<option>"+obj.name+"</option>")
            }

            $('#president').chosen({allow_single_deselect: true});
            var chosen = $(".chosen-single");
            var setinput = $(".chosen-search").find("input");
            chosen.addClass('form-control');
            setinput.addClass('form-control');

        }
    });

    dhcc.Unit.ajaxUtil({}, "getSchoolCategory.json",function(data){
        if(data && data.length > 0) {
            var schools = {};
            for (var i = 0; i < data.length; i++) {
                var obj = data[i];
                if(schools[obj.national]){
                    schools[obj.national].push(obj.province)
                }else{
                    schools[obj.national]=[];
                    schools[obj.national].push(obj.province);
                }
            }

            var i=0;
            for(var nationality in schools){
                var active = "";
                if(i==0){
                    active = 'active';
                }

                $(".college-tab ul.nav-tabs").append(' <li role="presentation" class="'+active+'" ><a href="#college'+i+'" onclick="selectNation('+i+')" aria-controls="#college'+i+'" role="tab" data-toggle="tab">'+nationality+'</a></li>');

                $(".college-tab .tab-content").append(' <div role="tabpanel" class="tab-pane '+active+'" id="college'+i+'">'+
                    ' <div class="college-a"></div></div>')
                $("#college"+i).append('<div class="college-ul">'+
                    '<ul class="clearfix">');


                for(var n=0; n<schools[nationality].length;n ++){
                    var province = schools[nationality][n];
                    $("#college"+i).find(".college-a").append('<a id="province'+i+n+'" onclick="seletProvince(\''+province+'\',\'province'+i+n+'\')" href="javascript:;">'+province+'</a>');
                }
                i++;
            }

            selectNation(0);
        }

    });

    ////绑定学校保存按钮
    $("#select_school_btn").bind("click",function(){
        var school = $("#president_chosen a").find("span").html();
        $("#schoolName").val(school);
        dhcc.Unit.hideModal("modal-college");
    })


})

function selectNation(index){
    $("#college"+index).find(".college-a").children(":first").click();
}

function seletProvince(province, id){
    $("#"+id).parent().children().removeClass("active");
    $("#"+id).addClass("active");
    $("#"+id).parent().parent().find(".clearfix li").remove();
    var atts={"province":province}

    dhcc.Unit.ajaxUtil(atts, "getSchool.json",function(data) {
        if (data && data.length > 0) {
            var schools = {};
            for (var i = 0; i < data.length; i++) {
                var obj = data[i];
                $("#"+id).parent().parent().find(".clearfix").append('<li class="'+province+'"  onclick="selectSchool(\''+obj.name+'\')"><i class="fa fa-university"></i>'+obj.name+'</li>');

            }
        }
    })



}

function selectSchool(school){
    $("#schoolName").val(school);
    dhcc.Unit.hideModal("modal-college");
}