function firstTimeCheck() {
    let firstTime = Cookies.get("tutorial");
    if (firstTime != "done") {
        $("#toutorial").removeClass("hidden");
    }
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

function savePopup(context) {
    $("#loadVersionBut").val("new");
    $("#saveButSave").html(context);
    $("#saveHead").html(context);
    $("#newSave").toggleClass("hidden");
    $("#saveForm").data("type", context);
}

function openMenu(e) {
    $(".menuSelected").removeClass("menuSelected");
    let $ele = $(document.elementFromPoint(e.pageX, e.pageY));
    if ($ele.hasClass("editorImg")) {
        $ele = $ele.prev(".editorProp");
    }
    let $menu = $("menu");
    let prop = $ele.closest(".editorProperty").data("prop");
    let left = e.pageX;
    let width = $(document).width();
    let height = $(document).height();
    let menuWidth = $menu.outerWidth();
    let menuHeight = $menu.outerHeight();
    let $block = $ele.closest(".block");
    if ((width - left) < menuWidth) {
        left = width - menuWidth;
    }
    $menu.removeClass("menuNoDown");
    $menu.removeClass("menuNoUp");
    $menu.removeClass("menuFade");
    $menu.removeClass("menuBlock");
    if ($ele.hasClass("editorProp") && (prop == "image" || prop == "text" || prop == "names") && !$ele.is("#editorInput_imageHeight")) {
        let top = $ele.offset().top + $ele.outerHeight() + 10;
        if ((top + menuHeight - height) > 0) {
            top = $ele.offset().top - menuHeight - 10;
            $menu.addClass("above");
            $menu.removeClass("bellow");
        } else {
            $menu.addClass("bellow");
            $menu.removeClass("above");
        }
        left -= (menuWidth/2);
        $menu.css("top", top+"px");
        $menu.css("left", left+"px");
        $menu.addClass("menuActive");
        $menu.removeClass("menuMove");
        if ($ele.parent().siblings(".editorNamesPair").length != 0) {
            $menu.removeClass("menuDelete");
        } else if ($ele.siblings(".editorProp").length == 0) {
            $menu.addClass("menuDelete");
        } else {
            $menu.removeClass("menuDelete");
        }
        if ($ele.siblings("img").length > 0 && prop == "image") {
            prop = "imageGroup";
        }
        selectForMenu($ele, prop);
    } else if ($ele.hasClass("settingProp")) {
        let top = $ele.offset().top + $ele.outerHeight() + 10;
        if ((top + menuHeight - height) > 0) {
            top = $ele.offset().top - menuHeight - 10;
            $menu.addClass("above");
            $menu.removeClass("bellow");
        } else {
            $menu.addClass("bellow");
            $menu.removeClass("above");
        }
        left -= (menuWidth/2);
        $menu.css("top", top+"px");
        $menu.css("left", left+"px");
        $menu.addClass("menuActive");
        $menu.removeClass("menuMove");
        $menu.addClass("menuDelete");
        let setting = $ele.closest(".settingProperty").data("setting");
        $ele.addClass("menuSelected");
    } else if ($ele.hasClass("tabButton") && !$ele.is("#creditsButton") && !$ele.is("#newFade") && $("html").hasClass("editing")) {
        $menu.addClass("above");
        $menu.addClass("menuFade");
        $menu.removeClass("bellow");
        left -= menuWidth/2;
        $menu.css("left", left+"px");
        $menu.addClass("menuActive");
        $ele.addClass("menuSelected");
        let fadeNum = $ele.attr("id").substring(4);
        $("#fadeCont"+fadeNum).addClass("menuSelected");
        $menu.addClass("menuDelete");
        $menu.removeClass("menuMove");
        menuHeight = $menu.outerHeight();
        let top = $ele.offset().top - menuHeight - 10;
        $menu.css("top", top+"px");
    } else if ($block.length != 0 && $("html").hasClass("editing")) {
        $menu.removeClass("bellow");
        $menu.removeClass("above");
        $menu.addClass("menuBlock");
        $menu.css("top", e.pageY-60+"px");
        $menu.css("left", left+"px");
        $menu.addClass("menuActive");
        $block.addClass("menuSelected");
        if ($block.prev().length == 0) {
            $menu.addClass("menuNoUp");
        } else if ($block.next().length == 0) {
            $menu.addClass("menuNoDown");
        }
        if ($block.siblings().length > 0) {
            $menu.removeClass("menuMove");
        } else {
            closeMenu();
        }
    } else {
        closeMenu();
    }
}
function closeMenu() {
    let $menu = $("menu");
    $menu.css("top", 0);
    $menu.css("left", 0);
    $menu.removeClass("menuActive");
    $(".menuSelected").removeClass("menuSelected");
}

function selectForMenu($ele, prop) {
    let $targetBlock = $(".inEditor");
    let $target = $targetBlock.find("."+prop);

    switch (prop) {
        case "names":
            let role;
            if ($ele.hasClass("editorRoleInput")) {
                type = "role";
                $ele.parent().addClass("menuSelected");
            } else if ($ele.parent().hasClass("editorNameGroup")) {
                type = "name";
                if ($ele.siblings().length != 1) {
                    $ele.addClass("menuSelected");
                } else {
                    $ele.closest(".editorNamesPair").addClass("menuSelected");
                }
            } else {
                type = "names";
                $ele.addClass("menuSelected");
            }

            let index;
            let subIndex;
            let $names = $(".inEditor .names").children();
            if (type == "role" || type == "name") {
                index = $ele.closest("#editorNamesGroup").children().index($ele.closest(".editorNamesPair"));
                if ($ele.siblings().length > 1) {
                    subIndex = $ele.parent().children().index($ele);
                    let $nameGroup = $($names[index]).children(".nameGroup").children();
                    $($nameGroup[subIndex]).addClass("menuSelected");
                } else {
                    if (type == "role") {
                        $($names[index]).addClass("menuSelected");
                    } else if ($ele.siblings().length != 1) {
                        $($names[index]).find("."+type).addClass("menuSelected");
                    } else {
                        $($names[index]).addClass("menuSelected");
                    }
                }
            } else {
                index = $ele.parent().children().index($ele);
                $($names[index]).addClass("menuSelected");
            }
            break;
        case "imageGroup":
        case "image":
            let $next = $ele.next();
            $next.addClass("menuSelected");
            $ele.addClass("menuSelected");
            if ($next.hasClass("editorImgGrouped")) {
                let index = $ele.parent().children("select").index($ele);
                $($targetBlock.children(".imageGroup").children()[index]).addClass("menuSelected");
            } else {
                $target.addClass("menuSelected");
            }
            break;
        case "text":
            $ele.addClass("menuSelected");
            if ($ele.parent().children("textarea").length > 1) {
                let index = $ele.parent().children("textarea").index($ele);
                $($target[index]).addClass("menuSelected");
            } else {
                $target.addClass("menuSelected");
            }
            break;
        default:
    }
}

function toggleUI() {
  $("header").toggleClass("hidden");
  $("footer").toggleClass("hidden");
  $("#creditsScroller").removeClass("noScroll");
  $("html").removeClass("editing");
  $("html").removeClass("settings");
  $("#editorCont").removeClass("open");
}

function reset() {
  $("#creditsScroller").css("transition", "");
  $("#creditsScroller").css("top", "");
  $("#creditsScroller").addClass("noScroll");
  for (var i=0; i<timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
  $("#creditsButton").click();
}

function initRunInBrowser() {
  runWindow = window.open("/run", 1, "directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=yes,resizable=yes,width=900,height=128");
}

function runCommand(event) {
  obj = JSON.parse(event.data);
  switch (obj.command) {
    case "loaded":
      sendRunMessage("fadesDuration");
      break;
    case "run":
      runCredits();
      break;
    case "toggleUI":
      toggleUI()
      break;
    case "hideUI":
      $("header").addClass("hidden");
      $("footer").addClass("hidden");
      $("#creditsScroller").addClass("noScroll");
      $("html").removeClass("editing");
      $("html").removeClass("settings");
      $("#editorCont").removeClass("open");
      break;
    case "setTime":
      runTime = parseInt(obj.time);
      break;
    case "reset":
      reset();
      break;
    default:

  }
}

function sendRunMessage(type) {
  if (!runWindow) return
  switch (type) {
    case "fadesDuration":
      let data;
      if (!endFades) {
        data = [0];
      } else {
        data = endFades.map((val)=>val.duration)
      }
      runWindow.postMessage({
        "command":"fadesDuration",
        "data": data
      });
      break;
    default:
      break;
  }
}

function doSave() {
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
              load(project);
            } else {
              $("#proj_"+project).data("versions", versStr);
            }
          }
        }
      }
    });

    $("#newSave").toggleClass("hidden");
}

