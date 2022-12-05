/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function editorMakeProperty($json, prop, state) {
	if (prop == 'imageHeight' || prop == 'maxColumns') {
		return
	}
	let $property = $('<section class=\'editorProperty active\' data-prop=\''+prop+'\'></section>')
	let $header = $('<header></header>')
	let $title = $('<div class=\'editorHeading\' id=\'editor_'+prop+'\'></div>')
	let propertyName = prop.replace( /([A-Z])/g, ' $1' )
	let title = propertyName.charAt(0).toUpperCase() + propertyName.slice(1)
	$title.html(title)
	$header.append($title)
	$property.append($header)
	let $edit = $('<div class=\'editorPropCont\' id=\'editorProp_'+prop+'\'></div>')
	let $input = $('<input class=\'editorProp\' id=\'editorInput_'+prop+'\'>')
	switch (prop) {
	case 'spacing':
	case 'duration': {
		let $plus = $('<button class=\'editorPlus\' id=\'editorPlus_'+prop+'\'>+</button>')
		let $minus = $('<button class=\'editorMinus\' id=\'editorMinus_'+prop+'\'>-</button>')
		if (state == 'active') {
			$input.val($json[prop])
		} else {
			let temp
			switch (prop) {
			case 'spacing':
				temp = 8
				break
			case 'maxColumns':
				temp = 3
				break
			case 'duration':
				temp = 5
				break
			}
			$input.val(temp)
		}
		$edit.append($plus)
		$edit.append($input)
		$edit.append($minus)
		break
	}
	case 'image': {
		let $editImg = $('<div class=\'editorPropCont\' id=\'editorProp_imageHeight\'></div>')
		let $plusImg = $('<button class=\'editorPlus\' id=\'editorPlus_imageHeight\'>+</button>')
		let $inputImg = $('<input class=\'editorProp\' id=\'editorInput_imageHeight\'>')
		let $minusImg = $('<button class=\'editorMinus\' id=\'editorMinus_imageHeight\'>-</button>')
		if (state == 'active') {
			$inputImg.val($json.imageHeight)
		} else {
			$inputImg.val(10)
		}
		$editImg.append($plusImg)
		$editImg.append($inputImg)
		$editImg.append($minusImg)
		$label = $('<div class=\'propertyLabel\'>Set max image height:</div>')
		$edit.append($label)
		$edit.append($editImg)
		let imgs = $json[prop]
		let $img = $('<img class=\'editorImg\' id=\'editorImg_'+prop+'\'>')
		if (state == 'active') {
			let src = `saves/${currentProject}/images/${imgs}`
			$img.attr('src', src)
		}
		let $imgSelect = $('<select class=\'editorProp img_1\' data-imgnum=\'1\' id=\'editorInput_'+prop+'\'></select>')
		images.forEach(image => {
			let $imgOpt
			if (image == $json[prop]) {
				$imgOpt = $(`<option selected value='${image}'>${image}</option>`)
			} else {
				$imgOpt = $(`<option value='${image}'>${image}</option>`)
			}
			$imgSelect.append($imgOpt)
		})
		if (imgs == '../../../img/Placeholder.jpg') {
			$imgSelect.append('<option value=\'none\' selected hidden disabled>Please select image</option>')
		}
		$edit.append($imgSelect)
		$edit.append($img)
		break
	}
	case 'columns': {
		let $plusCol = $('<button class=\'editorPlus\' id=\'editorPlus_maxColumns\'>+</button>')
		let $inputCol = $('<input class=\'editorProp\' id=\'editorInput_maxColumns\'>')
		let $minusCol = $('<button class=\'editorMinus\' id=\'editorMinus_maxColumns\'>-</button>')
		if (state == 'active') {
			$inputCol.val($json.columns)
		} else {
			$inputCol.val(3)
		}
		$edit.append($plusCol)
		$edit.append($inputCol)
		$edit.append($minusCol)
		break
	}
	default:
		break
	}
	$property.append($edit)
	return $property
}

