/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function firstTimeCheck() {
	let firstTime = Cookies.get('tutorial')
	if (firstTime != 'done') {
		$('#toutorial').removeClass('hidden')
	}
}

function download(filename, text) {
	var element = document.createElement('a')
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
	element.setAttribute('download', filename)
	element.style.display = 'none'
	document.body.appendChild(element)
	element.click()
	document.body.removeChild(element)
}

function savePopup(context) {
	$('#loadVersionBut').val('new')
	$('#saveButSave').html(context)
	$('#saveHead').html(context)
	$('#newSave').toggleClass('hidden')
	$('#saveForm').data('type', context)
}

function initRunInBrowser() {
	runWindow = window.open('/run', 1, 'directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=yes,resizable=yes,width=900,height=128')
}

function runCommand(event) {
	let obj = JSON.parse(event.data)
	switch (obj.command) {
	case 'loaded':
		sendDuration()
		break
	case 'run':
		runCredits()
		break
	case 'toggleUI':
		toggleUI()
		break
	default:

	}
}

function sendDuration() {
	let data = Object.values(document.getElementsByClassName('creditsSection')).map((section)=>parseInt(section.getAttribute('data-duration'))).reduce((a,b)=>a+b, 0)
	$('#renderFades').html(data)
	if (!runWindow) return
	runWindow.postMessage({
		'command':'fadesDuration',
		'data': data
	})
}

function doSave() {
	let type = $('#saveForm').data('type')
	let project,version,file

	if ($('#saveExisting').hasClass('selected')) {
		project = $('#loadFileBut').val()
		version = $('#loadVersionBut').val()
	} else {
		project = $('#saveNewProject').val()
		let projects = []
		projects = $('#loadFile').data('projects').split(',')
		if (projects.includes(project)) {
			alert('There is already a project with this name!')
			return
		}
		version = 'new'
	}

	let formdata = new FormData()
	if (type == 'Import') {
		const $upload = $('#saveUpload')
		if ($upload.prop('files').length > 0) {
			file = $upload.prop('files')[0]
		} else {
			alert('You didn\'t upload a file!')
			return
		}
	} else if (type == 'New') {
		let $newOpt = $(`<option value="${project}" data-versions="1">${project}</option>`)
		$('#loadFile').prepend($newOpt)
		$('#loadFile').val(project)
		$('#loadFileBut').prepend($newOpt)
		$('#loadFileBut').val(project)

		$('#loadVersion').html('<option value="1">1</option>')
		$('#loadVersionBut').html('<option value="new">New Version</option>')
		$('#creditsCont').html(newArticle())
		$('.tabButton').remove()
		$('#creditsFooter').append('<button class="tabButton active">scroll</button>')
		$('#newSave').toggleClass('hidden')

		settings = {}
		fonts = globalFonts
		images = []
		return
	} else {
		file = new Blob([getCreditsJSON()], {type: 'text/plain'})
	}
	formdata.append('JSON', file, version+'.js')
	formdata.append('project', project)
	formdata.append('version', version)

	$.ajax({
		url: 'save',
		type: 'POST',
		data: formdata,
		processData: false,
		contentType: false,
		success: function (result) {
			if (typeof result === 'undefined') return
			const data = result.message
			if (data.type !== 'success') return
			let project = data.project
			let projects = []
			projects = $('#loadFile').data('projects').split(',')

			let version = parseInt(data.version)
			currentVersion = version
			let versions = []
			if (data.version == 1) {
				versions = ['1']
			} else {
				versions = String($('#proj_'+project).data('versions')).split(',')
			}

			const $projSel = $('#loadFile')

			if (!versions.includes(version) && version != 1) {
				versions.push(version)
				if ($projSel.val() == project) {
					let $verOption = $('<option value=\''+version+'\'>'+version+'</option>')
					let $verSel = $('#loadVersion')
					$verSel.prepend($verOption)
					$verSel.val(version)
				}
			}
			let versStr = versions.join()

			if (!projects.includes(project)) {
				projects.push(project)
				let projStr = projects.join()
				$projSel.data('projects', projStr)

				let $option = $('<option id=\'proj_'+project+'\' value=\''+project+'\' data-versions=\''+versStr+'\'>'+project+'</option>')
				$projSel.prepend($option)

				$projSel.val(project)
				load(project)
			} else {
				$('#proj_'+project).data('versions', versStr)
			}
		}
	})

	$('#newSave').toggleClass('hidden')
}

