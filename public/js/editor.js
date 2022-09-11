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
  $block.addClass("hover");

  let $before = $("<div class='addNewButBefore'><div class='addNewButPlus'></div></div>");
  $block.prepend($before);
}
function editorUnHover($block) {
  if ($("html").hasClass("editing")) {
    $block.children().filter(".addNewButAfter").remove();
    $block.children().filter(".addNewButBefore").remove();
    $block.removeClass("hover");
  }
}

function editorMakeProperty($json, prop, state, index) {
  if (prop == "imageHeight" || prop == "maxColumns") {
    return;
  }
  let $property = $("<section class='editorProperty' data-prop='"+prop+"'></section>");
  $property.css("order", index);
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
        $inputImg.val(24);
      }
      $editImg.append($plusImg);
      $editImg.append($inputImg);
      $editImg.append($minusImg);
      $label = $("<div class='propertyLabel'>Set max image height:</div>")
      $edit.append($label);
      $edit.append($editImg);

      let imgs = $json[prop];
      if (typeof imgs == 'object') {
        for (var i = 0; i < imgs.length; i++) {
          let $img = $("<img class='editorImgGrouped img_"+i+"' id='editorImg_"+prop+"'>");
          if (state == "active") {
            let src = "saves/"+$("#loadFile").find(":selected").val()+"/images/"+imgs[i];
            $img.attr("src", src);
          }

          $imgSelect = $("<select class='editorProp img_"+i+"' data-imgnum='"+i+"' id='editorInput_"+prop+"'></select>");
          let project = $("#loadFileBut").val();
          let projImages = images[project];
          for (var projImg in projImages) {
            if (projImages.hasOwnProperty(projImg)) {
              let $imgOpt;
              if (projImages[projImg] == imgs[i]) {
                $imgOpt = $(`<option selected value='${projImages[projImg]}'>${projImages[projImg]}</option>`);
              } else {
                $imgOpt = $(`<option value='${projImages[projImg]}'>${projImages[projImg]}</option>`);
              }
              $imgSelect.append($imgOpt);
            }
          }
          $edit.append($imgSelect);
          $edit.append($img);
        }
      } else {
        let $img = $("<img class='editorImg' id='editorImg_"+prop+"'>");
        if (state == "active") {
          let src = "saves/"+$("#loadFile").find(":selected").val()+"/images/"+imgs;
          $img.attr("src", src);
        }
        let $imgSelect = $("<select class='editorProp img_1' data-imgnum='1' id='editorInput_"+prop+"'></select>");
        let project = $("#loadFileBut").val();
        let projImages = images[project];
        for (var projImage in projImages) {
          if (projImages.hasOwnProperty(projImage)) {
            let $imgOpt;
            if (projImages[projImage] == $json[prop]) {
              $imgOpt = $(`<option selected value='${projImages[projImage]}'>${projImages[projImage]}</option>`);
            } else {
              $imgOpt = $(`<option value='${projImages[projImage]}'>${projImages[projImage]}</option>`);
            }
            $imgSelect.append($imgOpt);
          }
        }
        $edit.append($imgSelect);
        $edit.append($img);
      }
      let $newImg = $("<button class='editorNewImage'></button>");
      $edit.append($newImg);
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
        $inputCol.val($json["maxColumns"]);
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

