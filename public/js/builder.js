/* eslint-disable no-undef */
async function load(project, version, creditsObject) {

	async function gotCredits(data) {
		images = data.images
		content = data.content
		settings = data.globalSettings
		fonts = typeof globalFonts !== 'undefined' ? [...new Set ([...globalFonts, ...data.fonts])]: data.fonts
		await buildCredits(content)
		updateSettings()
		if (typeof sendDuration !== 'undefined') {
			sendDuration()
		}
		$('#creditsFooter').first().click()
	}

	currentProject = project
	$('#loadFile').val(currentProject)
	$('#uploadFileBut').val(currentProject)
	if (typeof Cookies !== 'undefined') {
		Cookies.set('project', currentProject, { secure: true, SameSite: 'Lax' })
	}
	let versionString = String($('#loadFile').find(':selected').data('versions'))
	let versions = []
	versions = versionString.split(',')

	if (typeof version === 'undefined') {
		currentVersion = versions.length
	} else {
		currentVersion = version
	}

	$('#loadVersion').html('')
	for (var i = 0; i < versions.length; i++) {
		$('#loadVersion').prepend($('<option value=\''+versions[i]+'\'>'+versions[i]+'</option>'))
	}

	$('#loadFileBut').val(currentProject)
	$('#loadVersion').val(currentVersion)
	$load = $('#loadVersionBut')
	$load.html('')
	for (var j = 0; j < versions.length; j++) {
		$load.append($('<option value=\''+versions[j]+'\'>'+versions[j]+'</option>'))
	}
	$load.append($('<option value=\'new\'>New Version</option>'))

	let $footer = $('#creditsFooter')
	$footer.data('tabs', 0)
	$footer.html('<button id="newArticle">+</button>')
	if (typeof creditsObject !== 'undefined') {
		await gotCredits(creditsObject)
	} else {
		await $.get(`save?project=${currentProject}&version=${currentVersion}`)
			.then(async function(data) {
				await gotCredits(data)
			}).fail(function(data) {
				const returnData = JSON.parse(data.responseText)
				alert('Couldn\'t get requested file: '+JSON.stringify(returnData, '', 4))
			})
	}
	loaded = true
	console.log(`${currentProject} version ${currentVersion} loaded`)
}

function updateSettings() {
	$('#settingsCSS').remove()
	let $settings = $('<style id=\'settingsCSS\' type=\'text/css\'></style>')
	let style = $settings[0]
	$('head').append($settings)
	for (var setting in settings) {
		if (settings.hasOwnProperty(setting)) {
			let rulesTxt = ''
			let rules = settings[setting]
			for (var rule in rules) {
				if (rules.hasOwnProperty(rule)) {
					rulesTxt += rule+':'+rules[rule]+';'
				}
			}
			if (!(style.sheet || {}).insertRule) {
				(style.styleSheet || style.sheet).addRule('.'+setting, rulesTxt)
			} else {
				style.sheet.insertRule('.'+setting+'{'+rulesTxt+'}',0)
			}
		}
	}
	console.log($('#mainBody'))
	if (isLight(window.getComputedStyle($('#mainBody')[0]).backgroundColor)) {
		$('html').addClass('light')
	} else {
		$('html').removeClass('light')
	}
}

function isLight(color) {
	var r, g, b, hsp
	if (color.match(/^rgb/)) {
		color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)
		r = color[1]
		g = color[2]
		b = color[3]
	}
	else {
		color = +('0x' + color.slice(1).replace(
			color.length < 5 && /./g, '$&$&'))
		r = color >> 16
		g = color >> 8 & 255
		b = color & 255
	}
	hsp = Math.sqrt(
		0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
	)
	if (hsp>127.5) {
		return true
	} else {
		return false
	}
}

/* Builder */

