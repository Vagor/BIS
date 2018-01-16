$(function() {
	$(".banner").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:true,autoPlay:true,trigger:"click",effect:"fold",delayTime:1000,interTime:5000,triggerTime:0,mouseOverStop:false});
	$(".professor").slide({trigger:"click",effect:"left",autoPlay:true,interTime:2000,triggerTime:0});
	$(".nav-tabs li").hover(function(){$(this).find("em").slideToggle(100);});
	$(function() {
		var initTop = 0;
		$(window).scroll(function() {
		 	var scrollTop = $(document).scrollTop();
		 	if(scrollTop > initTop) {
		 		$("#fixedMenu").addClass("top-scroll").parents("body").addClass("scroll");
		 	} else {
		 		$("#fixedMenu").removeClass("top-scroll").parents("body").removeClass("scroll");
		 	}
		 	initTop = scrollTop;
		});
	    $("a.to-a-link").click(function() {
	        $("html, body").animate({
	            scrollTop: $($(this).attr("href")).offset().top + "px"
	        }, {
	            duration: 500,
	            easing: "swing"
	        });
	        return false;
	    });
	    $(".banner .bd ul").css({width:"100%",height:"100%"});
		$(".banner .bd li").css({width:"100%",height:"100%"});
	});
	window.onscroll = function() {
		var sl = -Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
		document.getElementById('fixedMenu').style.left = sl + 'px';
	}
	$('[data-toggle="tooltip"]').tooltip();
	$(".course-list-faculty").hover(function(){
		$(".faculty-info").hide();
		var obj = $(this);
		var len = obj.children().length;
		var me = obj.children().eq(0);
		var name = me.text();
		console.log(len);
		$.ajax({ url: "/p.php", data:{name:name}, success: function(data){
			if(len==1){
				obj.append(data);
			}
			obj.find(".faculty-info").fadeIn(100);
		}});
		
	},function(){
		$(this).find(".faculty-info").fadeOut(100);
	});
});