function doUploadSave() {
	let project = $('#uploadFileBut').val()
	let formdata = new FormData()
	let files = $('#uploadImageInput').prop('files')

	if (files.length > 0) {
		for (var i = 0; i < files.length; i++) {
			formdata.append('files[]', files[i])
		}
	} else {
		alert('You haven\'t selected any files!')
		return
	}

	if ($('#uploadExisting').hasClass('selected')) {
		project = $('#uploadFileBut').val()
	} else {
		project = $('#uploadNewProject').val()
		let projects = []
		projects = $('#loadFile').data('projects').split(',')
		if (projects.includes(project)) {
			alert('There is already a project with this name!')
			return
		}
		formdata.append('new', 'true')
	}

	formdata.append('project', project)

	let destination
	if ($('#uploadMedia').hasClass('uploadFont')) {
		destination = 'fonts'
	} else {
		destination = 'images'
	}
	$.ajax({
		url: destination,
		type: 'POST',
		data: formdata,
		processData: false,
		contentType: false
	}).done(function(data) {
		if (typeof data !== 'undefined') {
			if (data.type == 'success') {
				if (data.new) {
					let project = data.project
					let $projSel = $('#loadFile')
					let $verSel = $('#loadVersion')

					let $verOption = $('<option value=\'1\'>1</option>')
					$verSel.prepend($verOption)
					$verSel.val(version)

					let $option = $('<option id=\'proj_'+project+'\' value=\''+project+'\' data-versions=\'1\'>'+project+'</option>')
					$projSel.prepend($option)
					$projSel.val(project)
					load(project)
				}
			}
			updateSaves(data.save)
			if (!$('#gallery').hasClass('hidden')) {
				doOpenGallery()
			}
		}
	})

	$('#uploadMedia').toggleClass('hidden')

}

function doOpenGallery() {
	const validImageTypes = [
		'png',
		'svg',
		'jpg',
		'jpeg'
	]
	const validFontTypes = [
		'otf',
		'ttf'
	]
	$('#galleryImages').html('')
	$('#galleryFonts').html('')

	fonts.forEach(font => {
		let fontArr = font.split('.')
		const fontType = fontArr.pop()
		const fontFile = fontArr.join('.')
		let fontName = fontFile.replace(/[A-Z][a-z]/g, ' $&').trim()
		fontName = fontName.replace(/-|_/g, ' ')
		fontName = fontName.charAt(0).toUpperCase() + fontName.slice(1)
		if (validFontTypes.includes(fontType)) {
			let enabled = ''
			if (globalFonts.includes(font)) {
				enabled = 'disabled'
			}
			const $font = $(`<div class="galleryPreviews">
        <header class="galleryType-${fontType}"><span>${fontName}</span></header>
        <div class="galleryFontDemo" style="font-family: ${font.substring(0,font.indexOf('.'))}">123 abc ABC</div>
        <div class="galleryFontDemoMore" style="font-family: ${font.substring(0,font.indexOf('.'))}">
          123456789 @!?""\`\`£$&*~#()<br />abcdefghijklmnopqrstuvwxy<br />ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
          <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam leo libero, ultricies ac volutpat eget, faucibus ullamcorper ex. Quisque lacinia magna nec lacus porttitor hendrerit.</span>
        </div>
        <div class="galleryInfo">
          <div>File name: ${fontFile}</div>
          <div>File type: ${fontType}</div>
        </div>
        <footer>
          <button type="button" class="galleryMore"></button>
          <button type="button" class="galleryDelete" data-type="fonts" data-filename="${font}" ${enabled}>Delete</button>
        </footer>
      </div>`)
			$('#galleryFonts').append($font)
		}
	})

	images.forEach(image => {
		let imgArr = image.split('.')
		const imageType = imgArr.pop()
		const imageFile = imgArr.join('.')
		let imageName = imageFile.replace(/[A-Z][a-z]/g, ' $&').trim()
		imageName = imageName.replace(/-|_/g, ' ')
		imageName = imageName.charAt(0).toUpperCase() + imageName.slice(1)
		if (validImageTypes.includes(imageType)) {
			const $image = $(`<div class="galleryPreviews">
        <header class="galleryType-${imageType}"><span>${imageName}</span></header>
        <figure>
          <img src="saves/${currentProject}/images/${image}" class="galleryImages"></img>
        </figure>
        <div class="galleryInfo">
          <div>File name: ${imageFile}</div>
          <div>File type: ${imageType}</div>
        </div>
        <footer>
          <button type="button" class="gallerySize"></button>
          <button type="button" class="galleryDelete" data-type="images" data-filename="${image}">Delete</button>
        </footer>
      </div>`)
			$('#galleryImages').append($image)
		}
	})
}

function updateSaves(save) {
	images = typeof save.images !== 'undefined' ? save.images : []
	fonts = typeof save.fonts !== 'undefined' ? [...new Set ([...globalFonts, ...save.fonts])] : globalFonts
}

