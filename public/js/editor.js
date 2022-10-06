/*jshint esversion: 6 */

function editorHover($block) {
  if (!$("html").hasClass("editing")) {
    return;
  }
  if ($block.children().length == 0) {
    return;
  }

  let $after = $("<div class='addNewButAfter'><div class='addNewButPlus'></div></div>");
  $block.append($after);

  let $before = $("<div class='addNewButBefore'><div class='addNewButPlus'></div></div>");
  $block.prepend($before);
}
function editorUnHover($block) {
  if ($("html").hasClass("editing")) {
    $block.children().filter(".addNewButAfter").remove();
    $block.children().filter(".addNewButBefore").remove();
  }
}

function editorMakeProperty($json, prop, state) {
  if (prop == "imageHeight" || prop == "maxColumns") {
    return;
  }
  let $property = $("<section class='editorProperty' data-prop='"+prop+"'></section>");
  let $header = $("<header></header>");
  let $title = $("<div class='editorHeading' id='editor_"+prop+"'></div>");
  let $check = $("<input type='checkbox' id='editorEnable_"+prop+"' class='editorCheckBox'>");
  let propertyName = prop.replace( /([A-Z])/g, " $1" );
  let title = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
  $title.html(title);
  $header.append($title);
  $header.append($check);
  $property.append($header);
  if (state == "active") {
    $property.addClass("active");
    $check.prop("checked", true);
  }
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
    case "title":
    case "subTitle":
      $input.val($json[prop]);
      $edit.append($input);
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
      $edit.append($imgSelect);
      $edit.append($img);
      break;
    case "text":
      let text = $json[prop];
      let $newText = $("<button class='editorNewText'></button>");
      if (typeof text == 'object') {
        for (var j = 0; j < text.length; j++) {
          let $textBox = $("<textarea class='editorProp' id='editorInput_"+prop+"'></textarea>");
          $textBox.html(text[j]);
          $edit.append($textBox);
        }
      } else {
        let $textBox = $("<textarea class='editorProp' id='editorInput_"+prop+"'></textarea>");
        $textBox.html($json[prop]);
        $edit.append($textBox);
      }
      $edit.append($newText);
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
    case "names":
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
      console.log("Unknown property: "+prop);

  }
  $property.append($edit);
  return $property;
}

function editorOpen($target) {
  $(".inEditor").removeClass("inEditor");
  $target.addClass("inEditor");
  let $editor = $("#editorCont");
  let $block = $target.closest('.block');
  $block.addClass("inEditor");
  $editor.html("");

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

  const blockSettingsOptions = ["title","subTitle","image","text","name","role"];
  const globalSettingsOptions = ["background","title","subTitle","image","text","name","role"];

  let isBlock = $target.hasClass('block') ? true : false;

  let type = $target.data('type');
  if (!isBlock) {
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
  } else {
    $editor.data('type', 'block')
  }

  if ($block.parent().hasClass('columns')) {
    $editor.append(`<header class="active">
      <h3>Parent Columns</h3>
      <input type="checkbox" id="settingEnable_columns" class="settingGroupCheck" checked>
    </header>`);
    let $columnsSettings = $('<section class="editorGroup"></section>');
    $columnsSettings.append(editorMakeProperty(makeContentObject($block.parent()), 'columns', "active"));
    $editor.append($columnsSettings);
  }

  if (isBlock) {
    $editor.append(`<header class="active">
      <h3>Block Settings</h3>
      <input type="checkbox" id="settingEnable_block" class="settingGroupCheck" checked>
    </header>`);
  } else {
    $editor.append(`<header>
      <h3>Block Settings</h3>
      <input type="checkbox" id="settingEnable_block" class="settingGroupCheck">
    </header>`);
  }
  
  let $blockSettings = $('<section class="editorGroup"></section>');
  let blockSettings = getStylesObject($block[0]);
  blockSettingsOptions.forEach(setting => {
    if (typeof blockSettings[setting] === 'undefined') {
      $blockSettings.append(settingsMakeProperty(blockSettings, setting, "inactive"))
    } else {
      $blockSettings.append(settingsMakeProperty(blockSettings, setting, "active"))
    }
  });
  $editor.append($blockSettings);

  $editor.append(`<header>
    <h3>Global Settings</h3>
    <input type="checkbox" id="settingEnable_global" class="settingGroupCheck">
  </header>`);
  let $globalSettings = $('<section class="editorGroup"></section>');
  globalSettingsOptions.forEach(setting => {
    if (typeof settings[setting] === 'undefined') {
      $globalSettings.append(settingsMakeProperty(settings, setting, "inactive"))
    } else {
      $globalSettings.append(settingsMakeProperty(settings, setting, "active"))
    }
  });
  $editor.append($globalSettings);

  $editor.addClass("open");
}
function editorClose() {
  let $editor = $("#editorCont");
  $editor.removeClass("open");
  $(".inEditor").removeClass("inEditor");
  $("html").removeClass("settings");
}