function settingsOpen(keepOpen = false) {
	const $target = $('.creditsSection.active')

	if ($('html').hasClass('settings') && !keepOpen) {
		editorClose()
		return
	}
	$('html').addClass('settings')
	$('.inEditor').removeClass('inEditor')
	let $editor = $('#editorCont')
	$editor.html('')

	editorDataList($editor)

	$editor.data('type', 'global')

	editorScroll($editor, false, $target)
	editorGlobal($editor, false)

	jscolor.install()
	$editor.addClass('open')
}

function fontsOpen($target) {
	fontsClose()
	$target.addClass('fontsEditing')
	const settings = makeContentObject($target).settings
	const fontFamilys = []
	fonts.map(font => {
		return font.split('.')[0]
	}).forEach(font => {
		let selected = ''
		if (typeof settings !== 'undefined') {
			if (font === settings['font-family']) {
				selected = 'selected'
			}
		}
		const option = `<option ${selected}>${font}</option>`
		fontFamilys.push(option)
	})
	const fontSizes = [
		'8pt','10pt','12pt','16pt','20pt','24pt','28pt','32pt','36pt','40pt','44pt','48pt'
	].map(size => {
		let selected = ''
		if (typeof settings !== 'undefined') {
			if (size === settings['font-size']) {
				selected = 'selected'
			}
		}
		return `<option ${selected}>${size}</option>`
	})

	let bold = ''
	let italic = ''
	let underlined = ''
	if (typeof settings !== 'undefined') {
		if (settings['font-weight'] == 'bold'
		|| settings['font-weight'] == 'bolder') {
			bold = 'active'
		}

		if (settings['font-style'] == 'italic') {
			italic = 'active'
		}

		if (settings['text-decoration'] == 'underline') {
			underlined = 'active'
		}
	}

	const template = `<menu id="fontEditor" contenteditable="false">
		<button type="button" class="${bold}" id="fontBoldToggle">B</button>
		<button type="button" class="${italic}" id="fontItalicToggle">I</button>
		<button type="button" class="${underlined}" id="fontUnderlineToggle">U</button>
		<span>Font</span>
		<select id="fontFamily"><option selected>Default</option>${fontFamilys.join('')}</select>
		<span>Font Weight</span>
		<select id="fontSize"><option selected>Default</option>${fontSizes.join('')}</select>
	</menu>`
	$target.append(template)
}
function fontsClose() {
	$('#fontEditor').remove()
	$('.fontsEditing').removeClass('fontsEditing')
}

function deleteOpen($target) {
	deleteClose()
	$target.addClass('hasDelete')

	if ($target.hasClass('role')) {
		const $pair = $target.closest('.pair')
		const siblings = $pair.siblings('.pair').length
		if (siblings > 0) {
			$target.append(`<menu id="deleteCont" contenteditable="false">
				<button type="button" id="deleteNameRole"></button>
			</menu>`)
		}
	} else if ($target.hasClass('name')) {
		const siblings = $target.siblings('.name').length
		if (siblings > 0) {
			$target.append(`<menu id="deleteCont" contenteditable="false">
				<button type="button" id="deleteNameRole"></button>
			</menu>`)
		}
	}


	$('#deleteNameRole').on('click', deleteDo)
}
function deleteClose() {
	$('#deleteCont').remove()
	$('.hasDelete').removeClass('hasDelete')
}
function deleteDo() {
	const $target = $('.hasDelete')
	if ($target.hasClass('role')) {
		const $pair = $target.closest('.pair')
		const siblings = $pair.siblings('.pair').length
		if (siblings > 0) {
			$pair.remove()
		}
	} else if ($target.hasClass('name')) {
		const siblings = $target.siblings('.name').length
		if (siblings > 0) {
			$target.remove()
		}
	}
}