function newContent() {
	return `<div class="newContent content" data-type="new">
    <div class="newImage">
      <img src="img/image.svg">
      <div>Image</div>
    </div>
    <div class="newTitle">
      <img src="img/title.svg">
      <div>Title</div>
    </div>
    <div class="newSubtitle">
      <img src="img/subtitle.svg">
      <div>Subtitle</div>
    </div>
    <div class="newText">
      <img src="img/text.svg">
      <div>Text</div>
    </div>
    <div class="newName">
      <img src="img/name.svg">
      <div>Names</div>
    </div>
    <div class="newRole">
      <img src="img/role.svg">
      <div>Names & Roles</div>
    </div>
    <div class="newColumns">
      <img src="img/columns.svg">
      <div>Columns</div>
    </div>
    <div class="newSpace">
      <img src="img/spacer.svg">
      <div>Spacer</div>
    </div>
  </div>`
}
function newArticle() {
	$('.creditsSection').removeClass('active')
	return `<article class="creditsSection blockContainer active" data-type="scroll" data-name="scroll" data-duration="60">
    <section class="block" data-direction="rows">
      ${newContent()}
    </section>
  </article>`
}

function doDragging($selected, type) {
	$selected.closest('.creditsSection').addClass('dragging_'+type)
	const $main = $('#mainBody')

	$selected.addClass('dragging')
	if (type == 'block') editorOpen($selected)

	const $potentials = $('.'+type).not($selected)

	$potentials.mouseover(function(e) {
		const $potential = $(e.target)
		if ($potential.hasClass(type)) {
			selectForSwap($potential)
		}
	})
	$potentials.mouseout(function(e) {
		const $potential = $(e.target)
		deselectForSwap($potential)
	})

	$main.mouseover(function(e) {
		const $hovered = $(e.target)
		if (
			!$hovered.hasClass('creditsSection')
      && !$hovered.hasClass(type)
      && !$hovered.hasClass('blockContainer')
		) {
			stopDragging($main, $potentials)
		}
	})

	$main.mouseup(function(e) {
		const $swap = $(document.elementFromPoint(e.pageX, e.pageY))
		if (!$swap.hasClass(type)) return
		if ($selected.prevAll().filter($swap).length === 0) {
			$swap.after($selected)
		} else {
			$swap.before($selected)
		}
		editorOpen($selected)
		stopDragging($main, $potentials)
	})
}

function doSectionDragging($target) {
	const $footer = $('#creditsFooter')
	$target.addClass('dragging')
	$footer.addClass('dragging_block')

	let $siblings = $target.siblings('.tabButton')

	$siblings.mouseover(function(e) {
		let $target = $(e.target)
		selectForSwap($target)
	})
	$siblings.mouseout(function(e) {
		let $target = $(e.target)
		deselectForSwap($target)
	})

	$('main').mouseover(function(e) {
		let $hovered = $(e.target)
		if (!$hovered.hasClass('tabButton') && !$hovered.is('#creditsFooter')) {
			stopDragging($footer, $siblings, $footer)
			$('main').off('mouseover')
		}
	})

	$footer.mouseup(function(e) {
		let $swap = $(document.elementFromPoint(e.pageX, e.pageY))
		if ($siblings.filter($swap).length !== 0) {

			let index = $('.tabButton').index($target)
			let swapIndex = $('.tabButton').index($swap)
			let $articles = $('.creditsSection')

			if ($target.prevAll().filter($swap).length === 0) {
				$swap.after($target)
				$($articles[swapIndex]).after($($articles[index]))
			} else {
				$swap.before($target)
				$($articles[swapIndex]).before($($articles[index]))
			}
		}
		stopDragging($footer, $siblings, $footer)
	})
}

function selectForSwap($target) {
	$('.draggingSelected').removeClass('draggingSelected')
	$target.addClass('draggingSelected')
	if ($target.hasClass('subTitle') || $target.hasClass('title') || $target.hasClass('text') || $target.hasClass('tabButton') || $target.hasClass('newContent')) {
		let $cont = $('<div class="dragCont"></div>')
		$cont.append($target.html())
		$target.html('')
		$target.append($cont)
	}
}

function deselectForSwap($target) {
	$target.removeClass('draggingSelected')
	let $cont = $target.children('.dragCont')
	if ($cont.length !== 0) {
		$target.append($cont.html())
		$cont.remove()
	}
}

function stopDragging($hoverCont, $siblings) {
	$('.dragging').removeClass('dragging')
	$('.draggingSelected').removeClass('draggingSelected')
	$('.dragCont').each(function() {
		deselectForSwap($(this).parent())
	})
	$hoverCont.off('mouseup')
	$hoverCont.off('mouseover')
	$siblings.off('mouseover')
	$siblings.off('mouseout')
	$('.dragging_block').removeClass('dragging_block')
	$('.dragging_content').removeClass('dragging_content')
}

