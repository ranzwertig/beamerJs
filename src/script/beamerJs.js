/*
beamerJs is a OpenSource JS library for HTML5 presentations which 
provides almost all LATEX beamer functions.

Copyright (C) 2010  Christian Ranz <beamerjs@christianranz.com>
All rights reserved.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
beamerJs = {
	// options
	enableSteps : true,
	autoVCenterContent : false,
	showSlidenumber : false,
	slideNumberContainer : 'body',
	showSlideNavigation : false,
	slideNavigationContainer : 'body',
	slideNavigationControls : 'first,prev,play,pause,next,last',
	hiddenStepsStyle : 'hidden', // hidden, transparent
	hiddenStepsOpacity : 0.3,
	slideTimerDefault : 1,
	enableSlideTimer : false,
	tocMakeLinks : false,
	notificationEnabled : false,
	notificationDuration : 2,
	notificationAnimation : 'slide',
	// internal status
	notificationNumber : 0,
	slideTimer : '',
	slideTimerActive : false,
	slideTimerCurrentDuration : 0,
	currentSlide : 0,
	currentStep : 0,
	prevSlide : -1,
	tableOfContents : new Array(),
	tableOfContentsSize : 0,
	tocSlideNumber : -1,
	tocSlides : new Array(),
	tocCurrent : 0,
	slideH : 0,
	slideW : 0,
	slides : new Array(),
	init : function(options) {
	
					// set options
					beamerJs.enableSteps = options.steps.enabled;
					beamerJs.autoVCenterContent = options.autovcentercontent;
					beamerJs.showSlidenumber = options.slidenumber.enabled;
					beamerJs.slideNumberContainer = options.slidenumber.container;
					beamerJs.showSlideNavigation = options.navigation.enabled;
					beamerJs.slideNavigationContainer = options.navigation.container;
					beamerJs.slideNavigationControls = options.navigation.controls;
					beamerJs.hiddenStepsStyle = options.steps.hiddenstepsstyle;
					beamerJs.hiddenStepsOpacity = options.steps.hiddenstepsopacity
					beamerJs.slideTimerDefault = options.slidetimer.defaultduration;
					beamerJs.enableSlideTimer = options.slidetimer.enabled;
					beamerJs.tocMakeLinks = options.tableofcontents.makelinks;
					beamerJs.motificationEnabled = options.notifications.enabled;
					beamerJs.motificationDuration = options.notifications.duration;
					beamerJs.motificationAnimation = options.notifications.animation;
					// find all slides 
					this.prepareSlides();
					
					// if slide is selected by url hash
					if (window.location.hash) {
						var slide = parseInt(window.location.hash.replace('#',''));
						beamerJs.showSlide(slide);
					}
					else {
						// else render first slide
						beamerJs.showSlide(0);
					}
					
					beamerJs.doShowSlidenumber();
					beamerJs.doShowNavigation();
					
					// hide all steps on all slides
					beamerJs.hideAllSteps();
					
					// bind key, mouse and resize events
					beamerJs.initEvents();
				},
	initEvents : function () {
					$(document).keyup(beamerJs.keyEvent);
					$(window).resize(beamerJs.onResize);
					$(document).click(function(event) {	
					if (event.which == null)
						/* IE case */
						button = (event.button < 2) ? 'LEFT' :
							((event.button == 4) ? 'MIDDLE' : 'RIGHT');
					else
					   /* All others */
					   button = (event.which < 2) ? 'LEFT' :
								 ((event.which == 2) ? 'MIDDLE' : 'RIGHT');

						
						if (button == 'RIGHT') { 
							beamerJs.showSlide('prev');
							return false;
						}
						else return beamerJs.showSlide('next');
					});
					$(document).bind('dblclick',function() {
						return false;
					});
				},
	prepareSlides : function() {
					var slideCount = 0; 
					$('.slide').each(function() {
						var slide = new Object();
						slide.isTitleSlide = $(this).hasClass('titelslide');
						slide.isTableOfContents = $(this).hasClass('tableofcontents');
						slide.excludeFromTableOfContents = $(this).hasClass('tocexclude') || $(this).hasClass('tableofcontents');
						slide.duration = beamerJs.getSlideDuration($(this).attr('class'));
						if (slide.isTableOfContents) beamerJs.tocSlideNumber = slideCount;
						slide.self = this;
						slide.title = $(this).children('.title').html();
						slide.subtitle = $(this).children('.subtitle').html();
						slide.content = $(this).html();
						slide.steps = beamerJs.getSlideSteps(this);
						slide.currentStep = 0;
						slide.maxSteps = slide.steps.length;
						beamerJs.slides.push(slide);
						slideCount++;
					});
				},
	getSlideSteps : function (slide) {
					var steps = new Array();
					var empty = new Array();
					empty.push('_empty_');
					var cSteps = new Array();
					var maxSteps = 0;
					$(slide).find('.step').each(function(i) {
						var step = new Array();
						step.push(this);
						step = step.concat(cSteps);
						steps[i] = step;
						cSteps.push(this);
						maxSteps = maxSteps +1;
					});
					$(slide).find('[class^=step_]').each(function() {
						var attr = $(this).attr('class').split('_');
						var range = attr[1].split('-');
						if (range[1] != '' && range[1] > maxSteps)
							maxSteps = range[1];
					});
					$(slide).find('[class^=step_]').each(function() {
						var attr = $(this).attr('class').split('_');
						var range = attr[1].split('-');
						if (range[1] != '') {
							for (var i = range[0]; i <= range[1]; i++) {
								if (typeof steps[i] == 'undefined') {
									steps[i] = new Array();
									steps[i] = steps[i].concat(cSteps);
								}
								steps[i].push(this);
							}
						}
						if (range[1] == '') {
							for (var i = range[0]; i <= maxSteps; i++) {
								if (typeof steps[i] == 'undefined') {
									steps[i] = new Array();
									steps[i] = steps[i].concat(cSteps);
								}
								steps[i].push(this);
							}
						}
					});
					steps = empty.concat(steps);
					return steps;
				},
	showSlide :	function(num) {
					beamerJs.stopSlideTimer();
					if (beamerJs.enableSteps) {
						if (num == 'next' && beamerJs.currentStep < beamerJs.slides[beamerJs.currentSlide].maxSteps -1 && beamerJs.slides[beamerJs.currentSlide].maxSteps > 1) {
							beamerJs.hideStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep);
							beamerJs.showStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep + 1);
							beamerJs.currentStep = beamerJs.currentStep + 1;
							beamerJs.startSlideTimer((beamerJs.slides[beamerJs.currentSlide].duration));
							return false;
						}
						if (num == 'prev' && beamerJs.currentStep > 0 && beamerJs.slides[beamerJs.currentSlide].maxSteps > 1) {
							beamerJs.hideStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep);
							beamerJs.showStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep - 1);
							beamerJs.currentStep = beamerJs.currentStep - 1;
							return false;
							beamerJs.startSlideTimer((beamerJs.slides[beamerJs.currentSlide].duration));

						}
					}
					beamerJs.prevSlide = beamerJs.currentSlide;
					if (num == 'next') {
						if (beamerJs.slides[beamerJs.currentSlide].isTableOfContents && beamerJs.tocCurrent < beamerJs.tocSlides.length - 1) {
							beamerJs.tocCurrent++;
						}
						else {
							if (beamerJs.currentSlide < beamerJs.slides.length -1) {
								beamerJs.currentSlide = beamerJs.currentSlide + 1;
								beamerJs.currentStep = 0;
							}
						}
					}
					else if (num == 'prev') {
						if (beamerJs.slides[beamerJs.currentSlide].isTableOfContents && beamerJs.tocCurrent > 0) {
							beamerJs.tocCurrent--;
						}
						else {
							beamerJs.currentSlide = beamerJs.currentSlide - 1;
							if (beamerJs.currentSlide < 0) {
								beamerJs.currentSlide = 0;	
								beamerJs.currentStep = 0;
							}
							else {
								if (beamerJs.enableSteps) {
									beamerJs.currentStep = beamerJs.slides[beamerJs.currentSlide].maxSteps - 1;
								}
							}
						}
					}
					else {
						beamerJs.currentSlide = num;
						// set toc when slide is changed by slidenumber
						if (beamerJs.tocSlideNumber < num && beamerJs.tocSlideNumber != -1) {
							beamerJs.renderSlide(beamerJs.slides[beamerJs.tocSlideNumber]);
							beamerJs.tocCurrent = beamerJs.tocSlides.length - 1;
							beamerJs.hideAllSlides();
						}
						else if (beamerJs.tocSlideNumber > num) {
							beamerJs.tocCurrent = 0;
						}
					}					
					$(beamerJs.slides[beamerJs.prevSlide].self).hide();
					beamerJs.renderSlide(beamerJs.slides[beamerJs.currentSlide]);
					window.location.hash = beamerJs.currentSlide;
					if (beamerJs.enableSteps) {
						beamerJs.showStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep);
					}
					beamerJs.startSlideTimer((beamerJs.slides[beamerJs.currentSlide].duration));
					return false;
				},
	showStep :	function(slide, step) {
					$(slide.steps[step]).each(function() {
						if (beamerJs.hiddenStepsStyle == 'hidden') {
							$(this).show();
						}
						else if (beamerJs.hiddenStepsStyle == 'transparent') {
							$(this).show();
							$(this).css('opacity', 1);
						}
					});
				},
	hideStep :	function(slide, step) {
					$(slide.steps[step]).each(function() {
						if (beamerJs.hiddenStepsStyle == 'hidden') {
								$(this).hide();
							}
							else if (beamerJs.hiddenStepsStyle == 'transparent') {
								$(this).show();
								$(this).css('opacity', beamerJs.hiddenStepsOpacity);
							}
					});
				},
	hideAllSteps : function() {
					if (beamerJs.enableSteps) {
						$('[class^=step]').each(function() {
							if (beamerJs.hiddenStepsStyle == 'hidden') {
								$(this).hide();
							}
							else if (beamerJs.hiddenStepsStyle == 'transparent') {
								$(this).show();
								$(this).css('opacity', beamerJs.hiddenStepsOpacity);
							}
						});
					}
				},
	hideAllSlides : function () {
					for (slide in beamerJs.slides) {
						$(beamerJs.slides[slide].self).hide();
					}
				},
	keyEvent :	function(e) {
					switch (e.keyCode) {
						case 32: // space
						case 34: // page down
						case 39: // right arrow
						case 40: // down arrow
							return beamerJs.showSlide('next');
						
						case 33: // page up
						case 37: // left arrow
						case 38: // up arrow
							return beamerJs.showSlide('prev');
					}
				},
	renderSlide : function(slide) {
					
					$('header').show();
					$(slide.self).show();
					$('footer').show();
					beamerJs.sizeSlide(slide);
					// update slidenumer on slide change
					beamerJs.doShowSlidenumber();
					if (slide.isTitleSlide) {
						$(slide.self).find('.title').show();
						$(slide.self).find('.subtitle').show();
						$('#title').html('');
						$('#subtitle').html('');
					}
					else if (slide.isTableOfContents) {
						$(slide.self).html(beamerJs.getTableOfContentsList(999, 0));
						
						var overflow = beamerJs.hasOverflow(slide.self);
						var totalH = overflow + beamerJs.slideH;
						var itemH = totalH / beamerJs.tableOfContentsSize;
						var itemsPerSlide = Math.round(beamerJs.slideH / itemH);
						
						var tocSlides = beamerJs.tableOfContentsSize / itemsPerSlide;
						
						if ((tocSlides - parseInt(tocSlides)) > 0 && itemsPerSlide < beamerJs.tableOfContentsSize)
							tocSlides = parseInt(tocSlides) + 1;

						var start = 0;
						beamerJs.tocSlides = new Array();
						for (var i = 0; i < tocSlides; i++) {							
							beamerJs.tocSlides.push(beamerJs.getTableOfContentsList(itemsPerSlide, start));
							start = start + itemsPerSlide - 1;
						}
						
						$(slide.self).html(beamerJs.tocSlides[beamerJs.tocCurrent]);
						
						if (beamerJs.tocMakeLinks)
							$('.navigation-link').click(function() {
								var targetSlide = parseInt($(this).attr('href').replace('#',''));
								beamerJs.showSlide(targetSlide);
								return false;
							});
						
						$('#title').html('');
						$('#subtitle').html('');
						
						$('#title').html(slide.title);
						$('#subtitle').html(slide.subtitle);
						
					}
					else {
						$('#title').html(slide.title);
						$('#subtitle').html(slide.subtitle);
					}
					
				},
	sizeSlide : function(slide) {
					var winH, winW, slideH, slideW, space, padding , maxPadding, totalHeight, ratio;
					
					maxPadding = 15;
					padding = 15;
					
					space = 100;
					
					slideH = 600;
					slideW = 800;
					
					winH = $(window).height();
					winW = $(window).width();
					
					if (beamerJs.slideH > winH || beamerJs.slideH < winH - space) {
						slideH = winH - space;
						slideW = ( ( winH - space ) / 3 ) * 4;
					}
					
					padding = padding * (winH / 600);
					padding = (padding > maxPadding)?maxPadding:padding;
					
					$('header').css('padding', padding);
					$('footer').css('padding', padding);
					$(slide.self).css('padding', padding);
					$(slide.self).css('padding-left', padding * 2);
					$(slide.self).css('padding-right', padding * 2);
					beamerJs.slideW = slideW - padding * 4;
					$(slide.self).css('width', beamerJs.slideW);
					beamerJs.slideH = slideH - ( slideH * 0.09 ) - ( slideH * 0.1 ) - padding * 2;
					$(slide.self).css('height', beamerJs.slideH);
					
					$('footer').css('height', slideH * 0.09 - padding * 2);
					$('header').css('height', slideH * 0.1 - padding * 2);
					
					$('footer').css('width', slideW - padding * 2);
					$('header').css('width', slideW - padding * 2);
					
					totalHeight = parseFloat($('footer').css('height')) + parseFloat($('header').css('height')) + parseFloat($(slide.self).css('height')) + padding * 6;
					space = winH - totalHeight;
					$(slide.self).css('margin', '0 auto');
					$('footer').css('margin', '0 auto');
					$('header').css('margin', '0 auto');
					
					$('body').css('padding-top', space / 2);
					$('body').css('height', winH - space / 2);
					$('body').css('font-size', (winH / 600) - 0.2 + 'em');
					
					if (beamerJs.autoVCenterContent) {
						var children = $(slide.self).children();
						$(slide.self).html('');
						var wrapper = $('<div class="wrapper"></div>');
						$(wrapper).appendTo(slide.self);
						$(wrapper).append(children);
						
						beamerJs.showStep(slide, slide.maxSteps - 1);
						var wrapperHeight = $(wrapper).height();
						beamerJs.hideStep(slide,  slide.maxSteps - 1);
						
						var offset = parseInt(( beamerJs.slideH / 2 ) - ( wrapperHeight / 2));
						
						if (slide.isTitleSlide)
							offset = offset - slideH * 0.1 - padding * 2;
						
						$(wrapper).css('margin-top',offset);
					}
					
				},
	onResize : function() {
					beamerJs.sizeSlide(beamerJs.slides[beamerJs.currentSlide]);
				},
	generateTableOfContents : function () {
					var titles = new Array();
					var count = 0;
					for (var i = 0; i < beamerJs.slides.length; i++) {
						if (typeof beamerJs.slides[i].title != 'undefined' && beamerJs.slides[i].title != null && !beamerJs.slides[i].excludeFromTableOfContents) {
							var title = beamerJs.slides[i].title;
							if (typeof titles[title] == 'undefined') {
								titles[title] = new Array();
								count++;
							}
							if (typeof beamerJs.slides[i].subtitle != 'undefined' && beamerJs.slides[i].subtitle != null) {
								var subtitle = new Object();
								subtitle.text = beamerJs.slides[i].subtitle;
								subtitle.slide = i;								
								titles[title].push(subtitle);
								count++;
							}
						}
					}
					beamerJs.tableOfContents = titles;
					beamerJs.tableOfContentsSize = count;
					return titles;
				},
	getTableOfContentsList : function(max, start) {
					var toc = beamerJs.generateTableOfContents();
					
					if (start > 0) {
						var ct = 0;
						for (title in toc) {
							var sub = toc[title];
							for (var s = 0; s < sub.length; s++) {
								if (ct < start) {
									sub.splice(s,1);
									ct++;
									s--;
								}
							}
							if (ct < start || toc[title].length == 0) {
								delete toc[title];
								ct++;
							}
						}
					}
					var list = '<ul class="thetableofcontents">';
					
					var count = 0;
					
					for (title in toc) {
						if (count == max) break;
						var li = '<li>' + title;
						count++;
						if (toc[title].length > 0) {
							li += '<ul>';
							var subtitles = toc[title];
							for (var i = 0; i < subtitles.length; i++) {
								if (count == max) break;
								if (beamerJs.tocMakeLinks) 
									li += '<li><a href="#' + subtitles[i].slide + '" class="navigation-link">' + subtitles[i].text + '</a></li>';
								else
									li += '<li>' + subtitles[i] + '</li>';
								count++;
							}
							li += '</ul>';
						}
						li += '</li>';
						list += li;
					}
					list += '</ul>'
					return list;
				},
	hasOverflow : function(element) {
					var curOverflow = $(element).css('overflow');
					if ( !curOverflow || curOverflow === "hidden" )
					  $(element).css('overflow', 'visible');
					var hasOverflow = element.scrollHeight > beamerJs.slideH;
					$(element).css('overflow', curOverflow);
					if (hasOverflow)
						return element.scrollHeight - beamerJs.slideH;
					else
						return 0;
				},
	objectLength : function(obj) {
					var i = 0;
					for (z in obj)
						i++;
					return i;
				},
	doShowSlidenumber : function() {
					if (beamerJs.showSlidenumber) {
						if (!$('#slidenumber').length) {
							var number = '<span id="slidenumber">' + (beamerJs.currentSlide + 1) + "/" + beamerJs.slides.length + '</span>';
							$(beamerJs.slideNumberContainer).append(number);
						}
						else {
							$('#slidenumber').html((beamerJs.currentSlide + 1) + "/" + beamerJs.slides.length);
						}
					}
				},
	doShowNavigation : function() {
					if (beamerJs.showSlideNavigation) {
						beamerJs.slideNavigationContainer;
						beamerJs.slideNavigationControls;
						if (!$('#navigation').length) {
							$(beamerJs.slideNavigationContainer).append('<span id="navigation"></span>');
							var controls = beamerJs.slideNavigationControls.split(',');
							for (item in controls) {
								var ctrl = controls[item];
								$('#navigation').append('<span title="' + ctrl.replace('ctrl_','') + '" id="' + ctrl + '" class="navigation-control"></span>');
								$('#' + ctrl).click(function() {
									var action = $(this).attr('id');
									switch (action) {
										case 'ctrl_first': beamerJs.showSlide(0);break;
										case 'ctrl_prev':beamerJs.showSlide('prev');break;
										case 'ctrl_start':beamerJs.showNotification('Slidetimer started');beamerJs.enableSlideTimer = true;beamerJs.startSlideTimer(beamerJs.slides[beamerJs.currentSlide].duration);break;
										case 'ctrl_stop':beamerJs.showNotification('Slidetimer stopped');beamerJs.stopSlideTimer();beamerJs.enableSlideTimer = false;break;
										case 'ctrl_next':beamerJs.showSlide('next');break;
										case 'ctrl_last':beamerJs.showSlide(beamerJs.slides.length - 1);break;
										case 'ctrl_tableofcontents':beamerJs.tocCurrent = 0;beamerJs.showSlide(beamerJs.tocSlideNumber);break;
									}
									
									// return false to stop event chain
									return false;
								});
							}
						}
					}
				},
	getSlideDuration : function(classString) {
					// if duration class is defined
					var duration = /duration-(\d+)/;
					var result = duration.exec(classString);
					if (result) {
						return parseInt(result[1]);
					}	
					else {
						// if the duration is not defined return the default
						return beamerJs.slideTimerDefault;
					}
				},
	startSlideTimer : function(duration) {
					if (!beamerJs.slideTimerActive && beamerJs.enableSlideTimer) {
						beamerJs.slideTimerCurrentDuration = duration;
						beamerJs.slideTimerActive = true;
						beamerJs.doSlideTimerTick();
					 }
				},
	stopSlideTimer : function() {
					if (beamerJs.slideTimerActive && beamerJs.enableSlideTimer) {
						clearTimeout(beamerJs.slideTimer);
						beamerJs.slideTimerActive = false;
					}
				},
	doSlideTimerTick : function() {
					if (beamerJs.enableSlideTimer) {
						beamerJs.slideTimer = setTimeout('beamerJs.doSlideTimerTick()', 1000);
						beamerJs.slideTimerCurrentDuration--;
						if (beamerJs.slideTimerCurrentDuration == 0) {
						 beamerJs.stopSlideTimer();
						 if (beamerJs.currentSlide >= beamerJs.slides.length -1) {
							beamerJs.enableSlideTimer = false;
						 }
						 beamerJs.showSlide('next');
						}
					}
				},
	showNotification : function(text, nclass) {
					var nid = 'notification-' + beamerJs.notificationNumber;
					var notification = '<div id="' + nid + '" class="notification ' + nclass + '" style="display:none;">' + text + '</div>' 
					$('body').append(notification);
					$('#'+nid).fadeIn('slow');
					setTimeout('$(\'#' + nid + '\').fadeOut(\'slow\')', beamerJs.notificationDuration * 1000);					
					beamerJs.notificationNumber++;
				}
};