
$(function(){
	if(!judgeLogin()){
		window.location.href="login.html";
	}

	var attrs={};
	attrs.studentId=userInfo.id + "";
	attrs.systemType=systemType;
	/**
	 * 获取我的已经完成的订单
	 */
	dhcc.Unit.ajaxUtil(attrs,"getCompleteOrderList.json",function(data){
		var orderCode = $("#order-code").next();
		var orderCodeLi = '';
		$.each(data,function(i,item){
			orderCodeLi = orderCodeLi +
				'<li li-value="'+ item.id +'">' + item.code + '</li>';
		});

		if(orderCodeLi != ''){
			orderCode.empty();
			orderCode.append(orderCodeLi);
			initSelect();
			orderCode.find("li:first").click();
		}
	});

	$("#refund-button").bind("click",function(){
		var params = $("#data-form").serializeJson();
		params.id = $("#order-code").attr("li-value");
		var refundType = $("input[name=refundType]").attr("li-value");
		params.refundType = refundType;
		if(refundType == '1'){
			//收款人
			params.payee = $("#bank-payee").val();

		}else if(refundType == '2'){
			//收款人
			params.payee = $("#alipay-payee").val();
		}else{

		}
		params.studentId=userInfo.id + "";
		params.systemType=systemType;
		console.log(params);

		/**
		 * 提交退款
		 */
		dhcc.Unit.ajaxUtil(params,"refundOrder.json",function(data){
			dhcc.Unit.successMessage("提交成功",function(){
				//页面进行跳转
				window.location.href = "user_center.html";
			});
		});
	});
});

//初始化select方法
function initSelect(){
	//var orderCode = $("#order-code");
	$(".dropdown-select li").click(function() {
		if ($(this).attr("class") !="disabled") {
			var txt = $(this).text();
			var key = $(this).attr("li-value");
			var oldKey = $(this).parent().prev().attr("li-value");
			$(this).parent().prev().val(txt);
			$(this).parent().prev().attr("li-value",key);
		}
	});
}