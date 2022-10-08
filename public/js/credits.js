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

function buildCredits(content) {
  let active = ' active';
  const $cont = $("#creditsCont");
  $cont.html('');
  const $footer = $("#creditsFooter");
  content.forEach(article => {
    let name = typeof article.name !== 'undefined' ? article.name : article.type;
    const $tab = $(`<button class="tabButton${active}">${name}</button>`)
    $footer.append($tab);
    const html = renderBlocks(article.blocks);
    const $content = $(`<article class="creditsSection${active}" data-type="${article.type}" data-name="${name}" data-duration="${article.duration}">${html}</article>`);
    active = '';
    $cont.append($content);
  });
}

function renderBlocks(blocks) {
  let html = "";
  blocks.forEach(block => {
    html += `<section class="block" data-direction="${block.type}">`;
    block.content.forEach(content => {
      html += renderContent(content);
    })
    html += `</section>`;
  })
  return html;
}

function renderContent(content) {
  let subHtml = "";
  let style = '';
  if (typeof content.settings !== "undefined" && Object.values(content.settings).length > 0) {
    style = 'style="';
    for (const property in content.settings) {
      if (Object.hasOwnProperty.call(content.settings, property)) {
        const value = content.settings[property];
        style += `${property}: ${value};`;
      }
    }
    style += '"';
  }
  switch (content.type) {
    case "columns":
      let columns = content.columns || "Full";
      subHtml += `<div ${style} class='content columns cols${columns}' data-type='${content.type}' data-columns='${columns}'>`;
      subHtml += renderBlocks(content.blocks);
      subHtml += "</div>";
      break;
    case "names":
      subHtml += `<div ${style} class='names content' data-type='${content.type}'>`;

        for (var i = 0; i < content["names"].length; i++) {
          const names = content["names"];

          if (typeof names[i] == "object") {
            subHtml += `<div class='pair'><div class='role'>${names[i].role}</div>`;

            if (typeof names[i].name == "object") {
              subHtml += "<div class='nameGroup'>";
              for (var j = 0; j < names[i].name.length; j++) {
                subHtml += `<div class='name'>${names[i].name[j]}</div>`;
              }
              subHtml += "</div>";
            } else {
              subHtml += `<div class='name'>${names[i].name}</div>`;
            }

            subHtml += "</div>";

          } else {
            subHtml += `<div class='name'>${names[i]}</div>`;
          }

        }

      subHtml += "</div>";
      break;
    case "title":
    case "subTitle":
      subHtml += `<div ${style} class="${content.type} content" data-type='${content.type}'>${content.text}</div>`;
      break;
    case "text":
      subHtml += `<div ${style} class='text content' data-type='${content.type}'>${content.text}</div>`;
      break;
    case "image":
      height = content.imageHeight || "10";
      subHtml += `<img ${style} class='image content' data-type='${content.type}' src='saves/${currentProject}/images/${content.image}' style='max-height: ${height}em'>`;
      break;
    case "spacing":
      subHtml += `<div ${style} class='spacing content' data-type='${content.type}' style='height:${content.spacing}em'></div>`;
      break;
    default:
  }
  return subHtml;
}

function seekToFrame(frame) {
  if (!loaded) {
    console.log("Waiting for load");
    return awaitLoad = new Promise((resolve, reject) => {
      window.addEventListener('renderReady', (e) => {
        console.log("Ready for rendering");
        renderFrame(frame);
        setTimeout(()=>{
          resolve();
        }, 200);
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

function processRenderInfo(fps, frames) {
  renderDetails.resolution = $("#renderRes").val();
  renderDetails.frameRate = fps ? fps : $("#renderRate").val();
  renderDetails.renderDuration = $("#renderDuration").val() || frames/fps;
  renderDetails.totalFrames = frames ? frames : renderDetails.renderDuration*renderDetails.frameRate;
  renderDetails.fadesFrames = endFades.map((val)=>val.duration).reduce((a, b) => a + b, 0)*renderDetails.frameRate;
  renderDetails.scrollFrames = renderDetails.totalFrames - renderDetails.fadesFrames;
}
