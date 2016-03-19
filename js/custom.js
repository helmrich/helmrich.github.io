/*
 * Add smooth scroll
 *****************************/

$(function() {
	$('a[href*="#"]:not([href="#"])').click(function() {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html, body').animate({
					scrollTop: target.offset().top - 50
				}, 1000);
				return false;
			}
		}
	});
});

/*
 * Hide mobile navigation when user clicks a
 * link in the navigation
 *****************************/

$('#navOverlay ul a').click(function() {
	$('#hideNav').prop('checked', true);
});

/*
 * Wow.js
 *****************************/

new WOW().init();

/*
 * Sticky.js
 *****************************/

$("header").sticky({
    topSpacing: 0,
	className: 'sticky'
});
