window.debugData = {
  'duration': '60'
}

function endFade(logoCount, logoTotal) {
  logoCurrent = logoTotal - logoCount;

  cont = $('#creditsLogos');

  cont.html(buildBlock(endFades[logoCurrent]));

  setTimeout(function () {
    console.log(endFades[logoCurrent].duration);
    cont.css('animation-duration', endFades[logoCurrent].duration+'s');
    cont.addClass("fade");
  }, 100);


  if (logoCount > 1) {
    setTimeout(function () {
      cont.removeClass("fade");
      endFade(logoCount, logoTotal);
    }, endFades[logoCurrent].duration*1000);
  } else {
    setTimeout(function () {
      cont.removeClass("fade");
      cont.css('animation-duration', endFades[logoCurrent].duration+'s');
      cont.addClass("stay");
    }, endFades[logoCurrent].duration*500);
  }
  --logoCount;
}

function buildBlock(block) {
  let subHtml = "<section class='block'>";
  for (const property in block) {

    if (property == "columns") {
      columns = block["maxColumns"] || "Full";
      subHtml += "<div class='list cols"+columns+"'>";
      for (var i = 0; i < block[property].length; i++) {
        subHtml += buildBlock(block[property][i]);
      }
      subHtml += "</div>";
    } else if (property == "names") {
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
    } else if (property == "title") {
      subHtml += "<div class='title'>"+block[property]+"</div>";
    } else if (property == "subTitle") {
      subHtml += "<div class='subTitle'>"+block[property]+"</div>";
    } else if (property == "text") {
      if (typeof block[property] == "object") {
        for (var i = 0; i < block[property].length; i++) {
          subHtml += "<div class='text'>"+block[property][i]+"</div>";
        }
      } else {
        subHtml += "<div class='text'>"+block[property]+"</div>";
      }
    } else if (property == "image") {
      height = block["imageHeight"] || "24";
      if (typeof block[property] == "object") {
        subHtml += "<div class='imageGroup'>";
        for (var i = 0; i < block[property].length; i++) {
          subHtml += "<img class='image' src='images/"+block[property][i]+"' style='max-height: "+height+"vh'>";
        }
        subHtml += "</div>";
      } else {
        subHtml += "<img class='image' src='"+block[property]+"' style='max-height: "+height+"vh'>";
      }
    } else if (property == "spacing") {
      subHtml += "<div class='spacing' style='height:"+block[property]+"em'></div>";
    } else if (property == "maxColumns" || property == "imageHeight") {

    } else {
      console.log("You put the wrong shit in, check console");
      console.log(`${property}: ${block[property]}`);
    }
  }
  subHtml += "</section>";
  return subHtml;
}

var duration;

var getCurrentScriptPathWithTrailingSlash = function (document) {
  if (!document || typeof document !== 'object') { return '' }
  if (!document.currentScript) { return '' }
  if (!document.currentScript.src || typeof document.currentScript.src !== 'string') { return '' }
  var src = document.currentScript.src;
  return src.substring(0, src.lastIndexOf('/') + 1)
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

webcg.on('data', function(data) {
  duration = data.duration ? data.duration.text || data.duration : '120';
  source = data.source ? data.source.text || data.source : 'credits.json';

  loadScript(source).then(function() {
    var html = "";
    for (var i = 0; i < credits.length; i++) {
      let subHtml = buildBlock(credits[i]);
      html += subHtml;
    }
    document.getElementById('creditsCont').innerHTML = html;
    updateSettings();
  });
})

webcg.on('play', function() {
  document.getElementById('creditsCont').classList.remove("hidden");
  document.getElementById('creditsLogos').classList.remove("hidden");
  document.getElementById('creditsHTML').classList.add("background");


  setTimeout(function () {
    $('body').css('transition',duration+'s linear');
    $('body').css('top', -$(document).height());
    if (typeof endFades !== 'undefined') {
      var logoCount = endFades.length;
      var logoTotal = endFades.length;
      setTimeout(function () {
        endFade(logoCount, logoTotal);
      }, (++duration)*1000);
    }
  }, 300);
})

webcg.on('stop', function() {
  document.getElementById('creditsCont').classList.add("hidden");
  document.getElementById('creditsLogos').classList.add("hidden");
  document.getElementById('creditsHTML').classList.remove("background");
})