function contentLastNameCheck($target) {
	let $deleteable = false
	if ($target.html() == '' || $target.html() == '<br>') {
		let $parent = $target.parent()
		let $pair = $target.closest('.pair')
		if ($parent.hasClass('pair')) {
			if ($pair.siblings().length == 0) {
				$deleteable = 'Name'
			} else {
				$deleteable = $pair
			}
		} else if ($target.siblings().length == 0) {
			if ($parent.hasClass('nameGroup')) {
				if ($pair.siblings().length == 0) {
					$deleteable = 'Name'
				} else {
					$deleteable = $pair
				}
			} else {
				$deleteable = 'Name'
			}
		} else {
			$deleteable = $target
		}
	}
	return $deleteable
}

function contentLastRoleCheck($target) {
	let $deleteable = false
	if ($target.html() == '' || $target.html() == '<br>') {
		let $parent = $target.parent()
		if ($parent.siblings().length == 0) {
			$deleteable = 'Role'
		} else {
			$deleteable = $parent
		}
	}
	return $deleteable
}

let moveTimer /* for the mousedown event to trigger dragging */

// Onloads
$(function() {
	window.addEventListener('message', runCommand, false)
	firstTimeCheck()

	$('#loadFile').on('change', function(){
		load($('#loadFile').val())
	})

	$('#loadVersion').on('change', function(){
		currentVersion = $('#loadVersion').val()
		$('#loadVersionBut').val(currentVersion)
		load(currentProject, currentVersion)
	})

	$('#loadFileBut').on('change', function(){
		let versionString = String($(this).find(':selected').data('versions'))
		let versions = []
		versions = versionString.split(',')
		$load = $('#loadVersionBut')
		$load.html('')
		for (var i = 0; i < versions.length; i++) {
			$load.append($('<option value=\''+versions[i]+'\'>'+versions[i]+'</option>'))
		}
		$load.append($('<option value=\'new\'>New Version</option>'))
	})

	$('#editButton').on('click', function() {
		$('html').removeClass('settings')
		if ($('html').hasClass('editing')) {
			editorClose()
			return
		}
		editorReset()
	})

	$('#uploadButton').on('click', function() {
		$('#saveFile').removeClass('hidden')
		$('#saveNew').addClass('selected')
		$('#saveExisting').removeClass('selected')
		$('#saveExisting').removeClass('hidden')
		savePopup('Import')
	})
	$('#saveButton').on('click', function() {
		$('#saveFile').addClass('hidden')
		$('#saveNew').removeClass('selected')
		$('#saveExisting').removeClass('hidden')
		$('#saveExisting').addClass('selected')
		savePopup('Save')
	})
	$('#newButton').on('click', function() {
		$('#saveFile').addClass('hidden')
		$('#saveExisting').removeClass('selected')
		$('#saveNew').addClass('selected')
		$('#saveExisting').addClass('hidden')
		savePopup('New')
	})

	$('#uploadMediaButton').on('click', function() {
		$('#uploadMedia').toggleClass('hidden')
		$('#uploadMedia').addClass('uploadMedia')
		$('#uploadMedia').removeClass('uploadFont')
	})
	$('#uploadFontButton').on('click', function() {
		$('#uploadMedia').toggleClass('hidden')
		$('#uploadMedia').removeClass('uploadMedia')
		$('#uploadMedia').addClass('uploadFont')
	})

	$('#renderButton').on('click', function() {
		$('#render').toggleClass('hidden')
	})
	$('#renderClose').on('click', function() {
		$('#render').toggleClass('hidden')
	})
	$('#renderDo').on('click', function() {
		$.get('/render', {
			fps: $('#renderRate').val(),
			resolution: $('#renderRes').val(),
			frames: parseInt($('#renderFades').html()) * $('#renderRate').val(),
			project: currentProject,
			version: currentVersion
		}).done(function(data) {
			const a = document.createElement('a')
			a.style.display = 'none'
			document.body.appendChild(a)
			const type = 'text/plain'
			a.href = window.URL.createObjectURL(
				new Blob([data], { type })
			)
			a.setAttribute('download', `${currentProject}_credits`)
			a.click()
			window.URL.revokeObjectURL(a.href)
			document.body.removeChild(a)
		})
	})

	$('#galleryButton').on('click', function() {
		doOpenGallery()
		$('#gallery').toggleClass('hidden')
	})

	$('#galleryButClose').on('click', function() {
		$('#gallery').toggleClass('hidden')
	})

	$('#galleryRefresh').on('click', function() {
		$.getJSON('save', {
			'project':currentProject,
			'version':currentVersion
		}, (save)=>{
			updateSaves(save)
			doOpenGallery()
		})
	})

	$('#downloadMultiButton').on('click', function() {
		$('#downloadsPopup').toggleClass('hidden')
	})

	$('#downloadButCancel').on('click', function() {
		$('#downloadsPopup').toggleClass('hidden')
	})

	$('#downloadButDone').on('click', function() {
		$('#downloadsPopup').toggleClass('hidden')
		if ($('#downloadFile').next().prop('checked')) {
			let creditsJSON = getCreditsJSON()
			let fileName = `${currentProject}_v${currentVersion}.json`
			download(fileName,creditsJSON)
		}
		if ($('#downloadImg').next().prop('checked')) {
			$('body').append(`<iframe style="display:none;" src="images?project=${currentProject}"></iframe>`)
		}
		if ($('#downloadFonts').next().prop('checked')) {
			$('body').append(`<iframe style="display:none;" src="fonts?project=${currentProject}"></iframe>`)
		}
		if ($('#downloadTemplate').next().prop('checked')) {
			$('body').append(`<iframe style="display:none;" src="template?project=${currentProject}&version=${currentVersion}"></iframe>`)
		}
	})

	$('#downloadTemplate').on('click', function() {
		$('#downloadTemplate').toggleClass('selected')
	})

	$('#downloadFonts').on('click', function() {
		$('#downloadFonts').toggleClass('selected')
	})

	$('#downloadImg').on('click', function() {
		$('#downloadImg').toggleClass('selected')
	})

	$('#saveButCancel').on('click', function() {
		$('#newSave').toggleClass('hidden')
	})

	$('#uploadButCancel').on('click', function() {
		$('#uploadMedia').toggleClass('hidden')
	})

	$('#saveButSave').on('click', function() {
		doSave()
	})

	$('#uploadButSave').on('click', function() {
		doUploadSave()
	})

	$('#saveExisting').on('click', function() {
		if (!$(this).hasClass('selected')) {
			$(this).toggleClass('selected')
			$('#saveNew').toggleClass('selected')
		}
	})
	$('#saveNew').on('click', function() {
		if (!$(this).hasClass('selected')) {
			$(this).toggleClass('selected')
			$('#saveExisting').toggleClass('selected')
		}
	})

	$('#uploadExisting').on('click', function() {
		if (!$(this).hasClass('selected')) {
			$(this).toggleClass('selected')
			$('#uploadNew').toggleClass('selected')
		}
	})
	$('#uploadNew').on('click', function() {
		if (!$(this).hasClass('selected')) {
			$(this).toggleClass('selected')
			$('#uploadExisting').toggleClass('selected')
		}
	})

	$('#downloadImgButton').on('click', function() {
		$('body').append(`<iframe style="display:none;" src="images?project=${currentProject}"></iframe>`)
	})

	$('#full').on('click', function() {
		if (window.innerWidth == screen.width && window.innerHeight == screen.height) {
			if (document.exitFullscreen) {
				document.exitFullscreen()
			}
		} else {
			document.documentElement.requestFullscreen()
			$('#creditsScroller').css('transition', '')
			$('#creditsScroller').css('top', '')
		}
	})

	$('#tutClose').on('click', function() {
		$('#toutorial').toggleClass('hidden')
		Cookies.set('tutorial', 'done', { secure: true, SameSite: 'Lax' })
	})
	$('#help').on('click', function() {
		$('#toutorial').toggleClass('hidden')
		Cookies.set('tutorial', 'done', { secure: true, SameSite: 'Lax' })
	})

	let loadProject = Cookies.get('project')
	loadProject = typeof loadProject === 'undefined' ? defaultProject : loadProject
	load(loadProject)
})

