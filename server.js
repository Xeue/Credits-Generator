let asci = [
"     _____                 _  _  _           _____                                 _               ",
"    / ____|               | |(_)| |         / ____|                               | |              ",
"   | |      _ __  ___   __| | _ | |_  ___  | |  __   ___  _ __    ___  _ __  __ _ | |_  ___   _ __ ",
"   | |     | '__|/ _ \\ / _` || || __|/ __| | | |_ | / _ \\| '_ \\  / _ \\| '__|/ _` || __|/ _ \\ | '__|",
"   | |____ | |  |  __/| (_| || || |_ \\__ \\ | |__| ||  __/| | | ||  __/| |  | (_| || |_| (_) || |   ",
"    \\_____||_|   \\___| \\__,_||_| \\__||___/  \\_____| \\___||_| |_| \\___||_|   \\__,_| \\__|\\___/ |_|   ",
"                                                                                                   ",
"                                                                                                   "
];

const serverVersion = "3.0.0";
const serverID = new Date().getTime();

import {globby} from 'globby';
import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import {log, logObj, logs} from './logs.js';
import path from 'path';
import {fileURLToPath} from 'url';
import AmdZip from "adm-zip";
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import OS from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let config;
try {
    config = JSON.parse(fs.readFileSync(__dirname + "/config.conf"));
} catch (error) {
    log("There is an error with the config file or it doesn't exist, please check it", "E");
    logObj("Config error", error, "E")
    process.exit(1);
}
config.loggingLevel = config.loggingLevel ? config.loggingLevel : "W";
config.port = config.port ? config.port : 3000;
config.devMode = config.devMode ? config.devMode : false;
config.installName = config.installName ? config.installName : "Unknown Site";

const logsConfig = {
    "createLogFile": true,
    "logsFileName": "CreditsLogging",
    "configLocation": __dirname,
    "loggingLevel": config.loggingLevel,
    "debugLineNum": true
}
logs.setConf(logsConfig);

const app = express()
if (!fs.existsSync(__dirname+'/public/saves')){
    fs.mkdirSync(__dirname+'/public/saves', { recursive: true });
}
logs.printHeader(asci);
printConfig();


/* Express setup & Endpoints */


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload({
    createParentPath: true
}));

app.listen(config.port, "0.0.0.0", () => {
    log(`Credits Generator can be accessed at http://localhost:${config.port}`, "C");
})

app.get('/',  (req, res) =>  {
    doHome(req, res)
});

app.get('/run', (req, res) => {
    log("Requesting run dialog", "A");
    res.header('Content-type', 'text/html');
    res.render('run', {});
})

app.get('/save', (req, res) => {
    getSave(req, res);
})
app.post('/save', (req, res) => {
    doSave(req, res);
})


app.get('/fonts', (req, res) => {
    log("Request for fonts", "D");
    const project = req.query.project;
    sendZip(res, [`public/fonts`,`public/saves/${project}/fonts`], project+"_fonts");
})
app.post('/fonts', (req, res) => {
    doUpload(req, res, "fonts");
})
app.delete('/fonts', (req, res) => {
    doDelete(req, res, "fonts");
});

app.post('/media', (req, res) => {
    doUpload(req, res, "images");
})
app.get('/images', (req, res) => {
    log("Request for images", "D");
    const project = req.query.project;
    sendZip(res, [`public/saves/${project}/images`], project+"_images");
})
app.delete('/images', (req, res) => {
    doDelete(req, res, "images");
});

app.get('/template', (req, res) => {
    log("Request for template", "D");
    const project = req.query.project;
    sendZip(res, [`public/template`], project+"_template");
})