function editorOpen($target) {
	$('html').removeClass('settings')
	$('.inEditor').removeClass('inEditor')
	let $editor = $('#editorCont')
	$editor.html('')

	editorDataList($editor)

	$target.addClass('inEditor')
	let $block = $target.closest('.block')
	$block.addClass('inEditor')
	let isBlock = $target.hasClass('block') ? true : false

	if (!isBlock) {
		$editor.data('type', 'content')
		editorContent($editor, $target)
		if ($target.hasClass('title')
		|| $target.hasClass('subTitle')
		|| $target.hasClass('names')
		|| $target.hasClass('text')) {
			fontsOpen($target)
		} else {
			fontsClose()
		}
	} else {
		$editor.data('type', 'block')
		fontsClose()
	}
	editorColumns($editor, $block)
	editorBlock($editor, $block, $target)
	editorScroll($editor, true)
	editorGlobal($editor, true)

	jscolor.install()
	$editor.addClass('open')
}
function editorClose() {
	let $editor = $('#editorCont')
	fontsClose()
	deleteClose()
	$editor.removeClass('open')
	$('.inEditor').removeClass('inEditor')
	$('html').removeClass('settings')
	$('html').removeClass('editing')
}

function editorReset() {
	$('html').addClass('editing')
	$('#editorCont').html('<div style="padding: 20px;text-align: center;">To edit text you can click on it and type, all other settings and styling can be done here</div>')
	$('#editorCont').addClass('open')
}