async function buildCredits(content) {
	let active = ' active'
	const $cont = $('#creditsCont')
	if (settings.namesFlipped == true) $cont.attr('data-flipped', 'true')
	if (settings.roleFlipped == true) $cont.attr('data-rolealign', 'true')
	if (settings.nameFlipped == true) $cont.attr('data-namealign', 'true')
	$cont.html('')
	const $footer = $('#creditsFooter')
	content.forEach(article => {
		const name = typeof article.name !== 'undefined' ? article.name : article.type
		const trackWidth = typeof article.trackWidth !== 'undefined' ? article.trackWidth : 1152
		const trackWidthVW = trackWidth/1920 * 100
		const trackAlign = typeof article.trackAlign !== 'undefined' ? article.trackAlign : 9
		const backgroundImage = typeof article.backgroundImage !== 'undefined' ? article.backgroundImage : 'None'
		const backgroundAlign = typeof article.backgroundAlign !== 'undefined' ? article.backgroundAlign : false
		const $tab = $(`<button class="tabButton${active}">${name}</button>`)
		$footer.append($tab)
		const html = renderBlocks(article.blocks)
		const $content = $(`<article
      class="creditsSection blockContainer${active}"
      data-type="${article.type}"
      data-name="${name}"
      data-duration="${article.duration}">
        ${html}
    </article>`)
		$content.attr('data-trackAlign', trackAlign)
		$content.attr('data-trackWidth', trackWidth)
		$content.attr('data-backgroundAlign', backgroundAlign)
		$content.attr('data-backgroundImage', backgroundImage)
		$content.css('width', trackWidthVW+'vw')
		$content.css('--background-size', trackWidthVW+'vw')
		$content.css('padding-left', `calc(${trackAlign-1} * (100% - ${trackWidthVW}vw)/16)`)
		$content.css('padding-right', `calc(${17-trackAlign} * (100% - ${trackWidthVW}vw)/16)`)
		$content.css('--background-position-x', `calc(${100*((trackAlign-1)/16)}%)`)
		if (backgroundImage == 'None') {
			$content.css('--background-image', '')
		} else {
			const path = template ? '../' : `../${sitePath}saves/${currentProject}/`
			$content.css('--background-image', `url('${path}images/${backgroundImage}')`)
		}
		active = ''
		$cont.append($content)
	})
	let imagesPromises = []
	$('img').each(function() {
		$img = $(this)
		const imagePromise = new Promise((resolve)=>{
			$img.one('load', function() {
				resolve()
			})
			if(this.complete) {
				$(this).trigger('load')
			}
		})
		imagesPromises.push(imagePromise)
	})
	await Promise.all(imagesPromises)
}

function renderBlocks(blocks) {
	let html = ''
	blocks.forEach(block => {
		const flipped = block.namesFlipped == true ? 'data-flipped=\'true\'' : ''
		const roleFlip = block.roleFlipped == true ? 'data-rolealign=\'true\'' : ''
		const nameFlip = block.nameFlipped == true ? 'data-namealign=\'true\'' : ''
		html += `<section class="block" data-direction="${block.type}" ${flipped} ${roleFlip} ${nameFlip}>`
		block.content.forEach(content => {
			html += renderContent(content)
		})
		html += '</section>'
	})
	return html
}