function editorOpen($block) {
  $(".inEditor").removeClass("inEditor");
  $block.addClass("inEditor");
  let $editor = $("#editorCont");
  $editor.html("");
  let $json = makeObject($block);
  let properties = ["spacing","duration","title","subTitle","image","imageHeight","text","columns","maxColumns","names"];
  let index = 1;

  for (var property in $json) {
    if ($json.hasOwnProperty(property)) {
      $editor.append(editorMakeProperty($json, property, "active", index));
      index++;
    }
  }

  for (var i = 0; i < properties.length; i++) {
    if (!$json.hasOwnProperty(properties[i])){
      $editor.append(editorMakeProperty($json, properties[i], "notActive", index));
      index++;
    }
  }

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
  if ($target.length == 0) {
    l("Depreceated?");
    let html = buildProperty(type, dummyBlock);
    $targetBlock.append(html);
  }
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
      path = "saves/"+$("#loadFile").find(":selected").val()+"/images/"+value;
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

function orderEditor(curIndex, newIndex) {

  let $editor = $("#editorCont");
  let $props = $editor.children();
  let $block = $(".inEditor");
  let typeOld = $($props[curIndex]).data("prop");
  let typeNew;

  if (curIndex > newIndex && newIndex != 0) {
    $($props[newIndex-1]).after($props[curIndex]);
    typeNew = $($props[newIndex-1]).data("prop");
  } else if (newIndex != 0) {
    $($props[newIndex]).after($props[curIndex]);
    typeNew = $($props[newIndex]).data("prop");
  } else {
    $($props[newIndex]).before($props[curIndex]);
    typeNew = $($props[newIndex]).data("prop");
  }

  let $old = $block.children("."+typeOld);
  if ($old.length == 0 && typeOld == "image") {
    $old = $block.children(".imageGroup");
  }
  let $new = $block.children("."+typeNew);

  if (curIndex > newIndex && newIndex != 0) {
    $($new).after($old);
  } else if (newIndex != 0) {
    $($new).after($old);
  } else {
    $($new).before($old);
  }

  $props = $editor.children();
  for (var prop in $props) {
    if ($props.hasOwnProperty(prop)) {
      $($props[prop]).css("order", parseInt(prop)+1);
    }
  }
}

$(document).click(function(e) {
  let $target = $(e.target);
  if ($target.hasClass("editorPlus")) {
    let num = $target.next().val();
    num++;
    $target.next().val(num);
    updateBlock($target.next(), num);
  } else if ($target.hasClass("editorMinus")) {
    let num = $target.prev().val();
    num--;
    $target.prev().val(num);
    updateBlock($target.prev(), num);
  } else if ($target.hasClass("editorNewPairName")) {
    addRoleName($target);
  } else if ($target.hasClass("editorNewRole")) {
    addRole();
  } else if ($target.hasClass("editorNewName")) {
    addName();
  } else if ($target.hasClass("editorNewText")) {
    let $targetBlock = $(".inEditor");
    let $txtGrp = $targetBlock.find(".textGroup");
    if ($txtGrp.length == 0) {
      $txtGrp = $("<div class='textGroup'></div>");
      let $txt = $targetBlock.find(".text");
      $txt.replaceWith($txtGrp);
      $txtGrp.append($txt);
    }
    let $newTxt = $("<div class='text'>Placeholder</div>");
    $txtGrp.append($newTxt);
    let $newTxtInp = $("<textarea class='editorProp' id='editorInput_text'>Placeholder</textarea>");
    $target.before($newTxtInp);
  } else if ($target.hasClass("editorNewImage")) {
    let $targetBlock = $(".inEditor");

    let imageNum = $($target.prevAll(".editorProp")[0]).data("imgnum");

    $inpt = $(`<select class='editorProp img_${++imageNum}' id='editorInput_image' data-imgnum='${imageNum}'></select>`);
    let project = $("#loadFileBut").val();
    let projImages = images[project];
    for (var projImg in projImages) {
      if (projImages.hasOwnProperty(projImg)) {
        let $imgOpt = $(`<option value='${projImages[projImg]}'>${projImages[projImg]}</option>`);
        $inpt.append($imgOpt);
      }
    }

    let $imgOpt = $(`<option value='../../../img/Placeholder.jpg' selected disabled hidden>Select Image</option>`);
    $inpt.append($imgOpt);

    let $imgPrev = $("<img class='editorImg' id='editorImg_image' src='../../../img/Placeholder.jpg'>");
    $target.before($inpt);
    $target.before($imgPrev);
    $target.parent().children("img").addClass("editorImgGrouped");
    let $imgNew = $("<img class='image' src='../../../img/Placeholder.jpg'>");
    let imageHeight = $("#editorInput_imageHeight").val();
    $imgNew.css("max-height", imageHeight+"vh");

    if ($targetBlock.children(".imageGroup").length == 0) {
      let $imgGroup = $("<div class='imageGroup'></div>");
      let $targetImg = $targetBlock.children(".image");
      $targetImg.replaceWith($imgGroup);
      $imgGroup.append($targetImg);
      $imgGroup.append($imgNew);
    } else {
      $targetBlock.children(".imageGroup").append($imgNew);
    }
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
    updateBlock($target, value);
  }
});

$(document).mousedown(function(e) {
  let $target = $(e.target);
  let $prop = $target.parent();
  if ($prop.hasClass("editorProperty") && $target.is("header")) {
    ordering = true;
    if ($("#dragBox").length != 0) {
      $("#dragBox").remove();
    }
    let pos = $prop.position();
    let order = $prop.css("order");
    $prop.before($("<div id='dragBox' class='editorProperty active' style='height:"+$prop.height()+"px; order: "+order+"'></div>"));
    $prop.addClass("dragging");
    timeout = setInterval(function() {
      $prop.css("top", mouseY-30+$("aside").scrollTop());
    }, 10);
  }
});

$(document).mouseup(function(e) {
  let $target = $(e.target);
  if ($target.parent().hasClass("editorProperty") && $target.is("header")) {
    clearInterval(timeout);
  }
  if (ordering) {
    setTimeout(function() {
      let width = $(document).width()-100;
      let $oldPos = $target.parent();
      let $newPos = $(document.elementFromPoint(width, mouseY)).closest(".editorProperty");

      let oldIndex = $oldPos.parent().children().index($oldPos);
      let newIndex = $newPos.parent().children().index($newPos);

      orderEditor(oldIndex,newIndex);
    }, 10);
    ordering = false;
  }
  $(".dragging").removeClass("dragging");
  if ($("#dragBox").length != 0) {
    $("#dragBox").remove();
  }
});