app.get('/render', (req, res) => {
    let project = req.query.project;
    let version = req.query.version;
    let fps = parseInt(req.query.fps);
    let frames = parseInt(req.query.frames);
    let width = 1920;
    let height = 1080;
    switch (parseInt(req.query.resolution)) {
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
    render(`http://localhost:${config.port}/?render=true&project=${project}&fps=${fps}&frames=${frames}`, `public/saves/${project}/renders/${version}/${project}_credits.mov`, fps, frames, width, height, true)
    .then(()=>{
        setTimeout(()=>{
            sendZip(res, [`public/saves/${project}/renders/${version}/`], `${project}_credits`);
        },1000)
    });
})


/* Request functions */


function doHome(req, res) {
    log("New client connected", "A");
    res.header('Content-type', 'text/html');

    const fileSearches = [
        globby(['public/saves']),
        globby(['public/fonts'])
    ]

    Promise.all(fileSearches).then((values) => {

        let savesObj = {}
        values[0].forEach(function(path) {
            path.split('/').reduce( function(prev, current) {
                if (typeof current == "string" && current.indexOf(".js") !== -1) {
                    current = parseInt(current.substring(0, current.indexOf(".js")));
                    let prevCount = parseInt(prev.count);
                    let count = prevCount;
                    if (prevCount < current || prev.count == null) {
                        count = current;
                    }
                    return prev.count = count;
                } else if (typeof current == "string" && (current == "images" || current == "fonts")) {
                    return prev[current] || (prev[current] = []);
                } else if (Object.prototype.toString.call(prev) === '[object Array]') {
                    prev.push(current);
                    return;
                }
                return prev[current] || (prev[current] = {});
            }, savesObj)
        });

        const fonts = [];
        values[1].forEach((font)=>{
            fonts.push(font.substring(13));
        })

        let saves = {};
        if (typeof savesObj.public.saves !== 'undefined') {
            saves = savesObj.public.saves;
            for (const project in saves) {
                if (Object.hasOwnProperty.call(saves, project)) {
                    saves[project].images = Object.assign({}, saves[project].images);
                    saves[project].fonts = Object.assign({}, saves[project].fonts);
                }
            }
        }

        let render = false;
        let frames = undefined;
        let fps = undefined;
        let project = undefined;
        if (req.query.render == "true") {
            render = true;
        }
        if (req.query.frames) {
            frames = req.query.frames;
        }
        if (req.query.fps) {
            fps = req.query.fps;
        }
        if (req.query.project) {
            project = req.query.project;
        }

        res.render('home', {
            saves: saves,
            globalFonts: fonts,
            serverName: config.installName,
            render: render,
            frames: frames,
            fps: fps,
            project: project
        });
    });
}

function getSave(req, res) {
    log("Getting saved credits", "D")
    const project = req.query.project
    const version = req.query.version
    try {
        res.sendFile(`${__dirname}/public/saves/${project}/${version}.json`);
    } catch (error) {
        logObj("debugging", error);
        res.status(500);
        res.send(JSON.stringify({
            "status": "error",
            "message": "Save not found",
            "error": error
        }))
    }
}
function doSave(req, res) {
    log("Saving uploaded credits", "D");
    const project = req.body.project;
    let version = req.body.version;

    if (project === undefined || version === undefined) {
        log(`Failed to get Project (${project}) or Version (${version})`);
        res.send({
            status: false,
            message: 'Invalid data'
        });
        return;
    }

    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let uploaded = req.files.JSON;
    
            const projectDir = `public/saves/${project}`;
            if (!fs.existsSync(projectDir)){
                fs.mkdirSync(projectDir, { recursive: true });
            }

            if (version == "new") {
                let files = fs.readdirSync(projectDir);
                let count = 0;
                files.forEach(file => {
                    const current = parseInt(file.substring(0, file.indexOf(".js")));
                    if (current > count) {
                        count = current;
                    }
                });
                count++;
                version = count;
            }

            uploaded.mv(`${projectDir}/${version}.js`);

            res.send({
                status: true,
                message: {
                    "type": "success",
                    "project": project,
                    "version": version
                },
                data: {
                    name: uploaded.name,
                    mimetype: uploaded.mimetype,
                    size: uploaded.size
                }
            });
        }
    } catch (err) {
        logObj("File upload error", err, "E");
        res.status(500).send(err);
    }
}

function doUpload(req, res, uploadType) {
    log("Saving uploaded Images/Fonts", "D");
    const project = req.body.project;
    const newProject = req.body.new;

    const returnObj = {};

    if (project === undefined) {
        log(`Failed to get Project (${project})`);
        res.send({
            status: false,
            message: 'Invalid data'
        });
        return;
    }

    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {

            const projectDir = `public/saves/${project}`;
            const imgDir = `public/saves/${project}/${uploadType}`;
            if (!fs.existsSync(imgDir)){
                fs.mkdirSync(imgDir, { recursive: true });
            }

            if (newProject) {
                const template = `var credits = [
                    {
                        "spacing": "8",
                        "imageHeight": "24",
                        "image": "../../../img/Placeholder.jpg",
                        "title": "Placeholder",
                        "subTitle": "Placeholder",
                        "text": "Placeholder",
                        "maxColumns": "2",
                        "columns": [
                            {
                                "title": "Column 1"
                            },
                            {
                                "title": "Column 2"
                            }
                        ],
                        "names": [
                            {
                                "role": "Role",
                                "name": "Name"
                            },
                            "Name 2"
                        ]
                    }
                ]`
                fs.writeFile(`${projectDir}/1.js`, template, (err)=>{});
                returnObj.new = true;
                returnObj.project = project;
            } else {
                returnObj.new = false;
            }

            const uploadedItems = req.files["files[]"];

            if (Array.isArray(uploadedItems)) {
                uploadedItems.forEach((item)=>{
                    item.mv(`${imgDir}/${item.name}`);
                })
            } else {
                uploadedItems.mv(`${imgDir}/${uploadedItems.name}`);
            }

            getUpdatedProjects().then((saves)=>{
                returnObj.type = "success";
                returnObj.saves = saves;
                res.send(returnObj);
            });
        }
    } catch (err) {
        logObj("File upload error", err, "E");
        res.status(500).send(err);
    }
}

