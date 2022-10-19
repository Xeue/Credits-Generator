/*jshint esversion: 6 */

function editorMakeProperty($json, prop, state) {
  if (prop == "imageHeight" || prop == "maxColumns") {
    return;
  }
  let $property = $("<section class='editorProperty active' data-prop='"+prop+"'></section>");
  let $header = $("<header></header>");
  let $title = $("<div class='editorHeading' id='editor_"+prop+"'></div>");
  let propertyName = prop.replace( /([A-Z])/g, " $1" );
  let title = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
  $title.html(title);
  $header.append($title);
  $property.append($header);
  let $edit = $("<div class='editorPropCont' id='editorProp_"+prop+"'></div>");
  let $input = $("<input class='editorProp' id='editorInput_"+prop+"'>");
  switch (prop) {
    case "spacing":
    case "duration":
      let $plus = $("<button class='editorPlus' id='editorPlus_"+prop+"'>+</button>");
      let $minus = $("<button class='editorMinus' id='editorMinus_"+prop+"'>-</button>");
      if (state == "active") {
        $input.val($json[prop]);
      } else {
        let temp;
        switch (prop) {
          case "spacing":
            temp = 8;
            break;
          case "maxColumns":
            temp = 3;
            break;
          case "duration":
            temp = 5;
            break;
        }
        $input.val(temp);
      }
      $edit.append($plus);
      $edit.append($input);
      $edit.append($minus);
      break;
    case "image":
      let $editImg = $("<div class='editorPropCont' id='editorProp_imageHeight'></div>");
      let $plusImg = $("<button class='editorPlus' id='editorPlus_imageHeight'>+</button>");
      let $inputImg = $("<input class='editorProp' id='editorInput_imageHeight'>");
      let $minusImg = $("<button class='editorMinus' id='editorMinus_imageHeight'>-</button>");
      if (state == "active") {
        $inputImg.val($json.imageHeight);
      } else {
        $inputImg.val(10);
      }
      $editImg.append($plusImg);
      $editImg.append($inputImg);
      $editImg.append($minusImg);
      $label = $("<div class='propertyLabel'>Set max image height:</div>")
      $edit.append($label);
      $edit.append($editImg);
      let imgs = $json[prop];
      let $img = $("<img class='editorImg' id='editorImg_"+prop+"'>");
      if (state == "active") {
        let src = `saves/${currentProject}/images/${imgs}`;
        $img.attr("src", src);
      }
      let $imgSelect = $("<select class='editorProp img_1' data-imgnum='1' id='editorInput_"+prop+"'></select>");
      images.forEach(image => {
        let $imgOpt;
        if (image == $json[prop]) {
          $imgOpt = $(`<option selected value='${image}'>${image}</option>`);
        } else {
          $imgOpt = $(`<option value='${image}'>${image}</option>`);
        }
        $imgSelect.append($imgOpt);
      });
      if (imgs == '../../../img/Placeholder.jpg') {
        $imgSelect.append(`<option value='none' selected hidden disabled>Please select image</option>`);
      }
      $edit.append($imgSelect);
      $edit.append($img);
      break;
    case "columns":
      let $plusCol = $("<button class='editorPlus' id='editorPlus_maxColumns'>+</button>");
      let $inputCol = $("<input class='editorProp' id='editorInput_maxColumns'>");
      let $minusCol = $("<button class='editorMinus' id='editorMinus_maxColumns'>-</button>");
      if (state == "active") {
        $inputCol.val($json.columns);
      } else {
        $inputCol.val(3);
      }
      $edit.append($plusCol);
      $edit.append($inputCol);
      $edit.append($minusCol);
      break;
      let names = $json[prop];
      let $namesGroup = $("<div id='editorNamesGroup'></div>");
      if (typeof names !== "undefined") {
        for (var i = 0; i < names.length; i++) {
          let name = names[i];
          if (typeof name == "object") {
            let $pair = $("<div class='editorNamesPair'></div>");
            let $newPairName = $("<button class='editorNewPairName'></button>");
            let $role = $("<input class='editorRoleInput editorProp'>");
            $role.val(name.role);
            $pair.append($role);
            let $nameGroup = $("<div class='editorNameGroup'></div>");
            if (typeof name.name == "object") {
              for (var j = 0; j < name.name.length; j++) {
                let $name = $("<input class='editorNameInput editorProp'>");
                $name.val(name.name[j]);
                $nameGroup.append($name);
              }
            } else {
              let $name = $("<input class='editorNameInput editorProp'>");
              $name.val(name.name);
              $nameGroup.append($name);
            }
            $pair.append($nameGroup);
            $nameGroup.append($newPairName);
            $namesGroup.append($pair);
          } else {
            let $nameUnpair = $("<input class='editorNamesInput editorProp'>");
            $nameUnpair.val(name);
            $namesGroup.append($nameUnpair);
          }
        }
      }

      let $newGroup = $("<div class='editorNewGroup'></div>");
      let $newRole = $("<button class='editorNewRole'>New Role</button>");
      let $newName = $("<button class='editorNewName'>New Name</button>");
      $newGroup.append($newRole);
      $newGroup.append($newName);
      $edit.append($namesGroup);
      $edit.append($newGroup);
      break;
    default:
      break;
  }
  $property.append($edit);
  return $property;
}