function doUploadSave() {
    project = $("#uploadFileBut").val();

    let formdata = new FormData();

    $upload = $("#uploadImageInput");
    let files = $upload.prop('files');

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        formdata.append("files[]", files[i]);
      }
    } else {
      alert("You haven't selected any files!");
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

    let destination;
    if ($("#uploadMedia").hasClass("uploadFont")) {
      destination = "fonts";
    } else {
      destination = "images";
    }
    $.ajax({
      url: destination,
      type: "POST",
      data: formdata,
      processData: false,
      contentType: false
    }).done(function(data) {
      if (typeof data !== 'undefined') {
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
            load(project);
          }
        }
        updateSaves(data.saves);
        if (!$("#gallery").hasClass("hidden")) {
          doOpenGallery();
        }
      }
    });

    $("#uploadMedia").toggleClass("hidden");

}

function doOpenGallery() {
  const validImageTypes = [
    "png",
    "svg",
    "jpg",
    "jpeg"
  ];
  const validFontTypes = [
    "otf",
    "ttf"
  ];
  $("#galleryImages").html("");
  $("#galleryFonts").html("");

  fonts.forEach(font => {
    let fontArr = font.split('.');
    const fontType = fontArr.pop();
    const fontFile = fontArr.join('.');
    let fontName = fontFile.replace(/[A-Z][a-z]/g, ' $&').trim();
    fontName = fontName.replace(/-|_/g, ' ');
    fontName = fontName.charAt(0).toUpperCase() + fontName.slice(1);
    if (validFontTypes.includes(fontType)) {
      let enabled = "";
      if (globalFonts.includes(font)) {
        enabled = "disabled";
      }
      const $font = $(`<div class="galleryPreviews">
        <header class="galleryType-${fontType}"><span>${fontName}</span></header>
        <div class="galleryFontDemo" style="font-family: ${font.substring(0,font.indexOf("."))}">123 abc ABC</div>
        <div class="galleryFontDemoMore" style="font-family: ${font.substring(0,font.indexOf("."))}">
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
      </div>`);
      $("#galleryFonts").append($font);
    }
  });

  for (const imageObj in images[currentProject]) {
    const image = images[currentProject][imageObj];
    let imgArr = image.split('.');
    const imageType = imgArr.pop();
    const imageFile = imgArr.join('.');
    let imageName = imageFile.replace(/[A-Z][a-z]/g, ' $&').trim();
    imageName = imageName.replace(/-|_/g, ' ');
    imageName = imageName.charAt(0).toUpperCase() + imageName.slice(1);
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
      </div>`);
      $("#galleryImages").append($image);
    }
  }
}

function updateSaves(saves) {
  for (const key in saves) {
    projectFonts[key] = saves[key].fonts;
    images[key] = saves[key].images;
  }
  fonts = globalFonts.concat(Object.values(projectFonts[currentProject]));

  let $list = $("#font-family");
  $list.html();
  fonts.forEach(font => {
    let fontArr = font.split('.');
    fontArr.pop();
    const fontName = fontArr.join('.');
    let $dataOption = $(`<option value='${fontName}'>${fontName}</option>`);
    $list.append($dataOption);
  });

  let $backgroundImg = $("#background-image");
  $backgroundImg.html();
  const imagesArr = Object.values(projectFonts[currentProject]);
  imagesArr.forEach(image => {
    let $dataOption = $(`<option value='${image}'>${image}</option>`);
    $backgroundImg.append($dataOption);
  });
}

var mouseY = 0;
var mouseX = 0;
$(document).mousemove(function(e) {
  mouseY = e.pageY;
  mouseX = e.pageX;
});

$(document).ready(function() {
    window.addEventListener("message", runCommand, false);
    firstTimeCheck();

    $("#loadFile").change(function(){
      load($("#loadFile").val());
    });

    $("#loadVersion").change(function(){
      currentVersion = $("#loadVersion").val();
      $("#loadVersionBut").val(currentVersion);
      load(currentProject);
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

    $("#uploadMediaButton").click(function() {
      $("#uploadMedia").toggleClass("hidden");
      $("#uploadMedia").addClass("uploadMedia");
      $("#uploadMedia").removeClass("uploadFont");
    });
    $("#uploadFontButton").click(function() {
      $("#uploadMedia").toggleClass("hidden");
      $("#uploadMedia").removeClass("uploadMedia");
      $("#uploadMedia").addClass("uploadFont");
    });

    $("#renderButton").click(function() {
      $("#render").toggleClass("hidden");
    });
    $("#renderClose").click(function() {
      $("#render").toggleClass("hidden");
    });
    $("#renderDo").click(function() {
      processRenderInfo();
      $.get('/render', {
        fps: renderDetails.frameRate,
        resolution: renderDetails.resolution,
        frames: renderDetails.totalFrames,
        project: currentProject,
        version: currentVersion
      }).done(function(data) {
        const a = document.createElement("a");
        a.style.display = "none";
        document.body.appendChild(a);
        type = "text/plain";
        a.href = window.URL.createObjectURL(
          new Blob([data], { type })
        );
        a.setAttribute("download", `${currentProject}_credits`);
        a.click();
        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
      });
    });

    $("#galleryButton").click(function() {
      doOpenGallery();
      $("#gallery").toggleClass("hidden");
    });

    $("#galleryButClose").click(function() {
      $("#gallery").toggleClass("hidden");
    });

    $("#galleryRefresh").click(function() {
      doOpenGallery();
    });

    $("#downloadMultiButton").click(function() {
      $("#downloadsPopup").toggleClass("hidden");
    });

    $("#downloadButCancel").click(function() {
      $("#downloadsPopup").toggleClass("hidden");
    });

    $("#downloadButDone").click(function() {
      $("#downloadsPopup").toggleClass("hidden");
      if ($("#downloadFile").next().prop("checked")) {
        let creditsJSON = getCreditsJSON();
        let fileName = `${currentProject}_v${currentVersion}.json`;
        download(fileName,creditsJSON);
      }
      if ($("#downloadImg").next().prop("checked")) {
        $("body").append(`<iframe style="display:none;" src="images?project=${currentProject}"></iframe>`);
      }
      if ($("#downloadFonts").next().prop("checked")) {
        $("body").append(`<iframe style="display:none;" src="fonts?project=${currentProject}"></iframe>`);
      }
      if ($("#downloadTemplate").next().prop("checked")) {
        $("body").append(`<iframe style="display:none;" src="template?project=${currentProject}&version=${currentVersion}"></iframe>`);
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
      $("#uploadMedia").toggleClass("hidden");
    });

    $("#saveButSave").click(function() {
        doSave();
    });

    $("#uploadButSave").click(function() {
        doUploadSave();
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
      $("body").append(`<iframe style="display:none;" src="images?project=${currentProject}"></iframe>`);
    });

    $("#full").click(function() {
      if (window.innerWidth == screen.width && window.innerHeight == screen.height) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          //$("header").removeClass("hidden");
          //$("footer").removeClass("hidden");
          //$("#creditsScroller").removeClass("noScroll");
          $("#creditsScroller").css("transition", "");
          $("#creditsScroller").css("top", "");
          for (var i=0; i<timeouts.length; i++) {
            clearTimeout(timeouts[i]);
          }
        }
      } else {
        document.documentElement.requestFullscreen();
        //$("header").toggleClass("hidden");
        //$("footer").toggleClass("hidden");
        //$("#creditsScroller").toggleClass("noScroll");
        $("#creditsScroller").css("transition", "");
        $("#creditsScroller").css("top", "");
        //$("html").removeClass("editing");
        //$("html").removeClass("settings");
        //$("#editorCont").removeClass("open");
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

      if ($target.hasClass('content')) {
        $('.content').attr('contenteditable', 'false');
        if ($('html').hasClass('editing')) {
          $target.attr('contenteditable', 'true');
          $target.focus();
          $target.on('blur', () => {
            $target.attr('contenteditable', 'false');
          });
        } else {
          $target.attr('contenteditable', 'false')
        }
      }

      if ($target.hasClass("tabButton")) {
        $(".tabButton").removeClass("active");
        $target.addClass("active");
        if ($target.is("#creditsButton")) {
          $("#creditsLogos").addClass("hidden");
          $("#creditsScroller").removeClass("hidden");
          $(".endFadeGroup").addClass("hidden");
          if ($("html").hasClass("editing")) {
            editorOpen($($("#creditsCont").find(".block")[0]));
          }
        } else {
          let tabID = $target.attr("id").substring(4);
          $("#creditsScroller").addClass("hidden");
          $("#creditsLogos").removeClass("hidden");
          $(".endFadeGroup").addClass("hidden");
          $("#fadeCont"+tabID).removeClass("hidden");
          if ($("html").hasClass("editing")) {
            editorOpen($($("#fadeCont"+tabID).find(".block")[0]));
          }
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
      } else if ($target.is("#menuDelete")) {
        $sel = $(".menuSelected");
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
      } else if ($target.is("#menuMoveUp")) {
        let $selected = $(".menuSelected");
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
      } else if ($target.is("#menuMoveDown")) {
        let $selected = $(".menuSelected");
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
      } else if ($target.hasClass("galleryMore")) {
        $target.closest(".galleryPreviews").toggleClass("moreFonts");
      } else if ($target.hasClass("gallerySize")) {
        $target.closest(".galleryPreviews").toggleClass("biggerImages");
      } else if ($target.hasClass("galleryDelete")) {
        $.delete(`${$target.data("type")}?file=${$target.data("filename")}&project=${currentProject}`, function(data) {
          console.log(data);
          updateSaves(data.saves);
          doOpenGallery();
        }).fail(function(data) {
          alert("Failed to delete font error: "+JSON.stringify(data.responseJSON.error));
          updateSaves(data.responseJSON.saves);
          doOpenGallery();
        });
      } else if ($("html").hasClass("editing") && !$target.hasClass("addNewButBefore") && !$target.hasClass("addNewButAfter")) {
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
        updateSettings(true);
      } else if ($target.hasClass("settingValueInput")) {
        let $cont = $target.closest(".settingProperty");
        let setting = $cont.data("setting");

        let cls = settings[setting];

        let value = $target.val();
        let key = $target.prev().val();

        cls[key] = value;
        updateSettings(false);
      }
    });

    load(defaultProject);
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

jQuery.each( [ "put", "delete" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});

$(document).keyup(function(e) {
  if (e.key === "Escape") {
    if ($("#creditsFooter").hasClass("hidden")) {
      toggleUI();
      reset();
    }
 }
});