function editorDataList($editor) {
	dataOptions = [
		{
			'prop': 'background-color',
			'name': 'Background Colour - rgba(255,255,255,1), #rrggbbaa',
			'values': ['Black','White','Red','Green','Blue'],
			'helper': 'colourPicker'
		},{
			'prop': 'background-image',
			'name': 'Background Image - url(path/to/image)',
			'values': images.map((val)=>`url("saves/${currentProject}/images/${val}")`),
			'helper': 'values'
		},{
			'prop': 'color',
			'name': 'Text Colour - rgba(255,255,255,1), #rrggbbaa',
			'values': ['Black','White','Red','Green','Blue'],
			'helper': 'colourPicker'
		},{
			'prop': 'font-family',
			'name': 'Font',
			'values': fonts.map((val)=>val.split('.')[0]),
			'helper': 'values'
		},{
			'prop': 'font-size',
			'name': 'Font Size - units of px, pt, % & em',
			'values': ['8pt','10pt','12pt','16pt','20pt','24pt','28pt','32pt','36pt','40pt','44pt','48pt'],
			'helper': 'values'
		},{
			'prop': 'font-weight',
			'name': 'Font Weight - bold, bolder, lighter & normal',
			'values': ['lighter','normal','bold','bolder'],
			'helper': 'values'
		},{
			'prop': 'font-style',
			'name': 'Font Style - italic & normal',
			'values': ['italic','normal'],
			'helper': 'values'
		}
	]
	let $dataList = $('<datalist id=\'CSSList\'></datalist>')
	for (var i = 0; i < dataOptions.length; i++) {
		let $dataOption = $('<option value=\''+dataOptions[i].prop+'\'>'+dataOptions[i].name+'</option>')
		$dataList.append($dataOption)
		let $optionsList = $('<datalist id=\''+dataOptions[i].prop+'\'></datalist>')
		for (var j = 0; j < dataOptions[i].values.length; j++) {
			let $dataListOption = $('<option value=\''+dataOptions[i].values[j]+'\'>'+dataOptions[i].values[j]+'</option>')
			$optionsList.append($dataListOption)
		}
		$editor.append($optionsList)
	}
	$editor.append($dataList)
}
function editorContent($editor, $target) {
	let type = $target.data('type')
	$editor.data('type', 'content')
	switch (type) {
	case 'image':
	case 'columns':
	case 'spacing':
		$editor.append(editorMakeProperty(makeContentObject($target), type, 'active'))
		break
	default:
		break
	}
	let contentSettings = {}
	contentSettings[type] = getStylesObject($target[0], type)
	if (Object.keys(contentSettings[type]).length > 0) {
		$editor.append(settingsMakeProperty(contentSettings, type, 'active'))
	} else {
		$editor.append(settingsMakeProperty(contentSettings, type, 'inactive'))
	}
	if (type == 'names') {
		$editor.append(editorNameSettings($target))
	}
}
function editorColumns($editor, $block) {
	if ($block.parent().hasClass('columns')) {
		$editor.append(`<header class="active">
      <h3>Parent Columns</h3>
      <input type="checkbox" id="settingEnable_columns" class="settingGroupCheck" checked>
    </header>`)
		let $columnsSettings = $('<section class="editorGroup" data-level="column"></section>')
		$columnsSettings.append(editorMakeProperty(makeContentObject($block.parent()), 'columns', 'active'))
		$editor.append($columnsSettings)
	}
}
function editorBlock($editor, $block, $target) {
	let checked = $target.hasClass('block') ? 'checked' : ''
	let blockLevel = $target.hasClass('block') ? 'class="active"' : ''
	$editor.append(`<header ${blockLevel}>
    <h3>Group Settings</h3>
    <input type="checkbox" id="settingEnable_block" class="settingGroupCheck" ${checked}>
  </header>`)
  
	let $blockSettings = $('<section class="editorGroup" data-level="block"></section>')
	let blockSettings = {'default': getStylesObject($block[0])}
	let active = Object.values(blockSettings.default).length > 0 ? 'active' : 'inactive'
	let direction = $block.attr('data-direction')
	let options = direction == 'rows'
		? '<option value="rows" selected>Rows</option><option value="columns">Columns</option>'
		: '<option value="rows">Rows</option><option value="columns" selected>Columns</option>'
	$blockSettings.append(`<section class="settingProperty active" data-setting="direction">
    <header>
      <div class="settingHeading" id="setting_direction">Direction</div>
    </header>
    <div class="settingPropCont" id="settingProp_default">
      <div class="settingRuleGroup">
        <div class="settingRulePair">
          <span class="propertyLabel">Direction</span>
          <select class="editorProp" data-direction="${direction}" id="editorInput_direction">
            ${options}
          </select>
        </div>
      </div>
    </div>
  </section>`)
	$blockSettings.append(editorNameSettings($block))
	$blockSettings.append(settingsMakeProperty(blockSettings, 'default', active))
	$editor.append($blockSettings)
}
function editorScroll($editor, toggleable, $target) {
	if (typeof $target === 'undefined') {
		$target = $('.creditsSection.active')
	}
	let creditsType = $target.attr('data-type')
	let duration = $target.attr('data-duration')
	let creditsName = $target.attr('data-name')
	if (toggleable) {
		$editor.append(`<header>
      <h3 id="editorSectionName">${creditsType} Settings</h3>
      <input type="checkbox" id="settingEnable_scroll" class="settingGroupCheck">
    </header>`)
	} else {
		$editor.append(`<header class="active">
      <h3 id="editorSectionName">${creditsType} Settings</h3>
    </header>`)
	}
	let $scrollSettings = $('<section class="editorGroup" data-level="scroll"></section>')
	$scrollSettings.append(`<section class="editorProperty active" data-prop="duration">
    <header>
      <div class="editorHeading" id="editor_duration">Duration</div>
    </header>
    <div class="editorPropCont" id="editorProp_duration">
      <button class="editorPlus" id="editorPlus_duration">+</button>
      <input class="editorProp" id="editorInput_duration" value="${duration}">
      <button class="editorMinus" id="editorMinus_duration">-</button>
    </div>
  </section>`)
	let options = creditsType == 'scroll'
		? '<option value="scroll" selected>Scroll</option><option value="fade">Fade</option>'
		: '<option value="scroll">Scroll</option><option value="fade" selected>Fade</option>'
	$scrollSettings.append(`<section class="settingProperty active" data-setting="type">
    <header>
      <div class="settingHeading" id="setting_type">Scroll/Fade</div>
    </header>
    <div class="settingPropCont" id="settingProp_type">
      <div class="settingRuleGroup">
        <div class="settingRulePair">
          <span class="propertyLabel">Type</span>
          <select class="editorProp" data-type="${creditsType}" id="editorInput_type">
            ${options}
          </select>
        </div>
      </div>
    </div>
  </section>`)
	$scrollSettings.append(editorTrackSettings($target))
	$scrollSettings.append(`<section class="settingProperty active" data-setting="sectionName">
    <header>
      <div class="settingHeading" id="setting_sectionName">${creditsType} Name</div>
    </header>
    <div class="editorPropCont" id="editorProp_sectionName">
      <input class="editorProp" id="editorInput_sectionName" value="${creditsName}">
    </div>
  </section>`)
	$editor.append($scrollSettings)
}
function editorGlobal($editor, toggleable) {
	const globalSettingsOptions = ['background','title','subTitle','image','text','name','role']
	if (toggleable) {
		$editor.append(`<header>
      <h3>Global Settings</h3>
      <input type="checkbox" id="settingEnable_global" class="settingGroupCheck">
    </header>`)
	} else {
		$editor.append(`<header class="active">
      <h3>Global Settings</h3>
    </header>`)
	}
	let $globalSettings = $('<section class="editorGroup" data-level="global"></section>')
	$globalSettings.append(editorNameSettings($('#creditsCont')))
	globalSettingsOptions.forEach(setting => {
		if (typeof settings[setting] === 'undefined') {
			$globalSettings.append(settingsMakeProperty(settings, setting, 'inactive'))
		} else {
			$globalSettings.append(settingsMakeProperty(settings, setting, 'active'))
		}
	})
	$editor.append($globalSettings)
}

