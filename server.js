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
import { request } from 'http';

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
    log("New client connected", "A");
    res.header('Content-type', 'text/html');

    const fileSearches = [
        globby(['public/saves']),
        globby(['public/fonts'])
    ]

    Promise.all(fileSearches).then((values) => {

        var savesObj = {}
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
                } else if (typeof current == "string" && current == "logo") {
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
})
app.get('/images', (req, res) => {
    log("Request for images", "D");
})
app.get('/template', (req, res) => {
    log("Request for template", "D");
})


/* Request functions */


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
            /* let uploaded = req.files.JSON;
    
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
            }); */
        }
    } catch (err) {
        logObj("File upload error", err, "E");
        res.status(500).send(err);
    }

    /* Some gross PHP EWWWWW 
    if (isset($_FILES['images'])) {
        $return;
        $project = $_POST['project'];
      
        if ($_POST['new'] == "true") {
          $path = "saves/$project";
          $data = 'var credits = [
              {
                  "spacing": "8",
                  "imageHeight": "24",
                  "image": "../../../assets/Placeholder.jpg",
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
          ]';
          file_put_contents("1.js", $data);
          $return["new"] = true;
          $return["project"] = $project;
        } else {
          $return["new"] = false;
        }
      
        $projPath = "saves/$project/logo/";
        mkdir($projPath);
      
        $images = $_FILES['images'];
        $fileCount = count($images["name"]);
      
        for ($i = 0; $i < $fileCount; $i++) {
          $file = $images["tmp_name"][$i];
          $name = $images["name"][$i];
          move_uploaded_file($file, $projPath.$name);
        }
      
      
        $saves = array_flip(array_diff(scandir("saves"), array('..', '.')));
        foreach ($saves as $key => $save) {
          $images = array_diff(scandir("saves/$key/logo"), array('..', '.'));
          asort($images);
          $imagesArray[$key] = $images;
        }
        $return["type"] = "success";
        $return["images"] = $imagesArray;
        echo json_encode($return);
      }*/
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