function updateNames($element, value, type) {
  let index;
  let subIndex;
  let $names = $(".inEditor .names").children();
  if (type == "role" || type == "name") {
    index = $element.closest("#editorNamesGroup").children().index($element.closest(".editorNamesPair"));
    if ($element.siblings().length > 1) {
      subIndex = $element.parent().children().index($element);
      let $nameGroup = $($names[index]).children(".nameGroup").children();
      $($nameGroup[subIndex]).html(value);
    } else {
      $($names[index]).find("."+type).html(value);
    }
  } else {
    index = $element.parent().children().index($element);
    $($names[index]).html(value);
  }
}

function addRoleName($target, name = "Placeholder") {

  let index;
  let subIndex;
  let $names = $(".inEditor .names").children();

  index = $target.closest("#editorNamesGroup").children().index($target.closest(".editorNamesPair"));

  let $namesGroup = $($names[index]).find(".nameGroup");

  if ($namesGroup.length == 0) {
    $namesGroup = $("<div class='nameGroup'></div>");
    let $txt = $($names[index]).find(".name");
    $txt.replaceWith($namesGroup);
    $namesGroup.append($txt);
  }

  let $newTxt = $("<div class='name'>"+name+"</div>");
  $namesGroup.append($newTxt);

  let $newTxtInp;
  if (name == "Placeholder") {
    $newTxtInp = $("<input class='editorNameInput editorProp' placeholder='Placeholder'>");
  } else {
    $newTxtInp = $("<input class='editorNameInput editorProp' value='"+name+"'>");
  }

  $target.before($newTxtInp);
}
function addName(name = "Placeholder") {
  let $targetBlock = $(".inEditor");
  let $txtGrp = $targetBlock.find(".names");
  let $name = $("<div class='name'>"+name+"</div>");
  $txtGrp.append($name);
  let $editName;
  if (name == "Placeholder") {
    $editName = $("<input class='editorNamesInput editorProp' placeholder='Placeholder'>");
  } else {
    $editName = $("<input class='editorNamesInput editorProp' value='"+name+"'>");
  }
  $(".editorNewName").closest("#editorProp_names").find("#editorNamesGroup").append($editName);
}
function addRole(role = "Placeholder") {
  let $targetBlock = $(".inEditor");
  let $txtGrp = $targetBlock.find(".names");
  let $pair = $("<div class='pair'></div>");
  let $role = $("<div class='role'>"+role+"</div>");
  let $name = $("<div class='name'>Placeholder</div>");
  $pair.append($role);
  $pair.append($name);
  $txtGrp.append($pair);

  let $editPair = $("<div class='editorNamesPair'></div>");
  let $editRole;
  if (role == "Placeholder") {
    $editRole = $("<input class='editorRoleInput editorProp' placeholder='Placeholder'>");
  } else {
    $editRole = $("<input class='editorRoleInput editorProp' value='"+role+"'>");
  }
  let $editCont = $("<div class='editorNameGroup'></div>");
  let $editName = $("<input class='editorNameInput editorProp' placeholder='Placeholder'>");
  let $editNew = $("<button class='editorNewPairName'></button>");

  $editPair.append($editRole);
  $editPair.append($editCont);
  $editCont.append($editName);
  $editCont.append($editNew);

  $(".editorNewRole").closest("#editorProp_names").find("#editorNamesGroup").append($editPair);
}

