var coursePrice;
var dormitorys;//是个map
var orders;
var courseTime;//所有的课程信息 key为课程id value 为上课时间
$(function(){
	if(!judgeLogin()){
		window.location.href="login.html";
	}
	/**
	 * 不可用的申请功能初始化
	 */
	initApplicationStep();

	/**
	 * 加载报名项目信息
	 */
	var attrs={};
	attrs.systemType=systemType;
	/**
	 * 获取项目信息
	 */
	dhcc.Unit.ajaxUtil(attrs,"getProjects.json",function(data){
		//设置project下拉框
		var project = $("#project").next();
		var projectLi = '';
		$.each(data,function(i,item){
			projectLi = projectLi +
				'<li max-course="' + item.maxCourse + '" li-value="'+ item.ids +'">' + item.name + '</li>';
		});
		project.empty();
		project.append(projectLi);
		initProjectSelect();

		//默认选中第一个项目
		if(projectLi != ''){
			project.find("li:first").click();
		}

	});

	//绑定订单保存事件
	$("#validOrder").bind("click", function () {
		//判断最少每个项目选择一门课程 和总课程数必须是选择数
		var num = $(".project-tab").find("input[type=checkbox]:checked").length;
		var maxNum = $("#course-num").attr("li-value");
		if(num != maxNum){
			//TODO 进行提示
			alert("课程总数不对");
			return;
		}
		//判断每个项目必须最少选择一门课程
		var flag = false;
		var projectName="";
		$(".project-tab").find("a").each(function() {
			var projectId = $(this).attr("aria-controls");
			projectName = $(this).text();
			//获取所有的课程
			num = $("#" + projectId).find("input[type=checkbox]:checked").length;
			if(num == 0){
				//TODO 进行提示
				flag=true;
				return;
			}
		});
		if(flag){
			alert(projectName + "必须选择一门课程");
			return;
		}
		//触发按钮进行显示
		$("#create-order").click();
	});

	$("#create-order").bind("click", function () {
		var dormitoryPrice = 0;
		var courseTr = '';
		var dormitoryTr = '';
		orders = [];
		$(".project-tab").find("a").each(function(){
			var project = {};
			//去掉coursetab得到projectid
			var projectId = $(this).attr("aria-controls").substr(9);
			var projectName = $(this).text();
			project["projectId"] = parseInt(projectId);

			var courses = [];
			//获取所有的课程
			$("#coursetab"+projectId).find("input[type=checkbox]:checked").each(function () {
				courses.push($(this).val());

				var parentTr = $(this).parent().parent().parent();
				courseTr = courseTr + '<tr>'+
					'<td><label>' + parentTr.prev().prev().text() + '</label></td>'+
					'<td><label>' + parentTr.prev().text() + '</label></td>'+
					'<td><label>' + projectName + '</label></td></tr>';
			});
			project["courseIds"] = courses.join(",");
			orders.push(project);
			//获取住宿
			var dormitory = $("#dormitory").find("input[name=dormitory"+projectId+"]:checked");
			console.log(dormitory);

			if(dormitory.val() != ''){
				dormitoryTr = dormitoryTr + '<tr>'+
					'<td id="dormitoryId'+dormitory.val()+'"><label>' + dormitorys[dormitory.val()].name + '</label></td>';
				//获取住宿价格
				dormitoryTr = dormitoryTr + '<td><label>￥'+dormitorys[dormitory.val()].price+'</label></td></tr>';
				dormitoryPrice = dormitoryPrice + dormitorys[dormitory.val()].price;
				project = {};
				project["projectId"] = parseInt(projectId);
				project["dormitoryId"] = parseInt(dormitory.val());
				orders.push(project);
			}
		});

		//设置课程价格
		courseTr = courseTr + '<td colspan="3" class="text-right"><label>学费总价：￥ '+ coursePrice +'</label></td>';
		//显示课程信息
		$("#course-list").empty();
		$("#course-list").append(courseTr);

		//显示住宿信息
		if(dormitoryTr == ''){
			//没有住宿信息
			dormitoryTr = '<tr><td><label>无</label></tr>';
		}
		$("#dormitory-list").empty();
		$("#dormitory-list").append(dormitoryTr);

		//总价格
		var totalTr = '总价：￥'+(coursePrice + dormitoryPrice);
		$("p.text-right").find("b").text(totalTr);
		//后台获取价格
		//attrs={};
		//attrs.systemType=parseInt(systemType);
		//attrs.orderDetailBean = orders;
		/**
		 * 保存订单信息
		 */
		//dhcc.Unit.ajaxUtil(attrs,"getOrderPrice.json",function(data) {
		//	//Fixme 根据前台进行修改
		//	$("#course-price").text('￥' +data['coursePrice']);
		//	$("#total-price").text('￥' + data['totalPrice']);
		//
		//	//住宿价格
		//	if(data['dormitoryPrice'] != null){
		//		$.each(data['dormitoryPrice'],function(key,value){
		//			$("#dormitoryId"+key).append('<label class="pull-right">￥'+ value +'元</label>');
		//		});
		//	}
		//});

	});
	//确认下单功能
	$("#firm-order").bind("click",function(){
		attrs={};
		attrs.systemType=parseInt(systemType);
		attrs.studentId = parseInt(userInfo.id+"");
		attrs.orderDetailBean = orders;
		/**
		 * 保存订单信息
		 */
		dhcc.Unit.ajaxUtil(attrs,"createOrder.json",function(data) {
			$("#success-order-message").click();

			setTimeout(function(){
				//页面进行跳转
				window.location.href = "tuition-payment.html";
			}, 1500);
		});
	});

})

