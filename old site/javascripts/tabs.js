/*
 * Skeleton V1.1
 * Copyright 2011, Dave Gamache
 * www.getskeleton.com
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 8/17/2011
 */
$(document).ready(function () {

	function init() {
		var height = $(window).height();
		if (window.location.hash)
			navigateTo(window.location.hash);
		else
			navigateTo('start');
	}
	$('#sendButton').live('click', function () {
		var _from = $('input[name="from"]');
		var _subject = $('input[name="subject"]');
		var _message = $('textarea[name="message"]');
		$.ajax({
			url : "mail.php",
			type : 'POST',
			data : {
				from : _from.val(),
				subject : _subject.val(),
				message : _message.val()
			},
			success : function () {
				_from.val('');
				_subject.val('');
				_message.val('');
				alert('Your message has been sent');
			}
		});
	});

	$('body').on('click', 'ul.tabs > li > a', function (e) {

		//Get Location of tab's content
		var contentLocation = $(this).attr('href');
		//Let go if not a hashed one
		if (contentLocation.charAt(0) == "#") {
			navigateTo(contentLocation, this, e);
			window.location.hash = contentLocation;
		}
	});

	var navigateTo = function (contentLocation, _this, e) {
		if (e)
			e.preventDefault();
		else {
			_this = $('body ul.tabs > li > a[href=' + contentLocation + ']');
		}

		var contentToLoad = contentLocation.replace(/^#*/, '');
		var basePath = "pages/" + contentToLoad;
		contentLocation = basePath + ".json";

		$.ajax({
			url : contentLocation
		}).done(function (data) {
			var template = $('[data-template-' + contentToLoad + ']').text();
			//var json = JSON.parse(data);
			var json = data;
			console.log(json);
			var html = Mustache.to_html(template, json);
			$('#contentArea').html(html);

			var height = $('#contentArea').height();
		    //Make Tab Active
			$(_this).parent().siblings().children('a').removeClass('active');
			$(_this).addClass('active');
		});
	};
	$(this).addClass('active');

	init();
});