function updateBlock($element, value) {
  let $targetBlock = $(".inEditor");
  let id = $element.attr("id");
  let type = id.substr(12);
  if (type == "maxColumns") {
    findClass = "columns";
  } else if (type == "imageHeight") {
    findClass = "image";
  } else {
    findClass = type;
  }
  let $target = $targetBlock.find("."+findClass);
  switch (type) {
    case "spacing":
      $target.css("height",value+"em");
      break;
    case "imageHeight":
      $target.css("max-height",value+"vh");
      break;
    case "maxColumns":
      $target.attr("class", "columns cols"+value);
      break;
    case "duration":
      $targetBlock.parent().data("duration",value);
      break;
    case "title":
    case "subTitle":
      $target.html(value);
      break;
    case "image":
      let $next = $element.next();
      path = `saves/${currentProject}/images/${value}`;
      if ($next.hasClass("editorImgGrouped")) {
        let index = $element.parent().children("select").index($element);
        $($target[index]).attr("src", path);
      } else {
        $target.attr("src", path);
      }
      $next.attr("src", path);
      break;
    case "text":
      if ($element.parent().children("textarea").length > 1) {
        let index = $element.parent().children("textarea").index($element);
        $($target[index]).html(value);
      } else {
        $target.html(value);
      }
      break;
    default:
      l($target);
      l($element);
      l(value);
      l(type);
  }
  if ($targetBlock.closest(".endFadeGroup").length != 0) {
    updateFadesObject();
  }
}

function addProp(prop) {
  let $block = $(".inEditor");
  let html = buildProperty(prop, dummyBlock);
  $block.append(html);
  if (prop == "columns") {
    addBlockMouseOvers();
  }
  if (prop == "image") {
    let $imgOpt = $(`<option value='../../../img/Placeholder.jpg' selected disabled hidden>Select Image</option>`);
    $("#editorInput_image").append($imgOpt);

    $("#editorImg_image").attr("src", "../../../img/Placeholder.jpg");
  }
}
function removeProp(prop) {
  let $block = $(".inEditor");
  $block.find("."+prop).remove();

  switch (prop) {
    case "text":
      $block.find(".textGroup").remove();
      break;
    case "image":
      $block.find(".imageGroup").remove();
      break;
    case "columns":
      $block.find(".columns").remove();
      break;
  }
  editorOpen($block);
}

function updateSettings(refresh = true) {
  $("#settingsCSS").remove();
  let $settings = $("<style id='settingsCSS' type='text/css'></style>");
  let style = $settings[0];
  $("head").append($settings);
  for (var setting in settings) {
    if (settings.hasOwnProperty(setting)) {
      let rulesTxt = "";
      let rules = settings[setting];
      for (var rule in rules) {
        if (rules.hasOwnProperty(rule)) {
          rulesTxt += rule+":"+rules[rule]+";";
        }
      }
      if (!(style.sheet || {}).insertRule) {
        (style.styleSheet || style.sheet).addRule("."+setting, rulesTxt);
      } else {
        style.sheet.insertRule("."+setting+"{"+rulesTxt+"}",0);
      }
    }
  }

  if (isLight(window.getComputedStyle($("#mainBody")[0]).backgroundColor)) {
    $("html").addClass("light");
  } else {
    $("html").removeClass("light");
  }

  /*if ($("html").hasClass("settings") && refresh) {
    settingsDoOpen();
  } else if ($("html").hasClass("editing")) {
    editorClose();
  }*/
}

function isLight(color) {
    var r, g, b, hsp;
    if (color.match(/^rgb/)) {
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        r = color[1];
        g = color[2];
        b = color[3];
    }
    else {
        color = +("0x" + color.slice(1).replace(
        color.length < 5 && /./g, '$&$&'));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );
    if (hsp>127.5) {
        return true;
    } else {
        return false;
    }
}