//初始化select方法
function initProjectSelect(){
	var project = $("#project");
	project.next().find("li").click(function() {
		if ($(this).attr("class") !="disabled") {
			var txt = $(this).text();
			var key = $(this).attr("li-value");
			var oldKey = $(this).parent().prev().attr("li-value");
			$(this).parent().prev().val(txt);
			$(this).parent().prev().attr("li-value",key);
			if(key != oldKey){
				var maxCourse = $(this).attr("max-course");
				changeProject(maxCourse,key);
			}
		}
	});
}

function changeProject(maxCourse,project){
	var projectIds = project.split(',');
	var minCourse = projectIds.length;
	$("#course-num").val("选课门数");
	$("#course-num").attr("li-value",0);
	var courseNum = $("#course-num").next();
	var courseLi = '';
	for(var i = minCourse; i<=maxCourse; i++){
		courseLi = courseLi +
			'<li li-value="' + i + '">' + i+"门" + '</li>';
	}
	courseNum.empty();
	courseNum.append(courseLi);

	price = {};
	//加载项目下的课程和住宿信息
	getProjectCourseAndDormitory(project);

	initCourseNumSelect();
}

function getProjectCourseAndDormitory(projectIds){
	var attrs={};
	attrs.projectIds=projectIds;
	attrs.systemType=systemType;
	/**
	 * 获取项目下的课程和住宿信息
	 */
	dhcc.Unit.ajaxUtil(attrs,"getProjectDetails.json",function(data) {
		dormitorys = {};
		timeCourse = {};
		courseTime = {};
		var ul = $(".project-tab").find("ul");
		ul.empty();
		var courseTab = ul.next();
		courseTab.empty();
		$("#dormitory").empty();
		var maxDorNum = 0;
		$.each(data,function (i, item) {
			if(item.dormitoryVos.length > maxDorNum){
				maxDorNum = item.dormitoryVos.length;
			}
		});
		$.each(data,function (i, item) {
			//设置项目标签
			var projectLi = '<li role="presentation" datatime="' + item.startTimeStr + "-" + item.endTimeStr + '">' +
				'<a href="#coursetab' + item.id + '" aria-controls="coursetab' + item.id + '" role="tab" data-toggle="tab">' + item.name + '</a>' +
				'</li>';
			ul.append(projectLi);

			//设置课程
			var course = '<div role="tabpanel" class="tab-pane" id="coursetab' + item.id + '">' +
				'<table class="table table-bordered table-middle text-center">' +
				'<tr>' +
				'<th>课程时间</th>' +
				'<th>课程代码</th>' +
				'<th>课程名称</th>' +
				'<th>选择</th>' +
				'</tr>';
			//遍历course
			$.each(item.courseVoMaps,function (ii, courses) {
				$.each(courses.courseVos,function (j, courseInfo) {
					//初始化课程时间
					courseTime[courseInfo.id] = courses.key;
					course = course + '<tr>';
					if (j == 0) {
						//第一个要特殊处理一次下
						course = course + '<td rowspan="' + courses.courseVos.length + '"><label>' + courses.key + '</label></td>';
					}
					course = course +
						'<td><label>' + courseInfo.code + '</label></td>' +
						'<td><label>' + courseInfo.englishName + '</label></td>';
					if (courseInfo.readonly) {
						course = course +
							'<td>' +
							'<label class="text-grey">已满</label>' +
							'</td>';
					} else {
						course = course +
							'<td>' +
							'<div class="radio-box">' +
							'<label>' +
							'<input type="checkbox" value="' + courseInfo.id + '"/>' +
							'<i class="fa"></i>' +
							'</label>' +
							'</div>' +
							'</td>';
					}
					course = course + '</tr>';
				});
			});

			course = course + '<tr>'+
				'<td colspan="4" class="text-right hidden"><label></label></td>' +
				' </tr>';
			course = course + '</table></div>';
			courseTab.append(course);

			//遍历dormitory
			var dormitoryTr = '<tr>'+
				'<td><label>'+item.name+'</label></td>';
			//默认第一个为无
			dormitoryTr = dormitoryTr + '<td>'+
				'<div class="radio-box">' +
				'<label>'+
				'<input type="radio" name="dormitory'+item.id+'" value="" checked/>'+
				'<i class="fa"></i>'+
				'<span>无</span>'+
				'</label>'+
				'</div></td>';
			$.each(item.dormitoryVos,function (j, dormitory) {
				if(dormitory.readonly){
					dormitoryTr = dormitoryTr+ '<td>'+
						'<div class="radio-box">'+
						'<label class="text-grey">'+dormitory.name +' （已满）</label>'+
						'</div></td>';
				}else{
					dormitoryTr = dormitoryTr+ '<td>'+
						'<div class="radio-box">' +
						'<label>'+
						'<input type="radio" name="dormitory'+item.id+'" value="'+dormitory.id+'" />'+
						'<i class="fa"></i>'+
						'<span>'+dormitory.name +'（￥ ' + dormitory.price + '）</span>'+
						'</label>'+
						'</div></td>';
					//保存价格
					dormitorys[dormitory.id] = dormitory;
				}
			});
			for(var jj=item.dormitoryVos.length+1;jj<=maxDorNum;jj++){
				//插入空的行
				dormitoryTr = dormitoryTr+ '<td></td>';
			}
			dormitoryTr = dormitoryTr + "</tr>";
			$("#dormitory").append(dormitoryTr);
		});

		//tab变化的时候改变项目时间
		ul.find("li").click(function(){
			$(".project-tab").find("span").text($(this).attr("datatime"));
		});
		//默认选中第一个tab页
		ul.find("a:first").click();

		//初始化选课checkbox按钮
		initCheckBoxClick(projectIds);

	});
}

