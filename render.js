import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import OS from 'os';
import {log, logObj, logs} from './logs.js';
import fs from 'fs';

function rendererFactory(
    name,
    id,
    url,
    info,
    alpha = false
) {
    const promise = (async () => {
        const browser = await puppeteer.launch({
            args: ['--font-render-hinting=none'],
        })
        const page = await browser.newPage()
        page.on('console', (msg) => log(`Host page (${id}) log: ${msg.text()}`, "D"))
        page.on('pageerror', (msg) => logObj(`Host page (${id}) error`, msg, "E"))
        await page.goto(url+'&id='+id, { waitUntil: 'load' })
        await page.setViewport({
            width: info.width,
            height: info.height,
            deviceScaleFactor: 1,
        })
        return {browser, page}
    })()
    let rendering = false
    return {
        async render(i) {
            if (rendering) {
                throw new Error('render() may not be called concurrently!')
            }
            rendering = true
            try {
                const marks = [Date.now()]
                const {page} = await promise
                marks.push(Date.now())
                const result = await page.evaluate(`seekToFrame(${i})`)
                marks.push(Date.now())
                const buffer =
                    typeof result === 'string' && result.startsWith(DATA_URL_PREFIX)
                    ? Buffer.from(result.substr(DATA_URL_PREFIX.length), 'base64')
                    : await page.screenshot({
                        omitBackground: alpha
                    })
                marks.push(Date.now())
                log(`${name} render(${i}) finished, timing=${marks
                    .map((v, i, a) => (i === 0 ? null : v - a[i - 1]))
                    .slice(1)}`, "A"
                )
                return buffer
            } finally {
                rendering = false
            }
        },
        async end() {
            const { browser } = await promise
            browser.close()
        },
    }
}

function createParallelRender(
    max,
    url,
    info,
    alpha = false
) {
    const DATA_URL_PREFIX = 'data:image/png;base64,'
    const available = []
    const working = new Set()
    let nextWorkerId = 1
    let waiting = null
    function obtainWorker() {
        if (available.length + working.size < max) {
            const id = nextWorkerId++
            const worker = { id, renderer: rendererFactory(`Worker ${id}`, id, url, info, alpha)}
            available.push(worker)
            log('Spawn worker '+worker.id, "D")
            if (waiting) waiting.nudge()
        }
        if (available.length > 0) {
            const worker = available.shift()
            working.add(worker)
            return worker
        }
        return null
    }
    const work = async (fn, taskDescription) => {
        for (;;) {
            const worker = obtainWorker()
            if (!worker) {
                if (!waiting) {
                    let nudge
                    const promise = new Promise((resolve) => {
                        nudge = () => {
                        waiting = null
                        resolve()
                        }
                    })
                    waiting = { promise, nudge }
                }
                await waiting.promise
                continue
            }
            try {
                log(`Worker ${worker.id} is starting ${taskDescription}`, "A")
                const result = await fn(worker.renderer)
                available.push(worker)
                if (waiting) waiting.nudge()
                return result
            } catch (e) {
                worker.renderer.end()
                throw e
            } finally {
                working.delete(worker)
            }
        }
    }
    return {
        async render(i) {
            return work((r) => r.render(i), `render(${i})`)
        },
        async end() {
            return Promise.all(
                [...available, ...working].map((r) => r.renderer.end()),
            )
        },
    }
}
  
function ffmpegOutput(fps, folder, fileName, fileType, alpha) {

    if (!fs.existsSync(folder)){
        fs.mkdirSync(folder, { recursive: true });
    }
    let debugLevel = 'error';
    switch (logs.loggingLevel) {
        case "W":
            debugLevel = 'warning'
            break;
        case "D":
            debugLevel = 'info'
            break;
        case "A":
            debugLevel = 'debug'
            break;
        default:
            break;
    }
    const args = [
        ...['-hide_banner'],
        ...['-loglevel', debugLevel],
        ...['-stats'],
        ...['-f', 'image2pipe'],
        ...['-framerate', `${fps}`],
        ...['-i', '-'],
        ...(alpha
            ? [
                ...['-c:v', 'qtrle'],
            ]
            : [
                ...['-c:v', 'libx264'],
                ...['-crf', '16'],
                ...['-preset', 'ultrafast'],
                ...['-pix_fmt', 'yuv420p'],
            ]),
        '-y',
        `${folder}/${fileName}.${fileType}`,
    ];
    const ffmpeg = spawn('ffmpeg', args);
    log("Started FFMPEG", ["D","FFMPEG"]);

    ffmpeg.stdout.setEncoding('utf8');
    ffmpeg.stdout.on('data', function(data) {
        log(data, ["D","FFMPEG", logs.p, false]);
    });

    ffmpeg.stderr.setEncoding('utf8');
    ffmpeg.stderr.on('data', function(data) {
        log(data, ["E","FFMPEG", logs.r, false]);
    });

    return {
        writePNGFrame(buffer, _frameNumber) {
            ffmpeg.stdin.write(buffer)
        },
        end() {
            ffmpeg.stdin.end();
            return new Promise((resolve) => {
                ffmpeg.on('close', function() {
                    log('Render complete', ["C","FFMPEG"]);
                    resolve();
                });
            });
        }
    }
}
  
export default async function render(path, project, version, fps, frames, width, height, alpha) {
    const info = {
        width: width,
        height: height,
        fps: fps,
        numberOfFrames: frames
    }
    const renderer = createParallelRender(
        OS.cpus().length,
        `${path}/frame?project=${project}&version=${version}&fps=${fps}`,
        info,
        alpha
    )
    const fileType = alpha ? 'mov' : 'mp4';
    const folder = `public/saves/${project}/renders`;
    const fileName = `${project}_v${version}_credits`;
    logObj(`Rendering ${fileType} file ${fileName}`, info);

    const output = ffmpegOutput(
        fps,
        folder,
        fileName,
        fileType,
        alpha
    )
  
    const promises = []
    for (let i = 0; i < frames; i++) {
        promises.push({ promise: renderer.render(i), frame: i })
    }
    for (let i = 0; i < promises.length; i++) {
        log(`Render progress frame ${promises[i].frame} ${i}/${promises.length}`,"D")
        const buffer = await promises[i].promise
        output.writePNGFrame(buffer, promises[i].frame)
    }
    await output.end();
    renderer.end();
    log("Rendering completed");
}