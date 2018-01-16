var termOrder;
$(function(){
	if(!judgeLogin()){
		return;
	}

	/**
	 * 加载订单信息
	 */
	var attrs={};
	attrs.studentId=userInfo.id + "";
	attrs.systemType=systemType;
	/**
	 * 获取我的订单
	 */
	dhcc.Unit.ajaxUtil(attrs,"getOrderList.json",function(data){
		termOrder = data;
		var term = $("#term").next();
		var termLi = '';
		//初始化学期
		if(data != null){
			$.each(termOrder,function(key,item){
				termLi = termLi +
					'<li>' + key + '</li>';
			});
		}
		term.empty();
		term.append(termLi);
		initSelect();

		//默认选中第一个学期
		if(termLi != ''){
			term.find("li:first").click();
		}
	});
})

//初始化select方法
function initSelect(onChange){
	$(".dropdown-select li").click(function() {
		if ($(this).attr("class") !="disabled") {
			var txt = $(this).text();
			var oldText = $(this).parent().prev().val();
			$(this).parent().prev().val(txt);
			var cl = $(this).attr("aria-id");
			$("#" + cl).show().siblings().hide();
			if(txt != oldText){
				changeTerm(txt);
			}
		}
	});
}

function changeTerm(term){
	var termOrders = termOrder[term];
	var orders = '<tr> <th>订单编号</th>' +
		'<th>状态</th>' +
		'<th>支付方式</th>' +
		'<th>项目</th>' +
		'<th>课程数目</th>' +
		'<th>住宿</th>' +
		'<th>总价</th> </tr>';
	var courses = '<tr> <th>课程代码</th>' +
		'<th>课程名称</th>' +
		'<th>校区</th> </tr>';
	$.each(termOrders,function(i,order){
		order = removeNull(order);
		orders = orders +
			'<tr><td><label>'+ order.code + '</label></td>'+
			'<td><label>' + order.statusName + '</label></td>'+
			'<td><label>' + order.payTypeName + '</label></td>'+
			'<td><label>' + order.projectNames + '</label></td>'+
			'<td><label>' + order.courseNumber + '</label></td>'+
			'<td><label>' + order.dormitoryNames + '</label></td>'+
			'<td><label>' + order.payMoney + '</label></td></tr>';
		$.each(order.courses,function(ii,course){
			course = removeNull(course);
			courses = courses +
				'<tr> <td><label>' + course.code + '</label></td>' +
				'<td><label>' + course.englishName + '</label></td>' +
				'<td><label>' +course.schoolName + '</label></td> </tr>';
		});

	});
	var orderTable = $($(".table")[0]);
	orderTable.empty();
	orderTable.append(orders);

	var courseTable = $($(".table")[1]);
	courseTable.empty();
	courseTable.append(courses);
}