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

function getCreditsJSON() {
  let content = [];
  $('#creditsCont').children().each(function(index) {
    $content = $(this);
    content.push({
      "type": $content.attr('data-type'),
      "name": $content.attr('data-name'),
      "duration": $content.attr('data-duration'),
      "blocks": makeBlocksObject($content.children())
    })
  })
  return JSON.stringify({
    "globalSettings": settings,
    "images": images,
    "fonts": fonts,
    "content": content,
  }, null, 4)
}

function makeBlocksObject($blocks) {
  let blocks = [];
  $blocks.each(function(index) {
    let $block = $(this);
    let block = {
      "type": $block.attr('data-direction'),
      "content": makeContentsArray($block.children())
    }
    blocks.push(block);
  });
  return blocks;
}

function makeContentsArray($contents) {
  let contents = [];
  $contents.each(function(index) {
    contents.push(makeContentObject($(this)));
  })
  return contents;
}

function makeContentObject($content) {
  let content = {};
  content.type = $content.data('type');
  if (typeof $content.attr('style') !== 'undefined') {
    content.settings = getStylesObject($content[0], content.type);;
  }
  switch (content.type) {
    case 'title':
    case 'subTitle':
    case 'text':
      content.text = $content.html().replace(/<\/div><div>/g,'\n').replace(/<br>/g,'').replace(/<div>/g,'').replace(/<\/div>/g,'');
      break;
    case 'spacing':
      content.spacing = $content.attr('style').replace(/(.*?)height:(.*?)em(.*?)/g, '$2').replace(/[;: ]/g,'')
      break;
    case 'names':
      let names = [];
      $content.children().each(function(index) {
        let $name = $(this);
        let name = {};
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
      })
      content.names = names;
      break;
    case 'image':
      let imgClass = $content.children('img').attr('style');
      if (imgClass.indexOf("em") !== -1) {
        content.imageHeight = imgClass.substring(12, imgClass.indexOf("em"));
      }
      let image = $content.children('img').attr("src");
      if (image == "../../../img/Placeholder.jpg") {
        content.image = "../../../img/Placeholder.jpg";
      } else {
        let search = `saves/${currentProject}/images/`;
        content.image = image.substring(search.length);
      }
      break;
    case 'columns':
      content.columns = $content.attr('data-columns');
      content.blocks = makeBlocksObject($content.children());
      break;
    default:
      break;
  }
  return content;
}

function getStylesObject(element, type) {    
  let stylesObj = {};
  let cssArray = element.style.cssText.split("; ");
  if (cssArray[0] == "") return {}
  cssArray.forEach(style=>{
    let stylesArr = style.split(":");
    let prop = stylesArr[0].replace(/[ ;]/g, "");
    let value = stylesArr[1].replace(/[ ;]/g, "");
    if (!(type == "spacing" && prop == 'height') && !(type == "image" && prop == 'max-height')) {
      stylesObj[prop] = value;
    }
  })
  return stylesObj;
}

function getDummyJSON() {
  return "var credits = ["+JSON.stringify(dummyBlock, null, "\t")+"]\n var settings = {'background':{'font-weight':'normal','font-style':'italic', 'background-color':'#000000'},'subTitle':{'margin-top':'5em','margin-bottom':'2em'},'text':{'margin-top':'1em','font-size':'0.8em'},'role':{'font-weight':'bold','font-style':'italic'},'title':{'font-size':'1.2em','font-weight':'bold','margin-top':'2em','margin-bottom':'2em'}}";
}

function load(project, version) {
  currentProject = project;
  $("#loadFile").val(currentProject);
  let versionString = String($("#loadFile").find(":selected").data("versions"));
  let versions = [];
  versions = versionString.split(",");

  if (typeof version === 'undefined') {
    currentVersion = versions.length;
  }

  $("#loadVersion").html("");
  for (var i = 0; i < versions.length; i++) {
    $("#loadVersion").prepend($("<option value='"+versions[i]+"'>"+versions[i]+"</option>"));
  }

  $("#loadFileBut").val(currentProject);
  $("#loadVersion").val(currentVersion);
  $load = $("#loadVersionBut");
  $load.html("");
  for (var j = 0; j < versions.length; j++) {
    $load.append($("<option value='"+versions[j]+"'>"+versions[j]+"</option>"));
  }
  $load.append($("<option value='new'>New Version</option>"));

  let $footer = $("#creditsFooter");
  $footer.data("tabs", 0);
  $footer.html('<button id="newArticle">+</button>');
  $.get(`save?project=${currentProject}&version=${currentVersion}`)
  .done(function(data) {
    images = data.images;
    content = data.content;
    settings = data.globalSettings;
    fonts = typeof globalFonts !== 'undefined' ? [...new Set ([...globalFonts, ...data.fonts])]: data.fonts;
    updateSettings();
    buildCredits(content);
    window.dispatchEvent(loadedEvent);
    $("#creditsFooter").first().click();
  }).fail(function(data) {
    const returnData = JSON.parse(data.responseText);
    alert("Couldn't get requested file: "+JSON.stringify(returnData, "", 4));
  });;
}