function editorNameSettings($target) {
	const flipped = $target.attr('data-flipped') == 'true' ? 'checked="true"' : ''
	const rolealign = $target.attr('data-rolealign') == 'true' ? 'checked="true"' : ''
	const namealign = $target.attr('data-namealign') == 'true' ? 'checked="true"' : ''
	let shown = ''
	let checked = ''
	if ($target.attr('data-flipped') == 'true' || $target.attr('data-rolealign') == 'true' || $target.attr('data-namealign') == 'true' ) {
		shown = ' active'
		checked = 'checked="true"'
	}
	const $namesSection = $(`<section class="settingProperty${shown}" data-prop="nameLayout">
    <header>
      <div class="editorHeading" id="editor_nameLayout">Names Layout</div>
      <input type="checkbox" class="settingCheckBox namesFlip" ${checked}>
    </header>
    <div class="editorPropCont editorLayoutCont">
      <div class="editorLayouts">
        <div class="propertyLabel">Flip Names and Roles</div>
        <input type="checkbox" class="editorNameLayout" data-property="flipped" ${flipped}>
      </div>
      <div class="editorLayouts">
        <div class="propertyLabel">Flip Role alignment</div>
        <input type="checkbox" class="editorNameLayout" data-property="roleAlign" ${rolealign}>
      </div>
      <div class="editorLayouts">
        <div class="propertyLabel">Flip Name alignment</div>
        <input type="checkbox" class="editorNameLayout" data-property="nameAlign" ${namealign}>
      </div>
    </div>
  </section>`)
	return $namesSection
}

function editorTrackSettings($target) {
	const align = $target.attr('data-trackAlign') !== undefined ? $target.attr('data-trackAlign') : 9
	const width = $target.attr('data-trackWidth') !== undefined ? $target.attr('data-trackWidth') : 1152
	const backgroundImage = $target.attr('data-backgroundImage') !== undefined ? $target.attr('data-backgroundImage') : 'None'
	const backgroundAlign = $target.attr('data-backgroundAlign') !== 'false' ? 'checked="true"' : ''

	let imageHTML = backgroundImage == 'None' ? '<option value="none" selected>None</option>' : '<option value="none" selected>None</option>'
	images.forEach(image => {
		if (image == backgroundImage) {
			imageHTML += `<option selected value='${image}'>${image}</option>`
		} else {
			imageHTML += `<option value='${image}'>${image}</option>`
		}
	})

	const $trackSection = $(`<section class="settingProperty active" data-prop="trackLayout">
    <header>
      <div class="editorHeading" id="editor_trackLayout">Track Layout</div>
    </header>
    <div class="editorPropCont editorLayoutCont">
      <div class="editorLayouts">
        <div class="propertyLabel">Track Alignment</div>
        <input type="range" min="1" value="${align}" max="17" class="editorLayoutSlider" id="trackAlign" data-property="align">
      </div>

      <div class="editorLayouts">
        <div class="propertyLabel">Track Width (<span id="trackWidthMon">${width}</span>px)</div>
        <input type="range" min="100" value="${width}" max="1920" class="editorLayoutSlider" id="trackWidth" data-property="width">
      </div>

      <div class="editorLayouts">
        <div class="propertyLabel">Background Image</div>
        <select class="editorTrackImage editorProp">
          ${imageHTML}
        </select>
      </div>

      <div class="editorLayouts">
        <div class="propertyLabel">Align background with track</div>
        <input type="checkbox" class="editorLayout" data-property="backgroundAlign" ${backgroundAlign}>
      </div>

    </div>
  </section>`)

	return $trackSection
}