function doDelete(req, res, deleteType) {
    const file = req.query.file;
    const project = req.query.project;
    const returnObj = {};
    fs.promises.unlink(`public/saves/${project}/${deleteType}/${file}`)
    .then(getUpdatedProjects)
    .then((saves)=>{
        returnObj.type = "success";
        returnObj.saves = saves;
        res.send(returnObj);
    }).catch((err)=>{
        getUpdatedProjects().then((saves)=>{
            logObj("File error", err, "W");
            res.status(500);
            returnObj.type = "fail";
            returnObj.saves = saves;
            returnObj.error = err;
            res.send(returnObj);
        })
    });
}

function getUpdatedProjects() {
    const promise = new Promise((resolve, reject) => {
        globby(["public/saves"]).then((files)=>{
            let output = {};
            files.forEach(function(path) {
                path.split('/').reduce( function(prev, current) {
                    if (typeof current == "string" && current.indexOf(".js") !== -1) {
                        return
                    } else if (typeof current == "string" && (current == "images" || current == "fonts" )) {
                        return prev[current] || (prev[current] = []);
                    } else if (Object.prototype.toString.call(prev) === '[object Array]') {
                        prev.push(current);
                        return;
                    }
                    return prev[current] || (prev[current] = {});
                }, output);
            });

            let saves = output.public.saves;

            for (const project in saves) {
                if (Object.hasOwnProperty.call(saves, project)) {
                    saves[project].images = Object.assign({}, saves[project].images);
                    saves[project].fonts = Object.assign({}, saves[project].fonts);
                }
            }
            resolve(saves);
        });
    });
    return promise;
}

function sendZip(res, pathArray, zipName) {
    const zip = new AmdZip();
    for (const folder of pathArray) {
        if (fs.existsSync(folder)) {
            zip.addLocalFolder(folder);
        }
    }
    const zipBuffer = zip.toBuffer();
    res.set('Content-disposition', `attachment; filename=${zipName}.zip`);
    res.send(zipBuffer);
}

/* Utility Functions */


function printConfig() {
    for (const key in config) {
        if (Object.hasOwnProperty.call(config, key)) {
            const value = config[key];
            log(`Configuration option ${logs.y}${key}${logs.reset} has been set to: ${logs.b}${value}${logs.reset}`,"H");
        }
    }

    for (const key in logsConfig) {
        if (Object.hasOwnProperty.call(logsConfig, key)) {
            const value = logsConfig[key];
            log(`Configuration option ${logs.y}${key}${logs.reset} has been set to: ${logs.b}${value}${logs.reset}`,"H");
        }
    }
}




/* Rendering */

function createRendererFactory(
  url,
  info,
  { scale = 1, alpha = false, launchArgs = [] } = {},
) {
  const DATA_URL_PREFIX = 'data:image/png;base64,'
  return function createRenderer({ name = 'Worker' } = {}) {
    const promise = (async () => {
      const browser = await puppeteer.launch({
        args: launchArgs,
      })
      const page = await browser.newPage()
      page.on('console', (msg) => log('Host page log: '+msg.text(), "D"))
      page.on('pageerror', (msg) => logObj('Host page error', msg, "E"))
      await page.goto(url, { waitUntil: 'load' })
      await page.setViewport({
        width: info.width,
        height: info.height,
        deviceScaleFactor: scale,
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
                  clip: { x: 0, y: 0, width: info.width, height: info.height },
                  omitBackground: alpha,
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
}

function createParallelRender(max, rendererFactory) {
  const available = []
  const working = new Set()
  let nextWorkerId = 1
  let waiting = null
  function obtainWorker() {
    if (available.length + working.size < max) {
      const id = nextWorkerId++
      const worker = { id, renderer: rendererFactory(`Worker ${id}`) }
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

function ffmpegOutput(fps, outPath, { alpha }) {
    let folderArr = outPath.split('/');
    folderArr.pop();
    const folder = folderArr.join('/');

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
    const ffmpeg = spawn('ffmpeg', [
        ...['-hide_banner', '1'],
        ...['-loglevel', debugLevel],
        ...['-stats', '1'],
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
        outPath,
    ])
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

async function render(url, fileName, fps, frames, width, height, alpha) {
    const info = {
        width: width,
        height: height,
        fps: fps,
        numberOfFrames: frames
    }
     const renderer = createParallelRender(
        //OS.cpus().length,
        1,
        createRendererFactory(url, info, {
            scale: 1,
            alpha: alpha,
        }, info),
    )
    logObj('Rendering mov file '+fileName, info);

    const output = ffmpegOutput(
        info.fps,
        fileName, {
            alpha: alpha,
        }
    )

    const promises = []
    const start = 0
    const end = info.numberOfFrames
    for (let i = start; i < end; i++) {
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