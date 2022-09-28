/*jshint esversion: 6 */
var ordering = false;
var runTime = 60;
var currentFade = 0;
var logoCount = 0;
var timeouts = [];

function endFade(logoCount, logoTotal) {
  let logoCurrent = logoTotal - logoCount;

  let $cont = $('#creditsLogos');
  let $subCont = $("<div class='endFadeGroup hidden'></div>");
  $subCont.attr("id","fadeCont"+(logoCurrent+1));

  $subCont.html(buildBlock(endFades[logoCurrent]));
  $subCont.data("duration", endFades[logoCurrent].duration);

  $cont.append($subCont);

  let $footer = $("#creditsFooter");

  let $button = $("<button id='fade"+(logoCurrent+1)+"' class='tabButton'>Fade "+(logoCurrent+1)+"</button>");

  $footer.append($button);
  $footer.data("tabs", (logoCurrent+1));

  --logoCount;
  if (logoCount > 0) {
    endFade(logoCount, logoTotal);
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

var getCurrentScriptPathWithTrailingSlash = function (document) {
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
    script.src = getCurrentScriptPathWithTrailingSlash(document) + source;
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