function settingsMakeProperty(source, setting, state) {
	let $property = $('<section class=\'settingProperty\' data-setting=\''+setting+'\'></section>')
	let $header = $('<header></header>')
	let $title = $('<div class=\'settingHeading\' id=\'setting_'+setting+'\'></div>')
	let $check = $('<input type=\'checkbox\' id=\'settingEnable_'+setting+'\' class=\'settingCheckBox\'>')
	let propertyName = setting.replace( /([A-Z])/g, ' $1' )
	let title = propertyName.charAt(0).toUpperCase() + propertyName.slice(1) + ' Styles'
	$title.html(title)
	$header.append($title)
	$header.append($check)
	$property.append($header)

	if (state == 'active') {
		$property.addClass('active')
		$check.prop('checked', true)
	}

	let $edit = $('<div class=\'settingPropCont\' id=\'settingProp_'+setting+'\'></div>')

	let rules = source[setting]

	let $rulesGroup = $('<div class=\'settingRuleGroup\'></div>')

	for (var key in rules) {
		if (rules.hasOwnProperty(key)) {
			let value = rules[key]
			let $pair = $('<div class=\'settingRulePair\'></div>')
			let $key = $('<input class=\'settingKeyInput settingProp\' list=\'CSSList\'>')
			$key.val(key)
			$key.data('prev', key)
			$pair.append($key)

			let list = ''
			if (key == 'color' || key == 'background-color') {
				list = ` data-jscolor="{value:'rgba(51,153,255,0.5)', position:'bottom', height:80, backgroundColor:'#333',
        palette:'rgba(0,0,0,0) #fff #808080 #000 #996e36 #f55525 #ffe438 #88dd20 #22e0cd #269aff #bb1cd4',
        paletteCols:11, hideOnPaletteClick:true}"`
			} else if (dataOptions.map((val)=>val.prop).includes(key)) {
				list = ` list="${key}"`
			}
			let $value = $(`<input class='settingValueInput settingProp'${list}>`)
			$value.val(value)
			$pair.append($value)
			$rulesGroup.append($pair)
		}
	}

	let $newGroup = $('<div class=\'settingNewGroup\'></div>')
	let $newRule = $('<button class=\'settingNewRule\'>New Rule</button>')
	$newGroup.append($newRule)
	$edit.append($rulesGroup)
	$edit.append($newGroup)

	$property.append($edit)
	return $property
}

function editorNumChange($target, num) {
	if ($target.closest('.editorProperty').data('prop') == 'duration') {
		$('.creditsSection.active').attr('data-duration', num)
		sendDuration()
		return
	}
	let $content = $('.inEditor.content')
	if ($content.length == 0) {
		$content = $('.inEditor.block')
	}
	if ($target.closest('.editorGroup').length != 0) {
		$content = $content.closest('.columns')
	}
	if ($content.hasClass('spacing')) {
		$content.css('height', num+'em')
	} else if ($content.hasClass('columns')) {
		$content.attr('data-columns', num)
	} else if ($content.hasClass('imageCont')) {
		$content.children('img').css('max-height', num+'em')
	}
}

$(document).on('click', function(e) {
	let $target = $(e.target)
	if ($target.hasClass('editorPlus')) {
		let num = $target.next().val()
		num++
		$target.next().val(num)
		editorNumChange($target, num)
	} else if ($target.hasClass('editorMinus')) {
		let num = $target.prev().val()
		num--
		$target.prev().val(num)
		editorNumChange($target, num)
	} else if ($target.is('#fontBoldToggle')) {
		const $content = $('.fontsEditing')
		if ($target.hasClass('active')) {
			$content.css('font-weight', '')
		} else {
			$content.css('font-weight', 'bold')
		}
		$target.toggleClass('active')
		editorOpen($content)
	} else if ($target.is('#fontItalicToggle')) {
		const $content = $('.fontsEditing')
		if ($target.hasClass('active')) {
			$content.css('font-style', '')
		} else {
			$content.css('font-style', 'italic')
		}
		$target.toggleClass('active')
		editorOpen($content)
	} else if ($target.is('#fontUnderlineToggle')) {
		const $content = $('.fontsEditing')
		if ($target.hasClass('active')) {
			$content.css('text-decoration', '')
		} else {
			$content.css('text-decoration', 'underline')
		}
		$target.toggleClass('active')
		editorOpen($content)
	}
})

