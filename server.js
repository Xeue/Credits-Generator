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

const serverVersion = "1.0.0";
const serverID = new Date().getTime();

import {globby} from 'globby';
import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import {log, logObj, logs} from './logs.js';
import path from 'path';
import {fileURLToPath} from 'url';
import AmdZip from "adm-zip";

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

app.post('/save', (req, res) => {
    doSave(req, res);
})
app.post('/media', (req, res) => {
    doMedia(req, res);
})

app.get('/fonts', (req, res) => {
    log("Request for fonts", "D");
    const project = req.query.project;
    sendZip(res, [`public/fonts`], project+"_fonts");
})
app.get('/images', (req, res) => {
    log("Request for images", "D");
    const project = req.query.project;
    sendZip(res, [`public/saves/${project}/images`], project+"_images");
})
app.get('/template', (req, res) => {
    log("Request for template", "D");
    const project = req.query.project;
    sendZip(res, [`public/template`], project+"_template");
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
                } else if (typeof current == "string" && current == "images") {
                    return prev[current] || (prev[current] = []);
                } else if (Object.prototype.toString.call(prev) === '[object Array]') {
                    prev.push(current);
                }
                return prev[current] || (prev[current] = {});
            }, savesObj)
        });

        const fonts = [];
        values[1].forEach((font)=>{
            fonts.push(font.substring(13));
        })

        res.render('home', {
            saves: savesObj.public.saves,
            fonts: fonts,
            serverName: config.installName
        });
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

function doMedia(req, res) {
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
            const imgDir = `public/saves/${project}/images`;
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

            const uploadedItems = req.files["images[]"];

            if (Array.isArray(uploadedItems)) {
                uploadedItems.forEach((item)=>{
                    item.mv(`${imgDir}/${item.name}`);
                })
            } else {
                uploadedItems.mv(`${imgDir}/${uploadedItems.name}`);
            }

            globby(["public/saves"]).then((files)=>{
                returnObj.type = "success";

                let output = {};
                files.forEach(function(path) {
                    path.split('/').reduce( function(prev, current) {
                        if (typeof current == "string" && current.indexOf(".js") !== -1) {
                            return
                        } else if (typeof current == "string" && current == "images") {
                            return prev[current] || (prev[current] = []);
                        } else if (Object.prototype.toString.call(prev) === '[object Array]') {
                            prev.push(current);
                            return;
                        }
                        return prev[current] || (prev[current] = {});
                    }, output);
                });

                let images = output.public.saves;

                for (const project in images) {
                    if (Object.hasOwnProperty.call(images, project)) {
                        images[project] = Object.assign({}, images[project].images);
                    }
                }
                
                returnObj.images = images;
                res.send(returnObj);
            });
        }
    } catch (err) {
        logObj("File upload error", err, "E");
        res.status(500).send(err);
    }
}

function sendZip(res, pathArray, zipName) {
    const zip = new AmdZip();
    for (const folder of pathArray) {
        zip.addLocalFolder(folder);
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