function settingsOpen() {
  $("html").removeClass("editing");

  if ($("html").hasClass("settings")) {
    return;
  }
  settingsDoOpen();
}

function settingsToggle() {
  $("html").removeClass("editing");

  if ($("html").hasClass("settings")) {
    $("#editorCont").removeClass("open");
    $("html").removeClass("settings");
    return;
  }
  settingsDoOpen();
}

function settingsDoOpen() {
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
  $("html").addClass("settings");
  $(".inEditor").removeClass("inEditor");
  let $editor = $("#editorCont");
  $editor.html("");
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
  let properties = ["background","title","subTitle","image","text","name","role"];

  for (var setting in settings) {
    if (settings.hasOwnProperty(setting)) {
      $editor.append(settingsMakeProperty(setting, "active"));
    }
  }

  for (var i = 0; i < properties.length; i++) {
    if (!settings.hasOwnProperty(properties[i])){
      $editor.append(settingsMakeProperty(properties[i], "notActive"));
    }
  }
  jscolor.install();
  $editor.addClass("open");
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
        list = `data-jscolor="{value:'rgba(51,153,255,0.5)', position:'bottom', height:80, backgroundColor:'#333',
        palette:'rgba(0,0,0,0) #fff #808080 #000 #996e36 #f55525 #ffe438 #88dd20 #22e0cd #269aff #bb1cd4',
        paletteCols:11, hideOnPaletteClick:true}"`;
      } else if (dataOptions.map((val)=>val.prop).includes(key)) {
        list = `list="${key}"`;
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
  let $content = $('.inEditor.content');
  let isBlock = false;
  if ($content.length == 0) {
    $content = $('.inEditor.block');
    isBlock = true;
  }
  if ($target.closest('.editorGroup').length != 0) {
    $content = $content.closest('.columns');
  }
  console.log($content);
  if ($content.hasClass('spacing')) {
    $content.css('height', num+'em');
  } else if ($content.hasClass('columns')) {
    $content.attr('data-columns', num);
  } else if ($content.hasClass('image')) {
    $content.css('max-height', num+'em');
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
  if ($target.hasClass("editorCheckBox")) {
    let $cont = $target.closest(".editorProperty");
    $cont.toggleClass("active");
    let prop = $target.attr("id").substring(13);
    if ($cont.hasClass("active")) {
      addProp(prop);
    } else {
      removeProp(prop);
    }
  } else if ($target.is("#editorInput_title") || $target.is("#editorInput_subTitle") || $target.is("#editorInput_text")) {
    let value = $target.val();
    updateBlock($target, value);
  } else if ($target.hasClass("editorRoleInput")) {
    let value = $target.val();
    if (value.includes(",")) {
      let names = value.split(",");
      updateNames($target, names[0], "role");
      $target.val(names[0]);
      for (var i = 1; i < names.length; i++) {
        addRole(names[i]);
      }
    } else {
      updateNames($target, value, "role");
    }
  } else if ($target.hasClass("editorNameInput")) {
    let value = $target.val();
    $button = $target.next("button");
    if (value.includes(",")) {
      let names = value.split(",");
      updateNames($target, names[0], "name");
      $target.val(names[0]);
      for (var i = 1; i < names.length; i++) {
        addRoleName($button, names[i]);
      }
    } else {
      updateNames($target, value, "name");
    }
  } else if ($target.hasClass("editorNamesInput")) {
    let value = $target.val();
    if (value.includes(",")) {
      let names = value.split(",");
      updateNames($target, names[0], "nameSolo");
      $target.val(names[0]);
      for (var i = 1; i < names.length; i++) {
        addName(names[i]);
      }
    } else {
      updateNames($target, value, "nameSolo");
    }
  } else if ($target.hasClass("editorProp")) {
    let value = $target.val();
    let $content = $('.inEditor.content');
    $content.attr('src', `saves/${currentProject}/images/${value}`);
    $target.next().attr('src', `saves/${currentProject}/images/${value}`);
  }
});
