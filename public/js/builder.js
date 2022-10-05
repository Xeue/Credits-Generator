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
        let search = `saves/${currentProject}/images/`;
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
          let search = `saves/${currentProject}/images/`;
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

function getCreditsJSON() {
  updateCreditsObject();
  updateFadesObject();

  let returnStr = "var credits = "+JSON.stringify(credits, null, "\t")+"\n";

  if (endFades.length != 0) {
    returnStr += "var endFades = "+JSON.stringify(endFades, null, "\t")+"\n";
  }

  if (settings.length != 0) {
    returnStr += "var settings = "+JSON.stringify(settings, null, "\t");
  }

  return returnStr;
}

function updateCreditsObject() {
  credits = [];
  $("#creditsCont").children().each(function(){
    let credit = makeObject(this);
    credits.push(credit);
  });
}

function updateFadesObject() {
  endFades = [];
  $("#creditsLogos").children().children().each(function(){
    let fade = makeObject(this);
    endFades.push(fade);
  });
  $("#renderFades").html(endFades.map((val)=>val.duration).reduce((a, b) => a + b, 0));
  sendRunMessage("fadesDuration");
}

function getDummyJSON() {
  return "var credits = ["+JSON.stringify(dummyBlock, null, "\t")+"]\n var settings = {'background':{'font-weight':'normal','font-style':'italic', 'background-color':'#000000'},'subTitle':{'margin-top':'5em','margin-bottom':'2em'},'text':{'margin-top':'1em','font-size':'0.8em'},'role':{'font-weight':'bold','font-style':'italic'},'title':{'font-size':'1.2em','font-weight':'bold','margin-top':'2em','margin-bottom':'2em'}}";
}

function load(project) {
  currentProject = project;
  $("#loadFile").val(currentProject);
  let versionString = String($("#loadFile").find(":selected").data("versions"));
  let versions = [];
  versions = versionString.split(",");

  currentVersion = versions.length;

  $("#loadVersion").html("");
  for (var i = 0; i < currentVersion; i++) {
    $("#loadVersion").prepend($("<option value='"+versions[i]+"'>"+versions[i]+"</option>"));
  }

  $("#loadFileBut").val(currentProject);
  $("#loadVersion").val(currentVersion);
  $load = $("#loadVersionBut");
  $load.html("");
  for (var j = 0; j < currentVersion; j++) {
    $load.append($("<option value='"+versions[j]+"'>"+versions[j]+"</option>"));
  }
  $load.append($("<option value='new'>New Version</option>"));

  let $footer = $("#creditsFooter");
  $footer.data("tabs", 0);
  $footer.html('<button id="newFade">+</button>');
  $.get(`save?project=${currentProject}&version=${currentVersion}`)
  .done(function(data) {
    console.log(data);
    images = data.images;
    content = data.content;
    settings = data.globalSettings;
    fonts = globalFonts.concat(data.fonts);
    updateSettings();
    buildCredits(content);
    window.dispatchEvent(loadedEvent);
    $("#creditsFooter").first().click();
  }).fail(function(data) {
    const returnData = JSON.parse(data.responseText);
    alert("Couldn't get requested file: "+JSON.stringify(returnData, "", 4));
  });;
}
