/*jshint esversion: 6 */
function l(val) {
  console.log(val);
}

var dummyBlock = {
  "duration": 1,
  "imageHeight": 24,
  "spacing": 8,
  "image": "../../../img/Placeholder.jpg",
  "title": "Placeholder Title",
  "subTitle": "Placeholder Subtitle",
  "text": "Placeholder text",
  "maxColumns": 2,
  "columns": [{
    "title": "Column 1"
  },{
    "title": "Column 2"
  }],
  "names": [
    {
      "role": "Role",
      "name": "Name"
    },
    "Name 2"
  ]
};

function addBlockMouseOvers() {
  $(".block").each(function () {
    $(this).unbind('mouseenter mouseleave');
    $(this).hover(function() {
      editorHover($(this));
    }, function() {
      editorUnHover($(this));
    });
  });
}

function makeObject(element) {
  let object = {};
  let duration = $(element).parent().data("duration");
  if (typeof duration !== 'undefined') {
    object.duration = duration;
  }
  $(element).children().each(function() {
    if ($(this).hasClass("title")) {
      object.title = $(this).text();
    } else if ($(this).hasClass("subTitle")) {
      object.subTitle = $(this).text();
    } else if ($(this).hasClass("image")) {
      let imgClass = $(this).attr('style');
      if (imgClass.indexOf("vh") !== -1) {
        object.imageHeight = imgClass.substring(12, imgClass.indexOf("vh"));
      }
      let image = $(this).attr("src");
      if (image == "../../../img/Placeholder.jpg") {
        object.image = "../../../img/Placeholder.jpg";
      } else {
        let search = "saves/"+$("#loadFile").find(":selected").val()+"/logo/";
        object.image = image.substring(search.length);
      }
    } else if ($(this).hasClass("imageGroup")) {
      let imageGroup = [];
      $(this).children().each(function() {
        let imgClass = $(this).attr('style');
        if (imgClass.indexOf("vh") !== -1) {
          object.imageHeight = imgClass.substring(12, imgClass.indexOf("vh"));
        }
        let image = $(this).attr("src");
        if (image == "../../../img/Placeholder.jpg") {
          imageGroup.push("../../../img/Placeholder.jpg");
        } else {
          let search = "saves/"+$("#loadFile").find(":selected").val()+"/logo/";
          imageGroup.push(image.substring(search.length));
        }
      });
      object.image = imageGroup;
    } else if ($(this).hasClass("text")) {
      object.text = $(this).text();
    } else if ($(this).hasClass("textGroup")) {
      let text = [];
      $(this).children().each(function() {
        text.push($(this).text());
      });
      object.text = text;
    } else if ($(this).hasClass("spacing")) {
      let height = $(this).attr("style");
      object.spacing = height.substring(7,height.indexOf("em"));
    } else if ($(this).hasClass("names")) {
      let names = [];
      namesArray = $(this).children();
      for (var i = 0; i < namesArray.length; i++) {
        var name = {};
        let $name = $(namesArray[i]);
        if ($name.hasClass("pair")) {
          $name.children().each(function() {
            if ($(this).hasClass("role")) {
              name.role = $(this).text();
            } else if ($(this).hasClass("name")) {
              name.name = $(this).text();
            } else if ($(this).hasClass("nameGroup")) {
              let group = [];
              $(this).children().each(function() {
                group.push($(this).text());
              });
              name.name = group;
            }
          });
        } else if ($name.hasClass("name")) {
          name = $name.text();
        }
        names.push(name);
      }
      object.names = names;
    } else if ($(this).hasClass("columns")) {
      let colsClass = $(this).attr('class');
      if (colsClass.indexOf("cols") !== -1) {
        object.maxColumns = colsClass.substr(colsClass.indexOf("cols")+4);
      }
      let columns = [];
      $(this).children().each(function() {
        columns.push(makeObject(this));
      });
      object.columns = columns;
    }

  });
  return object;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function getCreditsJSON() {
  var creditsObject = [];
  $("#creditsCont").children().each(function(){
    let credit = makeObject(this);
    creditsObject.push(credit);
  });

  var fadesObject = [];
  $("#creditsLogos").children().children().each(function(){
    let fade = makeObject(this);
    fadesObject.push(fade);
  });

  let returnStr = "var credits = "+JSON.stringify(creditsObject, null, "\t")+"\n";

  if (fadesObject.length != 0) {
    returnStr += "var endFades = "+JSON.stringify(fadesObject, null, "\t")+"\n";
  }

  if (settings.length != 0) {
    returnStr += "var settings = "+JSON.stringify(settings, null, "\t");
  }

  return returnStr;
}

function getDummyJSON() {
  return "var credits = ["+JSON.stringify(dummyBlock, null, "\t")+"]\n var settings = {'background':{'font-weight':'normal','font-style':'italic', 'background-color':'#000000'},'subTitle':{'margin-top':'5em','margin-bottom':'2em'},'text':{'margin-top':'1em','font-size':'0.8em'},'role':{'font-weight':'bold','font-style':'italic'},'title':{'font-size':'1.2em','font-weight':'bold','margin-top':'2em','margin-bottom':'2em'}}";
}

function savePopup(context) {
  $("#loadVersionBut").val("new");
  $("#saveButSave").html(context);
  $("#saveHead").html(context);
  $("#newSave").toggleClass("hidden");
  $("#saveForm").data("type", context);
}

function openMenu(e) {
  $(".navSelected").removeClass("navSelected");
  let $ele = $(document.elementFromPoint(e.pageX, e.pageY));
  if ($ele.hasClass("editorImg")) {
    $ele = $ele.prev(".editorProp");
  }
  let $nav = $("nav");
  let prop = $ele.closest(".editorProperty").data("prop");
  let left = e.pageX;
  let width = $(document).width();
  let height = $(document).height();
  let navWidth = $nav.outerWidth();
  let navHeight = $nav.outerHeight();
  let $block = $ele.closest(".block");
  if ((width - left) < navWidth) {
    left = width - navWidth;
  }
  $nav.removeClass("navNoDown");
  $nav.removeClass("navNoUp");
  $nav.removeClass("navFade");
  $nav.removeClass("navBlock");
  if ($ele.hasClass("editorProp") && (prop == "image" || prop == "text" || prop == "names") && !$ele.is("#editorInput_imageHeight")) {
    let top = $ele.offset().top + $ele.outerHeight() + 10;
    if ((top + navHeight - height) > 0) {
      top = $ele.offset().top - navHeight - 10;
      $nav.addClass("above");
      $nav.removeClass("bellow");
    } else {
      $nav.addClass("bellow");
      $nav.removeClass("above");
    }
    left -= (navWidth/2);
    $nav.css("top", top+"px");
    $nav.css("left", left+"px");
    $nav.addClass("navActive");
    $nav.removeClass("navMove");
    if ($ele.parent().siblings(".editorNamesPair").length != 0) {
      $nav.removeClass("navDelete");
    } else if ($ele.siblings(".editorProp").length == 0) {
      $nav.addClass("navDelete");
    } else {
      $nav.removeClass("navDelete");
    }
    if ($ele.siblings("img").length > 0 && prop == "image") {
      prop = "imageGroup";
    }
    selectForMenu($ele, prop);
  } else if ($ele.hasClass("settingProp")) {
    let top = $ele.offset().top + $ele.outerHeight() + 10;
    if ((top + navHeight - height) > 0) {
      top = $ele.offset().top - navHeight - 10;
      $nav.addClass("above");
      $nav.removeClass("bellow");
    } else {
      $nav.addClass("bellow");
      $nav.removeClass("above");
    }
    left -= (navWidth/2);
    $nav.css("top", top+"px");
    $nav.css("left", left+"px");
    $nav.addClass("navActive");
    $nav.removeClass("navMove");
    $nav.addClass("navDelete");
    let setting = $ele.closest(".settingProperty").data("setting");
    $ele.addClass("navSelected");
  } else if ($ele.hasClass("tabButton") && !$ele.is("#creditsButton") && !$ele.is("#newFade") && $("html").hasClass("editing")) {
    $nav.addClass("above");
    $nav.addClass("navFade");
    $nav.removeClass("bellow");
    left -= navWidth/2;
    $nav.css("left", left+"px");
    $nav.addClass("navActive");
    $ele.addClass("navSelected");
    let fadeNum = $ele.attr("id").substring(4);
    $("#fadeCont"+fadeNum).addClass("navSelected");
    $nav.addClass("navDelete");
    $nav.removeClass("navMove");
    navHeight = $nav.outerHeight();
    let top = $ele.offset().top - navHeight - 10;
    $nav.css("top", top+"px");
  } else if ($block.length != 0 && $("html").hasClass("editing")) {
    $nav.removeClass("bellow");
    $nav.removeClass("above");
    $nav.addClass("navBlock");
    $nav.css("top", e.pageY-60+"px");
    $nav.css("left", left+"px");
    $nav.addClass("navActive");
    $block.addClass("navSelected");
    if ($block.prev().length == 0) {
      $nav.addClass("navNoUp");
    } else if ($block.next().length == 0) {
      $nav.addClass("navNoDown");
    }
    if ($block.siblings().length > 0) {
      $nav.removeClass("navMove");
    } else {
      closeMenu();
    }
  } else {
    closeMenu();
  }
}
function closeMenu() {
  let $nav = $("nav");
  $nav.css("top", 0);
  $nav.css("left", 0);
  $nav.removeClass("navActive");
  $(".navSelected").removeClass("navSelected");
}

function selectForMenu($ele, prop) {
  let $targetBlock = $(".inEditor");
  let $target = $targetBlock.find("."+prop);

  switch (prop) {
    case "names":
      let role;
      if ($ele.hasClass("editorRoleInput")) {
        type = "role";
        $ele.parent().addClass("navSelected");
      } else if ($ele.parent().hasClass("editorNameGroup")) {
        type = "name";
        if ($ele.siblings().length != 1) {
          $ele.addClass("navSelected");
        } else {
          $ele.closest(".editorNamesPair").addClass("navSelected");
        }
      } else {
        type = "names";
        $ele.addClass("navSelected");
      }

      let index;
      let subIndex;
      let $names = $(".inEditor .names").children();
      if (type == "role" || type == "name") {
        index = $ele.closest("#editorNamesGroup").children().index($ele.closest(".editorNamesPair"));
        if ($ele.siblings().length > 1) {
          subIndex = $ele.parent().children().index($ele);
          let $nameGroup = $($names[index]).children(".nameGroup").children();
          $($nameGroup[subIndex]).addClass("navSelected");
        } else {
          if (type == "role") {
            $($names[index]).addClass("navSelected");
          } else if ($ele.siblings().length != 1) {
            $($names[index]).find("."+type).addClass("navSelected");
          } else {
            $($names[index]).addClass("navSelected");
          }
        }
      } else {
        index = $ele.parent().children().index($ele);
        $($names[index]).addClass("navSelected");
      }
      break;
    case "imageGroup":
    case "image":
      let $next = $ele.next();
      $next.addClass("navSelected");
      $ele.addClass("navSelected");
      if ($next.hasClass("editorImgGrouped")) {
        let index = $ele.parent().children("select").index($ele);
        $($targetBlock.children(".imageGroup").children()[index]).addClass("navSelected");
      } else {
        $target.addClass("navSelected");
      }
      break;
    case "text":
      $ele.addClass("navSelected");
      if ($ele.parent().children("textarea").length > 1) {
        let index = $ele.parent().children("textarea").index($ele);
        $($target[index]).addClass("navSelected");
      } else {
        $target.addClass("navSelected");
      }
      break;
    default:

  }
}

function updateSettings() {
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
}

function listFonts() {
  let { fonts } = document;
  const it = fonts.entries();

  let arr = [];
  let done = false;

  while (!done) {
    const font = it.next();
    if (!font.done) {
      arr.push(font.value[0].family);
    } else {
      done = font.done;
    }
  }

  // converted to set then arr to filter repetitive values
  return [...new Set(arr)];
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
  $("html").addClass("settings");
  $(".inEditor").removeClass("inEditor");
  let $editor = $("#editorCont");
  $editor.html("");
  let dataOptions = [
    {
      "prop": "background-color",
      "name": "Background Colour - rgba(255,255,255,1), #rrggbbaa",
      "values": ["Black","White","Red","Green","Blue"]
    },{
      "prop": "background-image",
      "name": "Background Image - url(path/to/image)",
      "values": ["url('saves/"+$("#loadFile").find(":selected").val()+"/logo/IMAGE_NAME.png')"]
    },{
      "prop": "color",
      "name": "Text Colour - rgba(255,255,255,1), #rrggbbaa",
      "values": ["Black","White","Red","Green","Blue"]
    },{
      "prop": "font-family",
      "name": "Font",
      "values": listFonts()
    },{
      "prop": "font-size",
      "name": "Font Size - units of px, pt, % & em",
      "values": ["8pt","10pt","12pt","16pt","20pt","24pt","28pt","32pt","36pt","40pt","44pt","48pt"]
    },{
      "prop": "font-weight",
      "name": "Font Weight - bold, bolder, lighter & normal",
      "values": ["lighter","normal","bold","bolder"]
    },{
      "prop": "font-style",
      "name": "Font Style - italic & normal",
      "values": ["italic","normal"]
    }
  ];
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

  $editor.addClass("open");
}

function settingsMakeProperty(setting, state) {
  let $property = $("<section class='settingProperty' data-setting='"+setting+"'></section>");
  let $header = $("<header></header>");
  let $title = $("<div class='settingHeading' id='setting_"+setting+"'></div>");
  let $check = $("<input type='checkbox' id='settingEnable_"+setting+"' class='settingCheckBox'>");
  let propertyName = setting.replace( /([A-Z])/g, " $1" );
  let title = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
  $title.html(title);
  $header.append($title);
  $header.append($check);
  $property.append($header);

  if (state == "active") {
    $property.addClass("active");
    $check.prop("checked", true);
  }

  let $edit = $("<div class='settingPropCont' id='settingProp_"+setting+"'></div>");
  let $input = $("<input class='settingProp' id='settingInput_"+setting+"'>");


  let rules = settings[setting];

  let $rulesGroup = $("<div class='settingRuleGroup'></div>");

  for (var key in rules) {
    if (rules.hasOwnProperty(key)) {
      let value = rules[key];
      let $pair = $("<div class='settingRulePair'></div>");
      let $key = $("<input class='settingKeyInput settingProp' list='CSSList'>");
      $key.val(key);
      $key.data("prev", key);
      $pair.append($key);
      let $value = $("<input class='settingValueInput settingProp'>");
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

function firstTimeCheck() {
  let firstTime = Cookies.get("tutorial");
  if (firstTime != "done") {
    $("#toutorial").toggleClass("hidden");
  }
}

function load() {
  $("#creditsLogos").html("");
  $("#creditsScroller").css("transition", "");
  $("#creditsScroller").css("top", "");
  if (typeof endFades !== 'undefined') {
    endFades = undefined;
  }
  let $footer = $("#creditsFooter");
  $footer.data("tabs", 0);
  $footer.html('<button id="creditsButton" class="tabButton active">Main</button><button id="newFade">+</button>');
  loadScript("saves/"+$("#loadFile").find(":selected").val()+"/"+$("#loadVersion").find(":selected").val()+".js").then(function() {
    var html = "";
    for (var i = 0; i < credits.length; i++) {
      let subHtml = buildBlock(credits[i]);
      html += subHtml;
    }
    $('#creditsCont').html(html);

    if (typeof endFades !== 'undefined') {
      var logoCount = endFades.length;
      var logoTotal = endFades.length;
      endFade(logoCount, logoTotal);
    }

    addBlockMouseOvers();
    updateSettings();
  });
  $("#creditsButton").click();
}

var mouseY = 0;
var mouseX = 0;
$(document).mousemove(function(e) {
  mouseY = e.pageY;
  mouseX = e.pageX;
});

$(document).ready(function() {
  firstTimeCheck();

  $("#loadButton").click(function() {
    load();
  });

  $("#loadFile").change(function(){
    let versionString = String($(this).find(":selected").data("versions"));
    let versions = [];
    versions = versionString.split(",");
    $("#loadVersion").html("");
    for (var i = 0; i < versions.length; i++) {
      $("#loadVersion").prepend($("<option value='"+versions[i]+"'>"+versions[i]+"</option>"));
    }

    $("#loadFileBut").val($("#loadFile").val());
    $("#loadVersion").val(versions.length);
    $load = $("#loadVersionBut");
    $load.html("");
    for (var j = 0; j < versions.length; j++) {
      $load.append($("<option value='"+versions[j]+"'>"+versions[j]+"</option>"));
    }
    $load.append($("<option value='new'>New Version</option>"));
    load();
  });

  $("#loadVersion").change(function(){
    $("#loadVersionBut").val($("#loadVersion").val());
    load();
  });

  $("#loadFileBut").change(function(){
    let versionString = String($(this).find(":selected").data("versions"));
    let versions = [];
    versions = versionString.split(",");
    $load = $("#loadVersionBut");
    $load.html("");
    for (var i = 0; i < versions.length; i++) {
      $load.append($("<option value='"+versions[i]+"'>"+versions[i]+"</option>"));
    }
    $load.append($("<option value='new'>New Version</option>"));
  });

  $("#downloadButton").click(function() {
    let creditsJSON = getCreditsJSON();
    let fileName = $("#loadFile").find(":selected").val()+"_v"+$("#loadVersion").find(":selected").val()+".json";
    download(fileName,creditsJSON);
  });

  $("#editButton").click(function() {

    $("html").removeClass("settings");

    if ($("html").hasClass("editing")) {
      $("#editorCont").removeClass("open");
      $("html").removeClass("editing");
      return;
    }

    $("html").addClass("editing");
    $("#editorCont").html('<div style="padding: 20px;text-align: center;">Select a block to start editing</div>');
  });

  $("#uploadButton").click(function() {
    $("#saveFile").removeClass("hidden");
    $("#saveNew").addClass("selected");
    $("#saveExisting").removeClass("selected");
    $("#saveExisting").removeClass("hidden");
    savePopup("Import");
  });
  $("#saveButton").click(function() {
    $("#saveFile").addClass("hidden");
    $("#saveNew").removeClass("selected");
    $("#saveExisting").removeClass("hidden");
    $("#saveExisting").addClass("selected");
    savePopup("Save");
  });
  $("#newButton").click(function() {
    $("#saveFile").addClass("hidden");
    $("#saveExisting").removeClass("selected");
    $("#saveNew").addClass("selected");
    $("#saveExisting").addClass("hidden");
    savePopup("New");
  });

  $("#uploadImgButton").click(function() {
    $("#uploadImg").toggleClass("hidden");
  });

  $("#downloadMultiButton").click(function() {
    $("#downloadsPopup").toggleClass("hidden");
  });

  $("#downloadButCancel").click(function() {
    $("#downloadsPopup").toggleClass("hidden");
  });

  $("#downloadButDone").click(function() {
    $("#downloadsPopup").toggleClass("hidden");
    if ($("#downloadImg").hasClass("selected")) {
      $("body").append('<iframe style="display:none;" src="images?project='+$("#loadFile").find(":selected").val()+'"></iframe>');
    }
    if ($("#downloadFonts").hasClass("selected")) {
      $("body").append('<iframe style="display:none;" src="fonts?project='+$("#loadFile").find(":selected").val()+'"></iframe>');
    }
    if ($("#downloadTemplate").hasClass("selected")) {
      $("body").append('<iframe style="display:none;" src="template?project='+$("#loadFile").find(":selected").val()+'&version='+$("#loadVersion").find(":selected").val()+'"></iframe>');
    }
  });

  $("#downloadTemplate").click(function() {
    $("#downloadTemplate").toggleClass("selected");
  });

  $("#downloadFonts").click(function() {
    $("#downloadFonts").toggleClass("selected");
  });

  $("#downloadImg").click(function() {
    $("#downloadImg").toggleClass("selected");
  });

  $("#saveButCancel").click(function() {
    $("#newSave").toggleClass("hidden");
  });

  $("#uploadButCancel").click(function() {
    $("#uploadImg").toggleClass("hidden");
  });

  $("#saveButSave").click(function() {
    let type = $("#saveForm").data("type");
    let project,version,file;

    if ($("#saveExisting").hasClass("selected")) {
      project = $("#loadFileBut").val();
      version = $("#loadVersionBut").val();
    } else {
      project = $("#saveNewProject").val();
      let projects = [];
      projects = $("#loadFile").data("projects").split(",");
      if (projects.includes(project)) {
        alert("There is already a project with this name!");
        return;
      }
      version = "new";
    }

    let formdata = new FormData();
    if (type == "Upload") {
      $upload = $("#saveUpload");
      if ($upload.prop('files').length > 0) {
        file = $upload.prop('files')[0];
      } else {
        alert("You didn't upload a file!");
        return;
      }
    } else if (type == "New") {
      file = new Blob([getDummyJSON()], {type: 'text/plain'});
    } else {
      file = new Blob([getCreditsJSON()], {type: 'text/plain'});
    }
    formdata.append("JSON", file, version+".js");
    formdata.append("project", project);
    formdata.append("version", version);

    jQuery.ajax({
      url: "save",
      type: "POST",
      data: formdata,
      processData: false,
      contentType: false,
      success: function (result) {
        if (typeof result !== 'undefined'){
          data = result.message;
          if (data.type == "success") {
            let project = data.project;
            let projects = [];
            projects = $("#loadFile").data("projects").split(",");

            let version = parseInt(data.version);
            let versions = [];
            if (data.version == 1) {
              versions = ["1"];
            } else {
              versions = String($("#proj_"+project).data("versions")).split(",");
            }

            $projSel = $("#loadFile");

            if (!versions.includes(version) && version != 1) {
              versions.push(version);
              if ($projSel.val() == project) {
                let $verOption = $("<option value='"+version+"'>"+version+"</option>");
                let $verSel = $("#loadVersion");
                $verSel.prepend($verOption);
                $verSel.val(version);
              }
            }
            let versStr = versions.join();

            if (!projects.includes(project)) {
              projects.push(project);
              let projStr = projects.join();
              $projSel.data("projects", projStr);

              let $option = $("<option id='proj_"+project+"' value='"+project+"' data-versions='"+versStr+"'>"+project+"</option>");
              $projSel.prepend($option);

              $projSel.val(project);
              $projSel.trigger("change");
              $("#loadButton").click();
            } else {
              $("#proj_"+project).data("versions", versStr);
            }
          }
        }
      }
    });

    $("#newSave").toggleClass("hidden");

  });

  $("#uploadButSave").click(function() {
    project = $("#uploadFileBut").val();

    let formdata = new FormData();

    $upload = $("#uploadImageInput");
    let files = $upload.prop('files');

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        formdata.append("images[]", files[i]);
      }
    } else {
      alert("You didn't upload a file!");
      return;
    }

    if ($("#uploadExisting").hasClass("selected")) {
      project = $("#uploadFileBut").val();
    } else {
      project = $("#uploadNewProject").val();
      let projects = [];
      projects = $("#loadFile").data("projects").split(",");
      if (projects.includes(project)) {
        alert("There is already a project with this name!");
        return;
      }
      formdata.append("new", "true");
    }

    formdata.append("project", project);

    jQuery.ajax({
      url: "media",
      type: "POST",
      data: formdata,
      processData: false,
      contentType: false,
      success: function (result) {
        if (typeof result !== 'undefined') {
          data = JSON.parse(result);
          if (data.type == "success") {
            if (data.new) {
              let project = data.project;
              let $projSel = $("#loadFile");
              let $verSel = $("#loadVersion");

              let $verOption = $("<option value='1'>1</option>");
              $verSel.prepend($verOption);
              $verSel.val(version);

              let $option = $("<option id='proj_"+project+"' value='"+project+"' data-versions='1'>"+project+"</option>");
              $projSel.prepend($option);
              $projSel.val(project);
              $projSel.change();
              $("#loadButton").click();
            }
          }
        }
      }
    }).done(function(data) {
      let result = JSON.parse(data);
      images = result.images;
    });

    $("#uploadImg").toggleClass("hidden");

  });

  $("#saveExisting").click(function() {
    if (!$(this).hasClass("selected")) {
      $(this).toggleClass("selected");
      $("#saveNew").toggleClass("selected");
    }
  });
  $("#saveNew").click(function() {
    if (!$(this).hasClass("selected")) {
      $(this).toggleClass("selected");
      $("#saveExisting").toggleClass("selected");
    }
  });

  $("#uploadExisting").click(function() {
    if (!$(this).hasClass("selected")) {
      $(this).toggleClass("selected");
      $("#uploadNew").toggleClass("selected");
    }
  });
  $("#uploadNew").click(function() {
    if (!$(this).hasClass("selected")) {
      $(this).toggleClass("selected");
      $("#uploadExisting").toggleClass("selected");
    }
  });

  $("#downloadImgButton").click(function() {
    let params = {};
    params.project = $("#loadFile").find(":selected").val();
    $("body").append('<iframe style="display:none;" src="images?project='+$("#loadFile").find(":selected").val()+'"></iframe>');
  });

  $("#full").click(function() {
    if (window.innerWidth == screen.width && window.innerHeight == screen.height) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        $("header").removeClass("hidden");
        $("footer").removeClass("hidden");
        $("#creditsScroller").removeClass("noScroll");
        $("#creditsScroller").css("transition", "");
        $("#creditsScroller").css("top", "");
        for (var i=0; i<timeouts.length; i++) {
          clearTimeout(timeouts[i]);
        }
      }
    } else {
      document.documentElement.requestFullscreen();
      $("header").toggleClass("hidden");
      $("footer").toggleClass("hidden");
      $("#creditsScroller").toggleClass("noScroll");
      $("#creditsScroller").css("transition", "");
      $("#creditsScroller").css("top", "");
      $("html").removeClass("editing");
      $("html").removeClass("settings");
      $("#editorCont").removeClass("open");
    }
  })

  document.addEventListener("fullscreenchange", function() {
    if (window.innerWidth == screen.width && window.innerHeight == screen.height) {
      if (document.exitFullscreen) {

      }
    } else {
      $("header").removeClass("hidden");
      $("footer").removeClass("hidden");
      $("#creditsScroller").removeClass("noScroll");
      $("#creditsScroller").css("transition", "");
      $("#creditsScroller").css("top", "");
      for (var i=0; i<timeouts.length; i++) {
        clearTimeout(timeouts[i]);
      }
    }
  });

  $("#tutClose").click(function() {
    $("#toutorial").toggleClass("hidden");
    Cookies.set("tutorial", "done", { secure: true, SameSite: 'Lax' });
  });
  $("#help").click(function() {
    $("#toutorial").toggleClass("hidden");
    Cookies.set("tutorial", "done", { secure: true, SameSite: 'Lax' });
  });

  $(document).click(function(e) {
    let $target = $(e.target);
    if ($target.hasClass("tabButton")) {
      $(".tabButton").removeClass("active");
      $target.addClass("active");
      if ($target.is("#creditsButton")) {
        $("#creditsLogos").addClass("hidden");
        $("#creditsScroller").removeClass("hidden");
        $(".endFadeGroup").addClass("hidden");
      } else {
        let tabID = $target.attr("id").substring(4);
        $("#creditsScroller").addClass("hidden");
        $("#creditsLogos").removeClass("hidden");
        $(".endFadeGroup").addClass("hidden");
        $("#fadeCont"+tabID).removeClass("hidden");
      }
    } else if ($target.is("#newFade")) {
      $(".tabButton").removeClass("active");
      let $footer = $("#creditsFooter");
      let num = $footer.data("tabs")+1;
      $footer.data("tabs", num);
      let $button = $("<button id='fade"+num+"' class='tabButton active'>Fade "+num+"</button>");
      $footer.append($button);
      $("#creditsScroller").addClass("hidden");
      $("#creditsLogos").removeClass("hidden");
      $(".endFadeGroup").addClass("hidden");
      let $tab = $("<div class='endFadeGroup' id='fadeCont"+num+"'><section class='block'><div class='title'>Placeholder Title</div></section></div>");
      $("#creditsLogos").append($tab);
    } else if ($target.parent().hasClass("addNewButBefore") || $target.parent().hasClass("addNewButAfter")) {
      let $newBlock = $("<section class='block'></section>");
      if ($target.parent().hasClass("addNewButBefore")) {
        $target.closest(".block").before($newBlock);
      } else {
        $target.closest(".block").after($newBlock);
      }
      $newBlock.hover(function() {
        editorHover($newBlock);
      }, function() {
        editorUnHover($newBlock);
      });
      editorOpen($newBlock);
    } else if ($target.is("#navDelete")) {
      $sel = $(".navSelected");
      if ($sel.hasClass("settingProp")) {
        let setting = $sel.closest(".settingProperty").data("setting");
        if ($sel.hasClass("settingKeyInput")) {
          delete settings[setting][$sel.val()];
        } else {
          delete settings[setting][$sel.prev().val()];
        }
        updateSettings();
        settingsOpen();
      }
      if ($sel.hasClass("inEditor")) {
        $("#editorCont").html('<div style="padding: 20px;text-align: center;">Select a block to start editing</div>');
      }
      $sel.remove();
    } else if ($target.is("#navMoveUp")) {
      let $selected = $(".navSelected");
      if ($selected.hasClass("block")) {
        $selected.after($selected.prev());
      } else if ($($selected[2]).hasClass("editorImgGrouped")) {
        $selected = $selected.slice(1);
        let $element = $($selected[0]);
        let $targetBlock = $(".inEditor");
        let $target = $targetBlock.find(".image");
        let $next = $element.next();
        if ($element.prev().hasClass("editorImgGrouped")) {
          if ($next.hasClass("editorImgGrouped")) {
            let index = $element.parent().children("select").index($element);
            $($target[index-1]).before($target[index]);
          } else {
            $target.prev().before($target);
          }
          $element.prev().prev().before($selected);
        }
      } else if ($selected.closest(".editorPropCont").length == 1) {
        $selected.each(function(){
          $(this).after($(this).prev());
        });
      }
    } else if ($target.is("#navMoveDown")) {
      let $selected = $(".navSelected");
      if ($selected.hasClass("block")) {
        $selected.next().insertBefore($selected);
      } else if ($($selected[2]).hasClass("editorImgGrouped")) {
        $selected = $selected.slice(1);
        let $element = $($selected[0]);
        let $targetBlock = $(".inEditor");
        let $target = $targetBlock.children(".imageGroup").find(".image");
        let $next = $element.next();

        if ($element.next().length > 0) {
          if ($next.hasClass("editorImgGrouped")) {
            let index = $element.parent().children("select").index($element);
            $($target[index+1]).after($target[index]);
          } else {
            $target.next().after($target);
          }
          $element.next().next().next().after($selected);
        }

      } else if ($selected.closest(".editorPropCont").length == 1) {
        $selected.each(function(){
          if (!$(this).next().is("button")) {
            $(this).next().insertBefore($(this));
          }
        });
      }
    } else if ($target.is("#settings")) {
      settingsToggle();
    } else if ($target.is("#run")) {
      initRunInBrowser();
    } else if ($target.hasClass("settingNewRule")) {
      let $group = $target.parent().prev();
      let $pair = $("<div class='settingRulePair'></div>");
      let $key = $("<input class='settingKeyInput settingProp' placeholder='Placeholder' data-prev='Placeholder' list='CSSList'>");
      let $value = $("<input class='settingValueInput settingProp' placeholder='Placeholder' data-prev='Placeholder'>");
      $pair.append($key);
      $pair.append($value);
      $group.append($pair);
    } else if (($("html").hasClass("editing") || $("html").hasClass("settings")) && !$target.hasClass("addNewButBefore") && !$target.hasClass("addNewButAfter")) {
      let $block = $target.closest(".block");
      if ($block.length > 0) {
        editorOpen($block);
      } else if ($target.closest("#editorCont").length == 0) {
        //editorClose();
      }
    } else {
      //editorClose();
    }
    closeMenu();
  });

  $(document).change(function(e) {
    let $target = $(e.target);
    if ($target.hasClass("settingCheckBox")) {
      let $cont = $target.closest(".settingProperty");
      if ($cont.hasClass("active")) {
        $cont.toggleClass("active");
        $cont.find(".settingRuleGroup").html("");
        delete settings[$cont.data("setting")];
        updateSettings();
      } else {
        $cont.toggleClass("active");
        $cont.find(".settingNewRule").click();
        settings[$cont.data("setting")] = {};
      }
    } else if ($target.hasClass("settingKeyInput")) {
      let $cont = $target.closest(".settingProperty");
      let setting = $cont.data("setting");
      let cls = settings[setting];
      let prev = $target.data("prev");
      let value = $target.val();
      $target.data("prev", value);
      delete cls[prev];
      cls[value] = $target.next().val();
      $target.next().attr("list", value);
      updateSettings();
      settingsOpen();
    } else if ($target.hasClass("settingValueInput")) {
      let $cont = $target.closest(".settingProperty");
      let setting = $cont.data("setting");

      let cls = settings[setting];

      let value = $target.val();
      let key = $target.prev().val();

      cls[key] = value;
      updateSettings();
      settingsOpen();
    }
  });

  $("#loadFile").trigger("change");
});

if (document.addEventListener) {
  document.addEventListener('contextmenu', function(e) {
    openMenu(e);
    e.preventDefault();
  }, false);
} else {
  document.attachEvent('oncontextmenu', function() {
    openMenu(e);
    window.event.returnValue = false;
  });
}
