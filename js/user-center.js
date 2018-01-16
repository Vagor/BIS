
$(function(){
	if(!judgeLogin()){
		window.location.href="login.html";
	}

	var attrs={};
	attrs.studentId=userInfo.id + "";
	attrs.systemType=systemType;

	/**
	 * 个人中心申请步骤初始化
	 */
	dhcc.Unit.ajaxUtil(attrs,"getApplicationStep.json",function(data){
		var step = $("#application-step").find("a");
		//不可用的功能
		for(var i=data+2; i<5; i++){
			$(step[i]).attr("href","#");
		}
		//学生申请激活的步骤
		var stepStatus = $("#step-status").find("li");
		for(var i=0; i<data; i++){
			$(stepStatus[i]).addClass("checked");
		}
	});

	/**
	 * 获取已经完成的
	 */
	dhcc.Unit.ajaxUtil(attrs,"getCompleteOrderList.json",function(data){
		var orders = '<tr> <th>订单编号</th>' +
			'<th>状态</th>' +
			'<th>支付方式</th>' +
			'<th>项目</th>' +
			'<th>课程数目</th>' +
			'<th>住宿</th>' +
			'<th>总价</th> </tr>';
		var courses = '<tr><th>课程时间</th>' +
			' <th>课程代码</th>' +
			'<th>课程名称</th>' +
				//'<th>校区</th> ' +
			'<th>项目名称</th> ' +
			'<th>教室</th> </tr>';
		$.each(data,function(i,order){
			order = removeNull(order);
			orders = orders +
				'<tr><td><label>'+ order.code + '</label></td>'+
				'<td><label>' + order.statusName + '</label></td>'+
				'<td><label>' + order.payTypeName + '</label></td>'+
				'<td><label>' + order.projectNames + '</label></td>'+
				'<td><label>' + order.courseNumber + '</label></td>'+
				'<td><label>' + order.dormitoryNames + '</label></td>'+
				'<td><label>' + order.payMoney + '</label></td></tr>';
			$.each(order.courses,function(j,course){
				course = removeNull(course);
				courses = courses +
					'<tr> <td><label>' + course.startTime + ' -- ' + course.endTime +'</label></td>' +
					'<td><label>' + course.code + '</label></td>' +
					'<td><label>' + course.englishName + '</label></td>' +
						//'<td><label>' +course.schoolName + '</label></td> ' +
					'<td><label>' +course.projectName + '</label></td> ' +
					'<td><label>' +course.classroom + '</label></td> </tr>';
			});
		});

		var orderTable = $($(".table")[0]);
		orderTable.empty();
		orderTable.append(orders);
		var courseTable = $($(".table")[1]);
		courseTable.empty();
		courseTable.append(courses);
	});
});