$(document).on('click', function(e) {
	let $target = $(e.target)

	if ($target.hasClass('content') || $target.hasClass('name') || $target.hasClass('role')) {
		$('.editSelected').removeAttr('contenteditable')
		$('.editSelected').removeAttr('tabindex')
		$('.editSelected').removeClass('editSelected')
		let type = 'contenteditable'
		let setting = 'true'
		if ($target.is('figure')
		|| $target.hasClass('spacing')
		|| $target.hasClass('columns')
		|| $target.hasClass('newContent')
		|| $target.hasClass('names')) {
			type = 'tabindex'
			setting = '0'
		}

		if ($('html').hasClass('editing')) {
			$target.addClass('editSelected')
			$target.attr(type, setting)
			$target.trigger('focus')
			if ($target.hasClass('name')
			|| $target.hasClass('role')) {
				deleteOpen($target)
			}
			$target.on('focusout', event => {
				if ($(event.relatedTarget).is('#deleteNameRole')) {
					deleteDo()
				}
				$target.removeAttr(type)
				$target.removeClass('editSelected')
				deleteClose()
			})
		} else {
			$target.removeAttr(type)
			$target.removeClass('editSelected')
			deleteClose()
		}
	}

	if ($target.hasClass('tabButton')) {
		$('.tabButton').removeClass('active')
		$('.creditsSection').removeClass('active')
		$target.addClass('active')
		let index = $('.tabButton').index($target)
		$($('.creditsSection')[index]).addClass('active')

		if ($('html').hasClass('editing')) {
			settingsOpen(true)
		}
	} else if ($target.is('#newArticle')) {
		$('.tabButton').removeClass('active')
		$('#creditsFooter').append('<button class="tabButton active">scroll</button>')
		$('#creditsCont').append(newArticle())
		settingsOpen(true)
	} else if ($target.is('#settings')) {
		settingsOpen()
	} else if ($target.is('#run')) {
		initRunInBrowser()
	} else if ($target.hasClass('settingNewRule')) {
		let $group = $target.parent().prev()
		let $pair = $('<div class=\'settingRulePair\'></div>')
		let $key = $('<input class=\'settingKeyInput settingProp\' placeholder=\'Placeholder\' data-prev=\'Placeholder\' list=\'CSSList\'>')
		let $value = $('<input class=\'settingValueInput settingProp\' placeholder=\'Placeholder\' data-prev=\'Placeholder\'>')
		$pair.append($key)
		$pair.append($value)
		$group.append($pair)
	} else if ($target.hasClass('galleryMore')) {
		$target.closest('.galleryPreviews').toggleClass('moreFonts')
	} else if ($target.hasClass('gallerySize')) {
		$target.closest('.galleryPreviews').toggleClass('biggerImages')
	} else if ($target.hasClass('galleryDelete')) {
		$.delete(`${$target.data('type')}?file=${$target.data('filename')}&project=${currentProject}`, function(data) {
			updateSaves(data.save)
			doOpenGallery()
		}).fail(function(data) {
			alert('Failed to delete font error: '+JSON.stringify(data.responseJSON.error))
			updateSaves(data.responseJSON.save)
			doOpenGallery()
		})
	} else if ($target.hasClass('settingGroupCheck')) {
		$target.parent().toggleClass('active')
	} else if ($target.hasClass('newImage')) {
		$target.parent().replaceWith(`<figure class="content imageCont" data-type='image'><img class='image' src='saves/${currentProject}/images/../../../img/Placeholder.jpg' style='max-height: 10em'></figure>`)
	} else if ($target.hasClass('newTitle')) {
		$target.parent().replaceWith('<div class="title content" data-type="title">Title</div>')
	} else if ($target.hasClass('newSubtitle')) {
		$target.parent().replaceWith('<div class="subTitle content" data-type="subTitle">Sub Title</div>')
	} else if ($target.hasClass('newText')) {
		$target.parent().replaceWith('<div class="text content" data-type="text">Text</div>')
	} else if ($target.hasClass('newName')) {
		$target.parent().replaceWith('<div class="names content" data-type="names"><div class="name">Name</div></div>')
	} else if ($target.hasClass('newRole')) {
		$target.parent().replaceWith(`<div class="names content" data-type="names">
      <div class="pair">
        <div class="role">Role</div>
        <div class="name">Name</div>
      </div>
    </div>`)
	} else if ($target.hasClass('newColumns')) {
		$target.parent().replaceWith(`<div class="content columns blockContainer" data-type="columns" data-columns="2">
      <section class="block" data-direction="rows">${newContent()}</section>
      <section class="block" data-direction="rows">${newContent()}</section>
    </div>`)
	} else if ($target.hasClass('newSpace')) {
		$target.parent().replaceWith('<div class="spacing content" data-type="spacing" style="height:8em"></div>')
	} else if ($('html').hasClass('editing') && (
		$target.hasClass('block')
    || $target.hasClass('content')
    || $target.hasClass('pair')
    || $target.hasClass('name')
    || $target.hasClass('role')
    || $target.hasClass('nameGroup')
	)) {
		let $content = $target.closest('.content, .block')
		if ($content.length > 0) {
			editorOpen($content)
		}
	}
	closeMenu()
})