//初始化课程门数方法
function initCourseNumSelect(){
	var courseNum = $("#course-num");
	courseNum.next().find("li").click(function() {
		if ($(this).attr("class") !="disabled") {
			var txt = $(this).text();
			var key = $(this).attr("li-value");
			var oldKey = $(this).parent().prev().attr("li-value");
			$(this).parent().prev().val(txt);
			$(this).parent().prev().attr("li-value",key);
			if(key != oldKey){
				//价格变化事件
				getCoursePrice(key);
				courseCheckboxChange();
			}
		}
	});
}

function getCoursePrice(courseNumber){
	var projectIds = $("#project").attr("li-value").split(',');
	var projectNumber = projectIds.length;

	//获取课程价格
	attrs={};
	attrs.systemType=parseInt(systemType);
	attrs.projectNumber = parseInt(projectNumber);
	attrs.courseNumber = parseInt(courseNumber);
	/**
	 * 保存订单信息
	 */
	dhcc.Unit.ajaxUtil(attrs,"getCoursePrice.json",function(data) {
		var moneyTr = '<tr>'+
			'<td colspan="4" class="text-right"><label>学费总价：￥ '+data+'</label></td>' +
			' </tr>';

		$(".project-tab").find("a").each(function () {
			//插入价格
			var tabId = $(this).attr("aria-controls");
			var price = $("#" + tabId).find("td[colspan='4']").removeClass("hidden");
			price.find("label").text('学费总价：￥ '+data);
		});
		coursePrice = data;
	});

}
//课程选择事件变化
function initCheckBoxClick(projectIds){
	//得到所有的tab签
	var projectIds = projectIds.split(',');

	$.each(projectIds,function(i,item) {
		var courseTable = $("#coursetab"+item);
		courseTable.find("input[type=checkbox]").each(function () {
			//绑定click事件
			$(this).bind("click", function () {
				courseCheckboxChange();
				//本tab也的限制
				var numOne = courseTable.find("input[type=checkbox]:checked").length;
				var maxOne = 3;
				if(numOne >= maxOne){
					courseTable.find("input[type=checkbox]").each(function () {
						if($(this).is(':checked')){
							$(this).attr('disabled', false);
						}else{
							//没选中的不让继续选择
							$(this).attr('disabled', true);
						}
					});
				}
			});
		});
	});
}

//所有table的checkbox限制
function courseCheckboxChange(){
	//所有tab限制
	var num = $(".project-tab").find("input[type=checkbox]:checked").length;
	var maxNum = $("#course-num").attr("li-value");

	if(maxNum == 0 && num != 0){
		alert("请先选择课程门数");
		return;
	}

	if(num >= maxNum){
		$("input[type=checkbox]").each(function () {
			if($(this).is(':checked')){
				$(this).attr('disabled', false);
			}else{
				//没选中的不让继续选择
				$(this).attr('disabled', true);
			}
		});
	}else{
		$("input[type=checkbox]").each(function () {
			$(this).attr('disabled', false);
		});
		//得到选中的checkbox框的ids
		var courseIds = [];
		$(".project-tab").find("input[type=checkbox]:checked").each(function(){
			//获得所在tab
			var tableObj = $(this).parents("table:eq(0)");
			var courseId = $(this).val();
			var time = courseTime[courseId];
			//选中后设置其余的不能进行选择
			$.each(courseTime,function(key,value){
				if(key != courseId && value == time){
					//设置为不可用
					tableObj.find("input[value="+key +"]").attr('disabled', true);
				}
			});
		});

	}
}