function settingsOpen(keepOpen = false, $target) {
  if ($('html').hasClass('settings') && !keepOpen) {
    editorClose();
    return
  }
  $('html').addClass('settings');
  $(".inEditor").removeClass("inEditor");
  let $editor = $("#editorCont");
  $editor.html("");

  editorDataList($editor)

  $editor.data('type', 'global');

  editorScroll($editor, false, $target);
  editorGlobal($editor, false);

  jscolor.install();
  $editor.addClass("open");
}

function editorOpen($target) {
  $('html').removeClass('settings');
  $(".inEditor").removeClass("inEditor");
  let $editor = $("#editorCont");
  $editor.html("");

  editorDataList($editor);

  $target.addClass("inEditor");
  let $block = $target.closest('.block');
  $block.addClass("inEditor");
  let isBlock = $target.hasClass('block') ? true : false;

  if (!isBlock) {
    editorContent($editor, $target);
  } else {
    $editor.data('type', 'block')
  }
  editorColumns($editor, $block);
  editorBlock($editor, $block, $target);
  editorScroll($editor, true);
  editorGlobal($editor, true);

  jscolor.install();
  $editor.addClass("open");
}
function editorClose() {
  let $editor = $("#editorCont");
  $editor.removeClass("open");
  $(".inEditor").removeClass("inEditor");
  $("html").removeClass("settings");
  $("html").removeClass("editing");
}

function editorReset() {
  $("html").addClass("editing");
  $("#editorCont").html('<div style="padding: 20px;text-align: center;">To edit text you can click on it and type, all other settings and styling can be done here</div>');
  $("#editorCont").addClass("open");
}