$(document).on('change', function(e) {
	let $target = $(e.target)
	if ($target.hasClass('settingCheckBox')) {
		let $cont = $target.closest('.settingProperty')
		let makeInactive = $cont.hasClass('active') ? true : false
		if (makeInactive) {
			$cont.find('.settingRuleGroup').html('')
		} else {
			$cont.find('.settingNewRule').trigger('click')
		}
		switch ($cont.parent().data('level')) {
		case 'global':
			if (makeInactive) {
				delete settings[$cont.data('setting')]
				updateSettings()
				if ($target.hasClass('namesFlip')) {
					$('#creditsCont').removeAttr('data-flipped')
					$('#creditsCont').removeAttr('data-rolealign')
					$('#creditsCont').removeAttr('data-namealign')
				}
			}
			break
		case 'block':
			if (makeInactive) {
				$('.block.inEditor').attr('style', '')
				if ($target.hasClass('namesFlip')) {
					$('.block.inEditor').removeAttr('data-flipped')
					$('.block.inEditor').removeAttr('data-rolealign')
					$('.block.inEditor').removeAttr('data-namealign')
				}
			}
			break
		default:
			if (makeInactive) {
				$('.content.inEditor').attr('style', '')
				if ($target.hasClass('namesFlip')) {
					$('.content.inEditor').removeAttr('data-flipped')
					$('.content.inEditor').removeAttr('data-rolealign')
					$('.content.inEditor').removeAttr('data-namealign')
				}
			}
			break
		}
		$cont.toggleClass('active')
	} else if ($target.hasClass('settingKeyInput')) {
		let $cont = $target.closest('.settingProperty')
		let value = $target.val()
		if (value == 'color' || value == 'background-color') {
			$target.next().removeAttr('list')
			$target.next().attr('data-jscolor', '{value:\'rgba(51,153,255,0.5)\', position:\'bottom\', height:80, backgroundColor:\'#333\', palette:\'rgba(0,0,0,0) #fff #808080 #000 #996e36 #f55525 #ffe438 #88dd20 #22e0cd #269aff #bb1cd4\', paletteCols:11, hideOnPaletteClick:true}')
		} else if ($target.next().hasClass('jscolor')) {
			$target.next().remove()
			$target.parent().append(`<input class="settingValueInput settingProp" data-prev="Placeholder" placeholder="Placeholder" list="${value}">`)
		} else {
			$target.next().attr('list', value)
		}
		jscolor.install()
		if ($cont.parent().data('level') === 'global') {
			let setting = $cont.data('setting')
			let prev = $target.data('prev')
			if (settings[setting] !== undefined) {
				delete settings[setting][prev]
			} else {
				settings[setting] = {}
			}
			$target.data('prev', value)
			settings[setting][value] = $target.next().val()
			updateSettings(true)
		}
	} else if ($target.hasClass('settingValueInput')) {
		let $cont = $target.closest('.settingProperty')
		let setting = $cont.data('setting')
		let value = $target.val()
		let key = $target.prev().val()

		switch ($target.closest('.editorGroup').data('level')) {
		case 'block':
			$('.inEditor.block').css(key, value)
			break
		case 'global':
			if (settings[setting] === undefined) {
				settings[setting] = {}
			}
			settings[setting][key] = value
			updateSettings(false)
			break
		default:
			$('.inEditor.content').css(key, value)
			break
		}
	}
})

