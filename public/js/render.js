/*jshint esversion: 6 */

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
    let $sections = $('.creditsSection');
    $sections.removeClass('active');
    let seconds = 0;
    if (frame !== 0) {
        seconds = frame / fps;
    }
    let sections = Object.values(document.getElementsByClassName('creditsSection')).map(
        (section)=>parseInt(
            section.getAttribute('data-duration')
        )
    );
    let runningTotal = 0;
    let sectionNum = -1;
    let sectionFrames = 0;
    let sectionFrame = frame;
    while (seconds >= runningTotal) {
        sectionNum++;
        sectionFrame -= sectionFrames;
        sectionFrames = sections[sectionNum] * fps;
        runningTotal += sections[sectionNum];
    }
    let $section = $($sections[sectionNum]);
    let type = $section.data('type');
    $section.addClass('active');

    let progress = sectionFrame/(sectionFrames-1);
    if (type == 'scroll') {
        let scrollLength = $section.height() + $(document).height();
        let offset = progress * scrollLength - $(document).height();
        $section.css('top', `${-1 * offset}px`);
    } else {
        if (progress < 0.2) {
            $section.css('opacity', progress/0.2);
        } else if (progress > 0.8) {
            $section.css('opacity', (1-progress)/0.2);
        } else {
            $section.css('opacity', 1);
        }
    }
}

async function runByFrame() {
    let interval = 1 / fps;
    let frames = Object.values(document.getElementsByClassName('creditsSection')).map((section)=>parseInt(section.getAttribute('data-duration'))).reduce((a,b)=>a+b, 0) * fps;
    for (let index = 0; index < frames; index++) {
        await sleep(interval);
        renderFrame(index);
    }
}

async function sleep(seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds*1000));
  }