function editorDataList($editor) {
  dataOptions = [
    {
      "prop": "background-color",
      "name": "Background Colour - rgba(255,255,255,1), #rrggbbaa",
      "values": ["Black","White","Red","Green","Blue"],
      "helper": "colourPicker"
    },{
      "prop": "background-image",
      "name": "Background Image - url(path/to/image)",
      "values": images.map((val)=>`url("saves/${currentProject}/images/${val}")`),
      "helper": "values"
    },{
      "prop": "color",
      "name": "Text Colour - rgba(255,255,255,1), #rrggbbaa",
      "values": ["Black","White","Red","Green","Blue"],
      "helper": "colourPicker"
    },{
      "prop": "font-family",
      "name": "Font",
      "values": fonts.map((val)=>val.split('.')[0]),
      "helper": "values"
    },{
      "prop": "font-size",
      "name": "Font Size - units of px, pt, % & em",
      "values": ["8pt","10pt","12pt","16pt","20pt","24pt","28pt","32pt","36pt","40pt","44pt","48pt"],
      "helper": "values"
    },{
      "prop": "font-weight",
      "name": "Font Weight - bold, bolder, lighter & normal",
      "values": ["lighter","normal","bold","bolder"],
      "helper": "values"
    },{
      "prop": "font-style",
      "name": "Font Style - italic & normal",
      "values": ["italic","normal"],
      "helper": "values"
    }
  ]
  let $dataList = $("<datalist id='CSSList'></datalist>");
  for (var i = 0; i < dataOptions.length; i++) {
    let $dataOption = $("<option value='"+dataOptions[i].prop+"'>"+dataOptions[i].name+"</option>");
    $dataList.append($dataOption);
    let $optionsList = $("<datalist id='"+dataOptions[i].prop+"'></datalist>");
    for (var j = 0; j < dataOptions[i].values.length; j++) {
      let $dataListOption = $("<option value='"+dataOptions[i].values[j]+"'>"+dataOptions[i].values[j]+"</option>");
      $optionsList.append($dataListOption);
    }
    $editor.append($optionsList);
  }
  $editor.append($dataList);
}
function editorContent($editor, $target) {
  let type = $target.data('type');
    $editor.data('type', 'content')
    switch (type) {
      case 'image':
      case 'columns':
      case 'spacing':
        $editor.append(editorMakeProperty(makeContentObject($target), type, "active"));
        break;
      default:
        break;
    }
    let contentSettings = {};
    contentSettings[type] = getStylesObject($target[0], type);
    if (Object.keys(contentSettings[type]).length > 0) {
      $editor.append(settingsMakeProperty(contentSettings, type, "active"));
    } else {
      $editor.append(settingsMakeProperty(contentSettings, type, "inactive"));
    }
}
function editorColumns($editor, $block) {
  if ($block.parent().hasClass('columns')) {
    $editor.append(`<header class="active">
      <h3>Parent Columns</h3>
      <input type="checkbox" id="settingEnable_columns" class="settingGroupCheck" checked>
    </header>`);
    let $columnsSettings = $('<section class="editorGroup" data-level="column"></section>');
    $columnsSettings.append(editorMakeProperty(makeContentObject($block.parent()), 'columns', "active"));
    $editor.append($columnsSettings);
  }
}
function editorBlock($editor, $block, $target) {
  let checked = $target.hasClass('block') ? 'checked' : '';
  let blockLevel = $target.hasClass('block') ? 'class="active"' : '';
  $editor.append(`<header ${blockLevel}>
    <h3>Block Settings</h3>
    <input type="checkbox" id="settingEnable_block" class="settingGroupCheck" ${checked}>
  </header>`);
  
  let $blockSettings = $('<section class="editorGroup" data-level="block"></section>');
  let blockSettings = {'default': getStylesObject($block[0])};
  let active = Object.values(blockSettings.default).length > 0 ? 'active' : 'inactive';
  let direction = $block.attr('data-direction');
  let options = direction == 'rows'
    ? `<option value="rows" selected>Rows</option><option value="columns">Columns</option>`
    : `<option value="rows">Rows</option><option value="columns" selected>Columns</option>`;
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
  $blockSettings.append(settingsMakeProperty(blockSettings, 'default', active));
  $editor.append($blockSettings);
}
function editorScroll($editor, toggleable, $target) {
  if (typeof $target === 'undefined') {
    $target = $('.creditsSection.active');
  }
  let creditsType = $target.attr('data-type');
  let duration = $target.attr('data-duration');
  let creditsName = $target.attr('data-name');
  if (toggleable) {
    $editor.append(`<header>
      <h3 id="editorSectionName">${creditsType} Settings</h3>
      <input type="checkbox" id="settingEnable_scroll" class="settingGroupCheck">
    </header>`);
  } else {
    $editor.append(`<header class="active">
      <h3 id="editorSectionName">${creditsType} Settings</h3>
    </header>`);
  }
  let $scrollSettings = $('<section class="editorGroup" data-level="scroll"></section>');
  $scrollSettings.append(`<section class="editorProperty active" data-prop="duration">
    <header>
      <div class="editorHeading" id="editor_duration">Duration</div>
    </header>
    <div class="editorPropCont" id="editorProp_duration">
      <button class="editorPlus" id="editorPlus_duration">+</button>
      <input class="editorProp" id="editorInput_duration" value="${duration}">
      <button class="editorMinus" id="editorMinus_duration">-</button>
    </div>
  </section>`);
  let options = creditsType == 'scroll'
  ? `<option value="scroll" selected>Scroll</option><option value="fade">Fade</option>`
  : `<option value="scroll">Scroll</option><option value="fade" selected>Fade</option>`;
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
  $scrollSettings.append(`<section class="settingProperty active" data-setting="sectionName">
    <header>
      <div class="settingHeading" id="setting_sectionName">${creditsType} Name</div>
    </header>
    <div class="editorPropCont" id="editorProp_sectionName">
      <input class="editorProp" id="editorInput_sectionName" value="${creditsName}">
    </div>
  </section>`)
  $editor.append($scrollSettings);
}
function editorGlobal($editor, toggleable) {
  const globalSettingsOptions = ["background","title","subTitle","image","text","name","role"];
  if (toggleable) {
    $editor.append(`<header>
      <h3>Global Settings</h3>
      <input type="checkbox" id="settingEnable_global" class="settingGroupCheck">
    </header>`);
  } else {
    $editor.append(`<header class="active">
      <h3>Global Settings</h3>
    </header>`);
  }
  let $globalSettings = $('<section class="editorGroup" data-level="global"></section>');
  globalSettingsOptions.forEach(setting => {
    if (typeof settings[setting] === 'undefined') {
      $globalSettings.append(settingsMakeProperty(settings, setting, "inactive"))
    } else {
      $globalSettings.append(settingsMakeProperty(settings, setting, "active"))
    }
  });
  $editor.append($globalSettings);
}