function renderContent(content) {
	let subHtml = ''
	let style = ''
	if (typeof content.settings !== 'undefined' && Object.values(content.settings).length > 0) {
		style = 'style="'
		for (const property in content.settings) {
			if (Object.hasOwnProperty.call(content.settings, property)) {
				const value = content.settings[property]
				style += `${property}: ${value};`
			}
		}
		style += '"'
	}
	switch (content.type) {
	case 'columns': {
		const columns = content.columns || 'Full'
		subHtml += `<div ${style} class='content columns blockContainer cols${columns}' data-type='${content.type}' data-columns='${columns}'>`
		subHtml += renderBlocks(content.blocks)
		subHtml += '</div>'
		break
	}

	case 'names': {
		const flipped = content.namesFlipped == true ? 'data-flipped=\'true\'' : ''
		const roleFlip = content.roleFlipped == true ? 'data-rolealign=\'true\'' : ''
		const nameFlip = content.nameFlipped == true ? 'data-namealign=\'true\'' : ''
		subHtml += `<div ${style} class='names content' data-type='${content.type}'  ${flipped} ${roleFlip} ${nameFlip}>`

		for (var i = 0; i < content['names'].length; i++) {
			const names = content['names']
			if (typeof names[i] == 'object') {
				subHtml += `<div class='pair'><div class='role'>${names[i].role}</div>`
				if (typeof names[i].name == 'object') {
					subHtml += '<div class=\'nameGroup\'>'
					for (var j = 0; j < names[i].name.length; j++) {
						subHtml += `<div class='name'>${names[i].name[j]}</div>`
					}
					subHtml += '</div>'
				} else {
					subHtml += `<div class='name'>${names[i].name}</div>`
				}
				subHtml += '</div>'
			} else {
				subHtml += `<div class='name'>${names[i]}</div>`
			}
		}
		subHtml += '</div>'
		break
	}
	case 'title':
	case 'subTitle':
		subHtml += `<div ${style} class="${content.type} content" data-type='${content.type}'>${content.text}</div>`
		break
	case 'text':
		subHtml += `<div ${style} class='text content' data-type='${content.type}'>${content.text}</div>`
		break
	case 'image': {
		const height = content.imageHeight || '10'
		const path = template ? '': `${sitePath}saves/${currentProject}/`
		subHtml += `<figure ${style} class="content imageCont" data-type='${content.type}'><img class='image' src='${path}images/${content.image}' style='max-height: ${height}em'></figure>`
		break
	}
	case 'spacing':
		subHtml += `<div ${style} class='spacing content' data-type='${content.type}' style='height:${content.spacing}em'></div>`
		break
	default:
	}
	return subHtml
}

/* Un-builder */

function getCreditsJSON() {
	let content = []
	$('#creditsCont').children().each(function() {
		let $content = $(this)
		content.push({
			'type': $content.attr('data-type'),
			'name': $content.attr('data-name'),
			'duration': $content.attr('data-duration'),
			'trackWidth': $content.attr('data-trackWidth'),
			'trackAlign': $content.attr('data-trackAlign'),
			'backgroundImage': $content.attr('data-backgroundImage'),
			'backgroundAlign': $content.attr('data-backgroundAlign'),
			'blocks': makeBlocksObject($content.children())
		})
	})
	const $cont = $('#creditsCont')
	if ($cont.attr('data-flipped') == 'true') settings.namesFlipped = true
	if ($cont.attr('data-rolealign') == 'true') settings.roleFlipped = true
	if ($cont.attr('data-namealign') == 'true') settings.nameFlipped = true
	return JSON.stringify({
		'globalSettings': settings,
		'images': images,
		'fonts': fonts,
		'content': content,
	}, null, 4)
}

function makeBlocksObject($blocks) {
	const blocks = []
	$blocks.each(function() {
		const $block = $(this)
		const block = {
			'type': $block.attr('data-direction'),
			'content': makeContentsArray($block.children())
		}
		if ($block.attr('data-flipped') == 'true') block.namesFlipped = true
		if ($block.attr('data-rolealign') == 'true') block.roleFlipped = true
		if ($block.attr('data-namealign') == 'true') block.nameFlipped = true
		blocks.push(block)
	})
	return blocks
}

function makeContentsArray($contents) {
	const contents = []
	$contents.each(function() {
		const content = makeContentObject($(this))
		if (typeof content !== 'undefined') contents.push(content)
	})
	return contents
}