$(document).on('change', function(e) {
	let $target = $(e.target)
	if ($target.is('#editorInput_direction')) {
		$('.inEditor.block').attr('data-direction', $target.val())
	} else if ($target.is('#editorInput_type')) {
		let $article = $('.creditsSection.active')
		if ($article.attr('data-name') == $article.attr('data-type')) {
			$article.attr('data-name', $target.val())
			$('.tabButton.active').html($target.val())
		}
		$('#setting_sectionName').html($target.val()+' Name')
		$('#editorSectionName').html($target.val()+' Settings')
		$article.attr('data-type', $target.val())
	} else if ($target.is('#editorInput_sectionName')) {
		$('.creditsSection.active').attr('data-name', $target.val())
		$('.tabButton.active').html($target.val())
	} else if ($target.is('#editorInput_imageHeight')) {
		editorNumChange($target, $target.val())
	} else if ($target.is('#editorInput_duration')) {
		editorNumChange($target, $target.val())
	} else if ($target.hasClass('editorTrackImage')) {
		const $article = $('.creditsSection.active')
		if ($target.val() == 'None') {
			$article.css('--background-image', '')
			$article.attr('data-backgroundImage', 'None')
		} else {
			$article.css('--background-image', `url('../saves/${currentProject}/images/${$target.val()}')`)
			$article.attr('data-backgroundImage', $target.val())
		}
	} else if ($target.hasClass('editorLayout')) {
		const $article = $('.creditsSection.active')
		if ($target.is(':checked')) {
			$article.attr('data-backgroundAlign', 'true')
		} else {
			$article.attr('data-backgroundAlign', 'false')
		}
	} else if ($target.hasClass('editorProp')) {
		let value = $target.val()
		let $content = $('.inEditor.content').children('img')
		$content.attr('src', `saves/${currentProject}/images/${value}`)
		$target.next().attr('src', `saves/${currentProject}/images/${value}`)
	} else if ($target.hasClass('editorNameLayout')) {
		const type = $target.attr('data-property')
		const state = $target.prop('checked')
		const level = $target.closest('.editorGroup').attr('data-level')
		switch (level) {
		case 'block':
			$('.block.inEditor').attr('data-'+type, state)
			break
		case 'global':
			$('#creditsCont').attr('data-'+type, state)
			break
		default:
			$('.content.inEditor').attr('data-'+type, state)
			break
		}

	} else if ($target.is('#fontFamily')) {
		const $content = $('.fontsEditing')
		if ($target.val() == 'Default') {
			$content.css('font-family', '')
		} else {
			$content.css('font-family', $target.val())
		}
		editorOpen($content)
	} else if ($target.is('#fontSize')) {
		const $content = $('.fontsEditing')
		if ($target.val() == 'Default') {
			$content.css('font-size', '')
		} else {
			$content.css('font-size', $target.val())
		}
		editorOpen($content)
	}
})

$(document).on('input', function(e) {
	const $target = $(e.target)
	if ($target.hasClass('editorLayoutSlider')) {
		const width = $('#trackWidth').val()
		const widthVW = width/1920 * 100
		const align = $('#trackAlign').val()
		const $article = $('.creditsSection.active')
		$article.attr('data-trackAlign', align)
		$article.attr('data-trackWidth', width)
		$article.css('width', widthVW+'vw')
		$article.css('--background-size', widthVW+'vw')
		$article.css('padding-left', `calc(${align-1} * (100% - ${widthVW}vw)/16)`)
		$article.css('padding-right', `calc(${17-align} * (100% - ${widthVW}vw)/16)`)
		$article.css('--background-position-x', `calc(${100*((align-1)/16)}%)`)
		$('#trackWidthMon').html(width)
	}
})
