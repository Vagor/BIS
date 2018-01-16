
$(function(){
	if(!judgeLogin()){
		window.location.href="login.html";
	}

	initOrderPage();
	$("#modal-pay li").bind("click", function(){
		if($(this).attr("aria-id") == "refundWayWechat"){
			var params = {"orderId":payOrderId+"", "systemType":systemType};
			var imgHref = encodeURI(rootPath + 'payment/getWechatCode.json?params=' + JSON.stringify(params) + '&accessToken='+accessToken);
			$("#refundWayWechat").find("img").attr("src", imgHref);
			setInterval("confirmOrderFinish("+payOrderId+")",3000);

		}else if($(this).attr("aria-id") == "refundWayAlipay"){
			var params = {"orderId":payOrderId+"", "systemType":systemType};
			var imgHref = encodeURI(rootPath + 'payment/getAipayCode.json?params=' + JSON.stringify(params) + '&accessToken='+accessToken);
			$("#refundWayAlipay").find("img").attr("src", imgHref);
			setInterval("confirmOrderFinish("+payOrderId+")",3000);

		}
	})

	$("#canclBtn").bind("click", function(){
		dhcc.Unit.hideModal("modal-pay");
		initOrderPage();
	})
});

function initOrderPage(){
	/**
	 * 加载订单信息
	 */
	var attrs={};
	attrs.studentId=userInfo.id + "";
	attrs.systemType=systemType;
	attrs.orderStatus="1";
	/**
	 * 获取我的订单
	 */
	dhcc.Unit.ajaxUtil(attrs,"getOrderList.json",function(data){
		$("#orderTable tr:gt(0)").remove();
		if(data){
			var html = "";
			for(var name in data){
				var objs = data[name];
				for(var i=0; i<objs.length; i++){

					var obj = objs[i];
					obj = removeNull(obj);
					html = html +
						'<tr><td><label>'+ obj.code + '</label></td>'+
						'<td><a class="btn btn-xs btn-danger" onclick="selectPayWay('+obj.id+')">未支付</a></td>'+
						'<td><label>' + obj.payTypeName + '</label></td>'+
						'<td><label>' + obj.projectNames + '</label></td>'+
						'<td><label>' + obj.courseNumber + '</label></td>'+
						'<td><label>' + obj.dormitoryNames + '</label></td>'+
						'<td><label>' + obj.payMoney + '</label></td></tr>';
				}
			}
			$("#orderTable").append(html);
		}
	});

}

function  selectPayWay(id){
	payOrderId = id;
	$("#selectPayWay").click();
	$("#modal-pay li:first").click();
}

function confirmOrderFinish(orderId){
	var attrs = {};
	attrs.studentId=userInfo.id + "";
	attrs.systemType=systemType;
	attrs.orderStatus="2";
	attrs.orderId=orderId+"";
	dhcc.Unit.ajaxUtil(attrs,"getOrderList.json",function(data){
		if(data && !isEmptyObject(data)){
			dhcc.Unit.hideModal("modal-pay");
			dhcc.Unit.successMessage("支付成功",function(){
				//页面进行跳转
				window.location.href = "user_center.html";
			});
		}
	})
}