$(document).keyup(function(e) {
	if (e.key === 'Escape') {
		if ($('#creditsFooter').hasClass('hidden')) {
			toggleUI()
			reset()
		}
	}
})

$(document).on('paste', function(e) {
	let $target = $(e.target)
	if ($target.attr('contenteditable')) {
		setTimeout(function() {
			let text = $target.text()
			if (!$target.hasClass('name')) {
				$target.html(text)
			} else if (text.includes('td {border:')) {
				if ($target.parent().hasClass('pair')) {
					const $group = $('<div class="nameGroup"></div>')
					$target.before($group)
					$group.append($target)
				}

				$target.find('tbody').children().each(function() {
					$target.after(`<div class="name">${$(this).html()}</div>`)
				})
				$target.remove()
			} else if ($target.html().includes('<span')) {
				$target.html(text)
			} else if ($target.html().includes('<div')) {
				let $group = $target.children('.nameGroup')
				if ($group.length == 0) {
					$group = $target.children('.names')
					$target.parent().append($group.children())
				} else {
					$target.before($group)
				}
				$target.remove()
			} else if ($target.html().includes('<br>')) {
				if ($target.parent().hasClass('pair')) {
					const $group = $('<div class="nameGroup"></div>')
					$target.before($group)
					$group.append($target)
				}
				let names = $target.html().split('<br>')
				names.forEach(name => {
					$target.after(`<div class="name">${name}</div>`)
				})
				$target.remove()
			}
		}, 0)
	}
})