function makeContentObject($content) {
	let content = {}
	content.type = $content.data('type')
	if ($content.attr('data-flipped') == 'true') content.namesFlipped = true
	if ($content.attr('data-rolealign') == 'true') content.roleFlipped = true
	if ($content.attr('data-namealign') == 'true') content.nameFlipped = true
	if (typeof $content.attr('style') !== 'undefined') {
		content.settings = getStylesObject($content[0], content.type)
	}
	switch (content.type) {
	case 'title':
	case 'subTitle':
	case 'text':
		content.text = $content.html().replace(/<\/div><div>/g,'\n').replace(/<br>/g,'').replace(/<div>/g,'').replace(/<\/div>/g,'')
		break
	case 'spacing':
		content.spacing = $content.attr('style').replace(/(.*?)height:(.*?)em(.*?)/g, '$2').replace(/[;: ]/g,'')
		break
	case 'names': {
		const names = []
		$content.children().each(function() {
			let $name = $(this)
			let name = {}
			if ($name.hasClass('pair')) {
				$name.children().each(function() {
					if ($(this).hasClass('role')) {
						name.role = $(this).text()
					} else if ($(this).hasClass('name')) {
						name.name = $(this).text()
					} else if ($(this).hasClass('nameGroup')) {
						let group = []
						$(this).children().each(function() {
							group.push($(this).text())
						})
						name.name = group
					}
				})
			} else if ($name.hasClass('name')) {
				name = $name.text()
			}
			names.push(name)
		})
		content.names = names
		break
	}
	case 'image': {
		const imgClass = $content.children('img').attr('style')
		if (imgClass.indexOf('em') !== -1) {
			content.imageHeight = imgClass.substring(12, imgClass.indexOf('em'))
		}
		const image = $content.children('img').attr('src')
		if (image == '../../../img/Placeholder.jpg') {
			content.image = '../../../img/Placeholder.jpg'
		} else {
			const search = `saves/${currentProject}/images/`
			content.image = image.substring(search.length)
		}
		break
	}
	case 'columns':
		content.columns = $content.attr('data-columns')
		content.blocks = makeBlocksObject($content.children())
		break
	default:
		return
	}
	return content
}

function getStylesObject(element, type) {    
	const stylesObj = {}
	const cssArray = element.style.cssText.split('; ')
	if (cssArray[0] == '') return {}
	cssArray.forEach(style=>{
		const stylesArr = style.split(':')
		const prop = stylesArr[0].replace(/[ ;]/g, '')
		const value = stylesArr[1].replace(/[ ;]/g, '')
		if (!(type == 'spacing' && prop == 'height') && !(type == 'image' && prop == 'max-height')) {
			stylesObj[prop] = value
		}
	})
	console.log(stylesObj)
	return stylesObj
}

/* Running */

function toggleUI() {
	if ($('#creditsCont').hasClass('running')) {
		$('header').removeClass('hidden')
		$('footer').removeClass('hidden')
		$('#creditsCont').removeClass('running')
		let $active = $('.active.creditsSection')
		if ($active.length == 0) {
			$('.creditsSection')[0].classList.add('active')
		}
	} else {
		$('header').addClass('hidden')
		$('footer').addClass('hidden')
		$('#creditsCont').addClass('running')
		if (typeof editorClose !== 'undefined') {
			editorClose()
		}
	}
	$('html').removeClass('editing')
	$('html').removeClass('settings')
	$('#editorCont').removeClass('open')
}

async function runCredits() {
	$('.creditsSection').removeClass('active')
	$('header').addClass('hidden')
	$('footer').addClass('hidden')
	$('#creditsCont').addClass('running')
	if (typeof editorClose !== 'undefined') {
		editorClose()
	}
	$('.creditsSection')[0].classList.add('active')
	await sleep(1)
	let sections = document.getElementsByClassName('creditsSection')
	for (let index = 0; index < sections.length; index++) {
		const section = sections[index]
		const duration = section.getAttribute('data-duration')
		const type = section.getAttribute('data-type')
		section.classList.add('active')
		if (type == 'scroll') {
			section.style.transition = `${duration}s linear`
			section.style.top = `-${section.offsetHeight}px`
		} else {
			section.classList.add('fade')
			$(section).css('animation-duration', duration+'s')
		}
		await sleep(duration)
		if (index + 1 < sections.length) {
			section.classList.remove('active')
			section.classList.remove('fade')
			section.style.top = '0'
		}
		section.style.transition = '0s linear'
	}
	return true
}

async function sleep(seconds) {
	await new Promise(resolve => setTimeout(resolve, seconds*1000))
}