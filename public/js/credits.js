/*jshint esversion: 6 */
var ordering = false;
var runTime = 60;
var currentFade = 0;
var logoCount = 0;
var timeouts = [];

function renderFades(endFades) {
  let $cont = $('#creditsLogos');
  let $footer = $("#creditsFooter");
  
  $footer.data("tabs", endFades.length);
  for (let index = 0; index < endFades.length; index++) {
    const fade = endFades[index];
    let $subCont = $("<div class='endFadeGroup hidden'></div>");
    $subCont.attr("id",`fadeCont${index+1}`);
    $subCont.html(buildBlock(fade));
    $subCont.data("duration", fade.duration);
    $cont.append($subCont);

    let $button = $(`<button id='fade${index+1}' class='tabButton'>Fade ${index+1}</button>`);
    $footer.append($button);
  }
}

function buildBlock(block) {
  let subHtml = "<section class='block'>";
  for (const property in block) {
    subHtml += buildProperty(property, block);
  }
  subHtml += "</section>";
  return subHtml;
}
function buildProperty(property, block) {
  let subHtml = "";
  switch (property) {
    case "columns":
      columns = block["maxColumns"] || "Full";
      subHtml += "<div class='columns cols"+columns+"'>";
      for (var i = 0; i < block[property].length; i++) {
        subHtml += buildBlock(block[property][i]);
      }
      subHtml += "</div>";
      break;
    case "names":
      subHtml += "<div class='names'>";

        for (var i = 0; i < block["names"].length; i++) {
          let names = block["names"];

          if (typeof names[i] == "object") {
            subHtml += "<div class='pair'><div class='role'>"+names[i].role+"</div>";

            if (typeof names[i].name == "object") {
              subHtml += "<div class='nameGroup'>";
              for (var j = 0; j < names[i].name.length; j++) {
                subHtml += "<div class='name'>"+names[i].name[j]+"</div>";
              }
              subHtml += "</div>";
            } else {
              subHtml += "<div class='name'>"+names[i].name+"</div>";
            }

            subHtml += "</div>";

          } else {
            subHtml += "<div class='name'>"+names[i]+"</div>";
          }

        }

      subHtml += "</div>";
      break;
    case "title":
    case "subTitle":
      subHtml += "<div class='"+property+"'>"+block[property]+"</div>";
      break;
    case "text":
      if (typeof block[property] == "object") {
        subHtml += "<div class='textGroup'>";
        for (var i = 0; i < block[property].length; i++) {
          subHtml += "<div class='text'>"+block[property][i]+"</div>";
        }
        subHtml += "</div>";
      } else {
        subHtml += "<div class='text'>"+block[property]+"</div>";
      }
      break;
    case "image":
      height = block.imageHeight || "24";
      if (typeof block[property] == "object") {
        subHtml += "<div class='imageGroup'>";
        for (var i = 0; i < block[property].length; i++) {
          subHtml += `<img class='image' src='saves/${currentProject}/images/${block[property][i]}' style='max-height: ${height}vh'>`;
        }
        subHtml += "</div>";
      } else {
        subHtml += `<img class='image' src='saves/${currentProject}/images/${block[property]}' style='max-height: ${height}vh'>`;
      }
      break;
    case "spacing":
      subHtml += "<div class='spacing' style='height:"+block[property]+"em'></div>";
      break;
    case "maxColumns":
    case "imageHeight":
    case "duration":
      break;
    default:
      console.log("Invalid Paramters");
      console.log(`${property}: ${block[property]}`);
  }
  return subHtml;
}

function pagePath() {
  if (!document || typeof document !== 'object') { return ''; }
  if (!document.currentScript) { return ''; }
  if (!document.currentScript.src || typeof document.currentScript.src !== 'string') { return ''; }
  var src = document.currentScript.src;
  return src.substring(0, src.lastIndexOf('/') + 1);
};

function loadScript(source) {
  return new Promise((resolve, reject) => {
    var script = document.createElement("script");
    script.onload = resolve;
    script.onerror = reject;
    script.src = pagePath() + source;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
}

function runNextFade() {
  currentFade++;
  if (currentFade < logoCount) {
    $("#fade"+currentFade).trigger("click");
    timeouts.push(setTimeout(function () {
      runNextFade();
    }, endFades[currentFade-1].duration*1000));
  } else if (currentFade == logoCount) {
    $("#fade"+currentFade).trigger("click");
    timeouts.push(setTimeout(function () {
      $("#fade"+currentFade).addClass("hidden");
    }, endFades[currentFade-1].duration*1000));
  }
}

function runCredits() {
  $('#creditsScroller').css('transition',runTime+'s linear');
  let scrollLength = -$("#creditsCont").height() - 100;
  $('#creditsScroller').css('top', scrollLength);
  if (typeof endFades !== 'undefined') {
    logoCount = endFades.length;
    timeouts.push(setTimeout(function () {
      $("#fadeCont1").addClass("extraHidden");
      timeouts.push(setTimeout(function () {
        $("#fadeCont1").removeClass("extraHidden");
      }, 100));
      runNextFade();
    }, (++runTime)*1000));
  }
}

function seekToFrame(frame) {
  if (!loaded) {
    return awaitLoad = new Promise((resolve, reject) => {
      window.addEventListener('loaded', (e) => {
        renderFrame(frame);
        resolve();
      }, false);
    });
  } else {
    renderFrame(frame);
  }
}

function renderFrame(frame) {
  frame--;
  let scrollLength = -$("#creditsCont").height() - 100;
  if (frame < renderDetails.scrollFrames) {
    let divisor = frame/renderDetails.scrollFrames;
    let thisScroll = scrollLength*divisor;
    $('#creditsScroller').css('top', thisScroll);
  } else {
    console.log("Not here yet!");
  }
}

const renderDetails = {
  'resolution': 0,
  'frameRate': 0,
  'renderDuration': 0,
  'totalFrames': 0,
  'fadesFrames': 0,
  'scrollFrames': 0
}

function processRenderInfo(fps, frames, resolution) {
  renderDetails.resolution = resolution ? resolution : $("#renderRes").val();
  renderDetails.frameRate = fps ? fps : $("#renderRate").val();
  renderDetails.renderDuration = $("#renderDuration").val();
  renderDetails.totalFrames = frames ? frames : renderDetails.renderDuration*renderDetails.frameRate;
  renderDetails.fadesFrames = $("#renderFades").val()*renderDetails.frameRate;
  renderDetails.scrollFrames = renderDetails.totalFrames - renderDetails.fadesFrames;
  let $scene = $("#scene");
  let width = 1920;
  let height = 1080;
  switch (renderDetails.resolution) {
    case 1440:
      height = 720;
      width = 1440;
      break;
    case 1920:
      height = 1080;
      width = 1920;
      break;
    case 3840:
      height = 2160;
      width = 3840;
      break;
    case 4096:
      height = 2160;
      width = 4096;
      break;
    default:
      break;
  }
  $scene.css("height", height+"px");
  $scene.css("width", width+"px");
}

$("#renderDo").click(function() {
  processRenderInfo();
});

function getInfo() {
  return {
    "fps": renderDetails.frameRate,
    "numberOfFrames": renderDetails.totalFrames
  }
}