/*
	beamerJs is a OpenSource JS library for HTML5 presentations which 
	provides almost all LATEX beamer functions.
    Copyright (C) 2010  Christian Ranz <beamerjs@christianranz.com>

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
	currentSlide : 0,
	currentStep : 0,
	prevSlide : -1,
	enableSteps : false,
	tableOfContents : new Array(),
	tableOfContentsSize : 0,
	tocSlideNumber : -1,
	tocSlides : new Array(),
	tocCurrent : 0,
	slideH : 0,
	slideW : 0,
	slides 	: 	new Array(),
	init 	: 	function() {
					this.prepareSlides();
					$(document).keyup(beamerJs.keyEvent);
					if (window.location.hash) {
						var slide = parseInt(window.location.hash.replace('#',''));
						beamerJs.currentSlide = slide;
						
						if (beamerJs.tocSlideNumber < slide && beamerJs.tocSlideNumber != -1) {
							beamerJs.renderSlide(beamerJs.slides[beamerJs.tocSlideNumber]);
							beamerJs.tocCurrent = beamerJs.tocSlides.length - 1;
							beamerJs.hideAllSlides();
						}
						
						beamerJs.renderSlide(beamerJs.slides[slide]);
					}
					else 
						beamerJs.renderSlide(beamerJs.slides[0]);
					beamerJs.hideAllSteps();
					$(window).resize(beamerJs.onResize);
					$(document).click(function(e) {	
						var rightclick;
						if (!e) var e = window.event;
						if (e.which) rightclick = (e.which == 3);
						else if (e.button) rightclick = (e.button == 2);
						
						if (rightclick) { 
							beamerJs.showSlide('prev');
							return false;
						}
						else return beamerJs.showSlide('next');
					});
				},
	prepareSlides : function() {
					var slideCount = 0; 
					$('.slide').each(function() {
						var slide = new Object();
						slide.isTitleSlide = $(this).hasClass('titelslide');
						slide.isTableOfContents = $(this).hasClass('tableofcontents');
						slide.excludeFromTableOfContents = $(this).hasClass('tocexclude') || $(this).hasClass('tableofcontents');
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
					if (beamerJs.enableSteps) {
						if (num == 'next' && beamerJs.currentStep < beamerJs.slides[beamerJs.currentSlide].maxSteps) {
							beamerJs.hideStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep + 1);
							beamerJs.showStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep);
							beamerJs.currentStep = beamerJs.currentStep + 1;
							return;
						}
						if (num == 'prev' && beamerJs.currentStep > 0) {
							beamerJs.hideStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep);
							beamerJs.showStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep - 1);
							beamerJs.currentStep = beamerJs.currentStep - 1;
							return;
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
									beamerJs.currentStep = beamerJs.slides[beamerJs.currentSlide].maxSteps;
								}
							}
						}
					}
					else {
						beamerJs.currentSlide = num;
					}					
					$(beamerJs.slides[beamerJs.prevSlide].self).hide();
					beamerJs.renderSlide(beamerJs.slides[beamerJs.currentSlide]);
					window.location.hash = beamerJs.currentSlide;
					if (beamerJs.enableSteps) {
						beamerJs.showStep(beamerJs.slides[beamerJs.currentSlide], beamerJs.currentStep);
					}
				},
	showStep :	function(slide, step) {
					$(slide.steps[step]).each(function() {
						$(this).show();
					});
				},
	hideStep :	function(slide, step) {
					$(slide.steps[step]).each(function() {
						$(this).hide();
					});
				},
	hideAllSteps : function() {
					if (beamerJs.enableSteps) {
						$('[class^=step]').each(function() {
							$(this).hide();
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
						case 32:
						case 34:
						case 39:
						case 40:
							return beamerJs.showSlide('next');
						
						case 33:
						case 37:
						case 38:
							return beamerJs.showSlide('prev');
					}
				},
	renderSlide : function(slide) {
					
					$('header').show();
					$(slide.self).show();
					$('footer').show();
					beamerJs.sizeSlide(slide);
					
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
						
						if ((tocSlides - parseInt(tocSlides)) > 0)
							tocSlides = parseInt(tocSlides) + 1;

						var start = 0;
						beamerJs.tocSlides = new Array();
						for (var i = 0; i < tocSlides; i++) {							
							beamerJs.tocSlides.push(beamerJs.getTableOfContentsList(itemsPerSlide, start));
							start = start + itemsPerSlide + 1;
						}
						
						$(slide.self).html(beamerJs.tocSlides[beamerJs.tocCurrent]);
						
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
					var winH, winW, slideH, slideW, space, padding , maxPadding, totalHeight;
					
					maxPadding = 15;
					padding = 15;
					
					space = 100;
					
					slideH = 600;
					slideW = 800;
					
					winH = $(window).height();
					winW = $(window).width();
					
					slideH = winH - space;
					
					slideW = ( slideH / 3 ) * 4;
					
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
								var subtitle = beamerJs.slides[i].subtitle;
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
							if (ct < start) {
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
				}
};