$(document).on('mousedown', function(e) {
	if (!$('html').hasClass('editing')) return
	$(document).on('mouseup', function() {
		clearTimeout(moveTimer)
	})

	moveTimer = setTimeout(() => {
		$(document).off('mouseup')
		const $target = $(e.target)
		if ($target.hasClass('tabButton')) {
			doSectionDragging($target)
		} else if ($target.hasClass('content')) {
			doDragging($target, 'content')
		} else if ($target.hasClass('block')) {
			doDragging($target, 'block')
		} else if (
			$target.hasClass('name')
			|| $target.hasClass('nameGroup')
			|| $target.hasClass('pair')
			|| $target.hasClass('role')
		) {
			doDragging($target.closest('.content'), 'content')
		}
	}, 100)
})

$(document).on('keydown', function(e) {
	const $target = $(e.target)
	if ($target.attr('contenteditable')) {
		if ($target.hasClass('text')) {
			return
		}
		if (e.which != 13) {
			return true
		} else if ($target.hasClass('name')) {
			if (!$target.parent().hasClass('nameGroup')) {
				let $group = $('<div class="nameGroup"></div>')
				$target.parent().append($group)
				$group.append($target)
			}
			$target.after($('<div class="name editSelected" contenteditable="true"></div>'))
			$target.removeClass('editSelected')
			$target.removeAttr('contenteditable')
			$target.next().trigger('focus')
			$target.next().on('blur', () => {
				$target.next().removeAttr('contenteditable')
				$target.next().removeClass('editSelected')
			})
		} else if ($target.hasClass('role')) {
			$target.closest('.pair').after('<div class="pair"><div class="role editSelected" contenteditable="true">Role</div><div class="name">Name</div></div>')
			$target.removeClass('editSelected')
			$target.removeAttr('contenteditable')
			let $new = $target.parent().next().children('.role')
			$new.trigger('focus')
			$new.on('blur', () => {
				$new.removeAttr('contenteditable')
				$new.removeClass('editSelected')
			})
		}
		return false
	}
})

$.each( [ 'put', 'delete' ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		if (typeof data === 'function') {
			type = type || callback
			callback = data
			data = undefined
		}

		return $.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		})
	}
})


function makeV3BlocksFromV2(credits) {
	return credits.map((objc) => {
		const newContent = []
		for (const key in objc) {
			if (Object.hasOwnProperty.call(objc, key)) {
				const propValue = objc[key]
				switch (key) {
				case 'title':
				case 'subTitle':
					newContent.push({
						'type': key,
						'text': propValue
					})
					break
				case 'text':
					if (typeof propValue == 'string') {
						newContent.push({
							'type': key,
							'text': propValue
						})
					} else {
						propValue.forEach((txt)=>{
							newContent.push({
								'type': key,
								'text': txt
							})
						})
					}
					break
				case 'names':
				case 'name':
					newContent.push({
						'type': key,
						'names': propValue
					})
					break
				case 'spacing':
					newContent.push({
						'type': key,
						'spacing': propValue
					})
					break
				case 'image':
					if (typeof propValue == 'string') {
						const prop = {
							'type': key,
							'image': propValue
						}
						if (typeof objc['imageHeight'] !== 'undefined') {
							prop.imageHeight = objc['imageHeight']
						}
						newContent.push(prop)
					} else {
						propValue.forEach((img)=>{
							const prop = {
								'type': key,
								'image': img
							}
							if (typeof objc['imageHeight'] !== 'undefined') {
								prop.imageHeight = objc['imageHeight']
							}
							newContent.push(prop)
						})
					}
					break
				case 'columns': {
					const columns = {
						'type': 'columns',
						'blocks': makeV3BlocksFromV2(propValue)
					}
					if (typeof objc['maxColumns'] !== 'undefined') {
						columns.columns = objc['maxColumns']
					}
					newContent.push(columns)
					return
				}
				default:
					break
				}
			}
		}
		return {
			'type':'rows',
			'content': newContent}
	})
}

function loadV2FromURL(project, version) {
	let source = `https://credits.chilton.tv/saves/${project}/${version}.js`
	return new Promise((resolve, reject) => {
		var script = document.createElement('script')
		script.onload = resolve
		script.onerror = reject
		script.src = source
		document.getElementsByTagName('head')[0].appendChild(script)
	})
}

function saveConvertV2toV3(credits, fades, settings) {
	let newSave = makeV3BlocksFromV2(credits)

	let output = {}
	let content = []
	content.push({
		'type': 'scroll',
		'name': 'scroll',
		'duration': '60',
		'blocks': newSave
	})

	fades.forEach((fade)=>{
		content.push({
			'type': 'fade',
			'name': 'fade',
			'duration': fade.duration,
			'blocks': makeV3BlocksFromV2([fade])
		})
	})

	output.content = content
	output.globalSettings = settings
	output.fonts = []
	output.images = []

	return output
}

async function convertV2toV3(project, version) {
	await loadV2FromURL(project, version)
	const result = saveConvertV2toV3(credits, endFades, settings)
	console.log(result)
}