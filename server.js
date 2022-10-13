const serverVersion = "3.1.1";
const serverID = new Date().getTime();

import {globby} from 'globby';
import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import {log, logObj, logs} from 'xeue-logs';
import render from './render.js';
import path from 'path';
import {fileURLToPath} from 'url';
import AmdZip from "adm-zip";
import commandExists from 'command-exists';

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
config.debugLineNum = config.debugLineNum ? config.debugLineNum : false;
config.port = config.port ? config.port : 3000;
config.devMode = config.devMode ? config.devMode : false;
config.installName = config.installName ? config.installName : "Unknown Site";

const logsConfig = {
    "createLogFile": true,
    "logsFileName": "CreditsLogging",
    "configLocation": __dirname,
    "loggingLevel": config.loggingLevel,
    "debugLineNum": config.debugLineNum
}

logs.setConf(logsConfig);

const app = express()
if (!fs.existsSync(__dirname+'/public/saves')){
    fs.mkdirSync(__dirname+'/public/saves', { recursive: true });
}
logs.printHeader('Credits Generator');
log('Running version: v'+serverVersion, ['H', 'SERVER', logs.g]);
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
    log(`Credits Generator can be accessed at http://localhost:${config.port}`, ['C', 'SERVER', logs.g]);
})

app.get('/',  (req, res) =>  {
    doHome(req, res)
});

app.get('/frame',  (req, res) =>  {
    doFrame(req, res)
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

app.post('/images', (req, res) => {
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
    render(`http://localhost:${config.port}`, project, version, fps, frames, width, height, true, logsConfig)
    .then(()=>{
        setTimeout(()=>{
            sendZip(res, [`public/saves/${project}/renders/${version}/`], `${project}_credits`);
        },1000)
    }).catch((err)=>{
        logObj('Rendering error', err, 'E');
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

    Promise.all(fileSearches).then(async (values) => {

        let saves = {}
        values[0].forEach(function(path) {
            path = path.replace(`public/saves/`,'');
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
            }, saves)
        });

        const fonts = [];
        values[1].forEach((font)=>{
            fonts.push(font.substring(13));
        })

        let hasFFMPEG = false;
        try {
            await commandExists('FFMPEG');
            hasFFMPEG = true;
        } catch (error) {
            log('FFMPEG not installed on this server', "W");
        }

        res.render('home', {
            saves: saves,
            globalFonts: fonts,
            serverName: config.installName,
            project: req.query.project,
            render: hasFFMPEG
        });
    });
}

function doFrame(req, res) {
    log("New Render Page Spawned", "A");
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
        }


        res.render('render', {
            globalFonts: fonts,
            fps: req.query.fps,
            project: req.query.project,
            version: req.query.version,
            id: req.query.id
        });
    });
}

function getSave(req, res) {
    log("Getting saved credits", "D")
    const project = req.query.project
    const version = req.query.version
    fs.readFile(`${__dirname}/public/saves/${project}/${version}.json`, async (err, buffer)=>{
        if (err) {
            log(`Cannot load save file: ${project}/${version}.json doesn't exist?`, 'W');
            logObj(err, 'W');
            res.status(500);
            res.send(JSON.stringify({
                "status": "error",
                "message": "Save not found",
                "error": err
            }))
            return;
        }
        let data = JSON.parse(buffer.toString());
        data.images = await imageList(project);
        res.json(data);
    });
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
                    const current = parseInt(file.substring(0, file.indexOf(".json")));
                    if (current > count) {
                        count = current;
                    }
                });
                count++;
                version = count;
            }

            uploaded.mv(`${projectDir}/${version}.json`);

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
            const imgDir = uploadType == 'fonts' ? `public/${uploadType}` : `public/saves/${project}/${uploadType}`;
            if (!fs.existsSync(imgDir)){
                fs.mkdirSync(imgDir, { recursive: true });
            }

            if (newProject) {
                const template = `{}`
                fs.writeFile(`${projectDir}/1.json`, template, (err)=>{});
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

            getUpdatedProjects(project).then((save)=>{
                returnObj.type = "success";
                returnObj.save = save;
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
        returnObj.save = saves[project];
        res.send(returnObj);
    }).catch((err)=>{
        getUpdatedProjects().then((saves)=>{
            logObj("File error", err, "W");
            res.status(500);
            returnObj.type = "fail";
            returnObj.save = saves[project];
            returnObj.error = err;
            res.send(returnObj);
        })
    });
}

function getUpdatedProjects(project) {
    const promise = new Promise((resolve, reject) => {
        globby(["public/saves"]).then((files)=>{
            let output = {};
            files.forEach(function(path) {
                path = path.replace(`public/saves/`, '');
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

            let resolveObj = typeof project === 'undefined' ? output : output[project];
            resolve(resolveObj);
        });
    });
    return promise;
}

function imageList(project) {
    const promise = new Promise((resolve, reject) => {
        globby([`public/saves/${project}/images`]).then((files)=>{
            let output = {};
            files.forEach(function(path) {
                path = path.replace(`public/saves/${project}/images/`, '');
                path.split('/').reduce( function(prev, current) {
                    return prev[current] || (prev[current] = {});
                }, output);
            });
            if (typeof output == "undefined") {
                resolve([]);
            } else {
                output = Object.keys(output);
                resolve(output);
            }
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
            log(`Configuration option ${logs.y}${key}${logs.reset} has been set to: ${logs.b}${value}${logs.reset}`, ['H', 'CONFIG', logs.c]);
        }
    }

    for (const key in logsConfig) {
        if (Object.hasOwnProperty.call(logsConfig, key)) {
            const value = logsConfig[key];
            log(`Configuration option ${logs.y}${key}${logs.reset} has been set to: ${logs.b}${value}${logs.reset}`, ['H', 'CONFIG', logs.c]);
        }
    }
}