function settingsMakeProperty(source, setting, state) {
  let $property = $("<section class='settingProperty' data-setting='"+setting+"'></section>");
  let $header = $("<header></header>");
  let $title = $("<div class='settingHeading' id='setting_"+setting+"'></div>");
  let $check = $("<input type='checkbox' id='settingEnable_"+setting+"' class='settingCheckBox'>");
  let propertyName = setting.replace( /([A-Z])/g, " $1" );
  let title = propertyName.charAt(0).toUpperCase() + propertyName.slice(1) + ' Styles';
  $title.html(title);
  $header.append($title);
  $header.append($check);
  $property.append($header);

  if (state == "active") {
    $property.addClass("active");
    $check.prop("checked", true);
  }

  let $edit = $("<div class='settingPropCont' id='settingProp_"+setting+"'></div>");

  let rules = source[setting];

  let $rulesGroup = $("<div class='settingRuleGroup'></div>");

  for (var key in rules) {
    if (rules.hasOwnProperty(key)) {
      let value = rules[key];
      let $pair = $("<div class='settingRulePair'></div>");
      let $key = $("<input class='settingKeyInput settingProp' list='CSSList'>");
      $key.val(key);
      $key.data("prev", key);
      $pair.append($key);

      let list = "";
      if (key == "color" || key == "background-color") {
        list = ` data-jscolor="{value:'rgba(51,153,255,0.5)', position:'bottom', height:80, backgroundColor:'#333',
        palette:'rgba(0,0,0,0) #fff #808080 #000 #996e36 #f55525 #ffe438 #88dd20 #22e0cd #269aff #bb1cd4',
        paletteCols:11, hideOnPaletteClick:true}"`;
      } else if (dataOptions.map((val)=>val.prop).includes(key)) {
        list = ` list="${key}"`;
      }
      let $value = $(`<input class='settingValueInput settingProp'${list}>`);
      $value.val(value);
      $pair.append($value);
      $rulesGroup.append($pair);
    }
  }

  let $newGroup = $("<div class='settingNewGroup'></div>");
  let $newRule = $("<button class='settingNewRule'>New Rule</button>");
  $newGroup.append($newRule);
  $edit.append($rulesGroup);
  $edit.append($newGroup);

  $property.append($edit);
  return $property;
}

function editorNumChange($target, num) {
  if ($target.closest('.editorProperty').data('prop') == 'duration') {
    $('.creditsSection.active').attr('data-duration', num);
    sendDuration();
    return
  }
  let $content = $('.inEditor.content');
  let isBlock = false;
  if ($content.length == 0) {
    $content = $('.inEditor.block');
    isBlock = true;
  }
  if ($target.closest('.editorGroup').length != 0) {
    $content = $content.closest('.columns');
  }
  if ($content.hasClass('spacing')) {
    $content.css('height', num+'em');
  } else if ($content.hasClass('columns')) {
    $content.attr('data-columns', num);
  } else if ($content.hasClass('imageCont')) {
    $content.children('img').css('max-height', num+'em');
  }
}

$(document).click(function(e) {
  let $target = $(e.target);
  if ($target.hasClass("editorPlus")) {
    let num = $target.next().val();
    num++;
    $target.next().val(num);
    editorNumChange($target, num);
  } else if ($target.hasClass("editorMinus")) {
    let num = $target.prev().val();
    num--;
    $target.prev().val(num);
    editorNumChange($target, num);
  }
});

$(document).change(function(e) {
  let $target = $(e.target);
  if ($target.is('#editorInput_direction')) {
    $('.inEditor.block').attr('data-direction', $target.val());
  } else if ($target.is('#editorInput_type')) {
    let $article = $('.creditsSection.active');
    if ($article.attr('data-name') == $article.attr('data-type')) {
      $article.attr('data-name', $target.val());
      $('.tabButton.active').html($target.val());
    }
    $('#setting_sectionName').html($target.val()+' Name');
    $('#editorSectionName').html($target.val()+' Settings');
    $article.attr('data-type', $target.val());
  } else if ($target.is('#editorInput_sectionName')) {
    $('.creditsSection.active').attr('data-name', $target.val());
    $('.tabButton.active').html($target.val());
  } else if ($target.is('#editorInput_imageHeight')) {
    editorNumChange($target, $target.val());
  } else if ($target.is('#editorInput_duration')) {
    editorNumChange($target, $target.val());
  } else if ($target.hasClass("editorProp")) {
    let value = $target.val();
    let $content = $('.inEditor.content').children('img');
    $content.attr('src', `saves/${currentProject}/images/${value}`);
    $target.next().attr('src', `saves/${currentProject}/images/${value}`);
  }
});
