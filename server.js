/* eslint-disable no-undef */
import {globby} from 'globby'
import express from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import fs from 'fs'
import {log, logObj, logs} from 'xeue-logs'
import render from './render.js'
import path from 'path'
import {fileURLToPath} from 'url'
import AdmZip from 'adm-zip'
import commandExists from 'command-exists'
import ejs from 'ejs'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const {version} = require('./package.json')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let config
try {
	config = JSON.parse(fs.readFileSync(__dirname + '/config.conf'))
} catch (error) {
	log('There is an error with the config file or it doesn\'t exist, please check it', 'E')
	logObj('Config error', error, 'E')
	process.exit(1)
}
config.loggingLevel = config.loggingLevel ? config.loggingLevel : 'W'
config.debugLineNum = config.debugLineNum ? config.debugLineNum : false
config.port = config.port ? config.port : 3000
config.devMode = config.devMode ? config.devMode : false
config.installName = config.installName ? config.installName : 'Unknown Site'

const logsConfig = {
	'createLogFile': true,
	'logsFileName': 'CreditsLogging',
	'configLocation': __dirname,
	'loggingLevel': config.loggingLevel,
	'debugLineNum': config.debugLineNum
}

logs.setConf(logsConfig)
const app = express()
await folderExists(__dirname+'/public/saves', true)
logs.printHeader('Credits Generator')
log('Running version: v'+version, ['H', 'SERVER', logs.g])
printConfig()


/* Express setup & Endpoints */


app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload({
	createParentPath: true
}))

app.listen(config.port, '0.0.0.0', () => {
	log(`Credits Generator can be accessed at http://localhost:${config.port}`, ['C', 'SERVER', logs.g])
})

app.get('/',  (req, res) =>  {
	doHome(req, res)
})

app.get('/frame',  (req, res) =>  {
	doFrame(req, res)
})

app.get('/run', (req, res) => {
	log('Requesting run dialog', 'A')
	res.header('Content-type', 'text/html')
	res.render('run', {})
})

app.get('/save', (req, res) => {
	getSave(req, res)
})
app.post('/save', (req, res) => {
	doSave(req, res)
})


app.get('/fonts', (req, res) => {
	log('Request for fonts', 'D')
	const project = req.query.project
	sendZip(res, ['public/fonts',`public/saves/${project}/fonts`], project+'_fonts')
})
app.post('/fonts', (req, res) => {
	doUpload(req, res, 'fonts')
})
app.delete('/fonts', (req, res) => {
	doDelete(req, res, 'fonts')
})

app.post('/images', (req, res) => {
	doUpload(req, res, 'images')
})
app.get('/images', (req, res) => {
	log('Request for images', 'D')
	const project = req.query.project
	sendZip(res, [`public/saves/${project}/images`], project+'_images')
})
app.delete('/images', (req, res) => {
	doDelete(req, res, 'images')
})

app.get('/template', async (req, res) => {
	log('Request for template', 'D')
	const [saves, fonts] = await getSavesAndFonts()
	const project = typeof req.query.project !== 'undefined' ? req.query.project : Object.keys(saves)[0]
	const version = typeof req.query.version !== 'undefined' ? req.query.version : saves[project].count
	const buffer = await fs.promises.readFile(`${__dirname}/public/saves/${project}/${version}.json`)
	const projectObject = JSON.parse(buffer.toString())
	projectObject.images = await imageList(project)
	const renderParams = {
		globalFonts: fonts,
		project: project,
		version: version,
		projectObject: projectObject,
		host: req.get('host')
	}
	ejs.renderFile(__dirname + '/views/template.ejs', renderParams, async (err, html)=>{
		const zip = new AdmZip()
		zip.addFile('credits.html', Buffer.from(html, 'utf8'), 'Template')

		if (await folderExists(`public/saves/${project}/images`)) {
			zip.addLocalFolder(`public/saves/${project}/images`, 'images')
		}
		if (await folderExists(`public/saves/${project}/fonts`)) {
			zip.addLocalFolder(`public/saves/${project}/fonts`, 'fonts')
		}

		zip.addLocalFolder('public/fonts', 'fonts')
		zip.addFile(`${project}_v${version}.json`, await fs.promises.readFile(`public/saves/${project}/${version}.json`),'',0o0644)
		zip.addLocalFile('public/css/credits.css','lib')
		zip.addLocalFile('public/lib/webcg-framework.umd.js','lib')
		zip.addLocalFile('public/lib/webcg-devtools.umd.js','lib')
		zip.addLocalFile('public/lib/jquery-3.6.0.js','lib')
		zip.addLocalFile('public/js/builder.js','lib')
		const zipBuffer = zip.toBuffer()
		res.set('Content-disposition', `attachment; filename=${project}_v${version}_template.zip`)
		res.send(zipBuffer)
	})
})

app.get('/render', (req, res) => {
	let project = req.query.project
	let version = req.query.version
	let fps = parseInt(req.query.fps)
	let frames = parseInt(req.query.frames)
	let width = 1920
	let height = 1080
	switch (parseInt(req.query.resolution)) {
	case 1440:
		height = 720
		width = 1440
		break
	case 1920:
		height = 1080
		width = 1920
		break
	case 3840:
		height = 2160
		width = 3840
		break
	case 4096:
		height = 2160
		width = 4096
		break
	default:
		break
	}
	render(`http://localhost:${config.port}`, project, version, fps, frames, width, height, true, logsConfig)
		.then(()=>{
			setTimeout(()=>{
				sendZip(res, [`public/saves/${project}/renders/${version}/`], `${project}_credits`)
			},1000)
		}).catch((err)=>{
			logObj('Rendering error', err, 'E')
		})
})


/* Request functions */


async function doHome(req, res) {
	log('New client connected', 'A')
	res.header('Content-type', 'text/html')
	const [saves, fonts] = await getSavesAndFonts()
	let hasFFMPEG = false
	try {
		await commandExists('ffmpeg')
		hasFFMPEG = true
	} catch (error) {
		try {
			await commandExists('FFMPEG')
			hasFFMPEG = true
		} catch (error) {
			log('FFMPEG not installed on this server', 'W')
		}
	}

	res.render('home', {
		saves: saves,
		globalFonts: fonts,
		serverName: config.installName,
		project: req.query.project,
		render: hasFFMPEG
	})
}

async function doFrame(req, res) {
	log('New Render Page Spawned', 'A')
	res.header('Content-type', 'text/html')

	const [saves, fonts] = await getSavesAndFonts()

	res.render('render', {
		globalFonts: fonts,
		fps: req.query.fps,
		project: req.query.project,
		version: req.query.version,
		id: req.query.id
	})
}

async function getSave(req, res) {
	log('Getting saved credits', 'D')
	const [saves, font] = await getSavesAndFonts()
	const project = typeof req.query.project !== 'undefined' ? req.query.project : Object.keys(saves)[0]
	const version = typeof req.query.version !== 'undefined' ? req.query.version : saves[project].count
	try {
		const buffer = await fs.promises.readFile(`${__dirname}/public/saves/${project}/${version}.json`)
		let data = JSON.parse(buffer.toString())
		data.images = await imageList(project)
		res.json(data)
	} catch (error) {
		log(`Cannot load save file: ${project}/${version}.json doesn't exist?`, 'W')
		logObj('Error message', error, 'W')
		res.status(500)
		res.send(JSON.stringify({
			'status': 'error',
			'message': 'Save not found',
			'error': error
		}))
	}
}
async function doSave(req, res) {
	log('Saving uploaded credits', 'D')
	const project = req.body.project
	let version = req.body.version

	if (project === undefined || version === undefined) {
		log(`Failed to get Project (${project}) or Version (${version})`)
		res.send({
			status: false,
			message: 'Invalid data'
		})
		return
	}

	try {
		if(!req.files) {
			res.send({
				status: false,
				message: 'No file uploaded'
			})
		} else {
			let uploaded = req.files.JSON
    
			const projectDir = `public/saves/${project}`
			await folderExists(projectDir, true)

			if (version == 'new') {
				let files = await fs.promises.readdir(projectDir)
				let count = 0
				files.forEach(file => {
					const current = parseInt(file.substring(0, file.indexOf('.json')))
					if (current > count) {
						count = current
					}
				})
				count++
				version = count
			}

			uploaded.mv(`${projectDir}/${version}.json`)

			res.send({
				status: true,
				message: {
					'type': 'success',
					'project': project,
					'version': version
				},
				data: {
					name: uploaded.name,
					mimetype: uploaded.mimetype,
					size: uploaded.size
				}
			})
		}
	} catch (err) {
		logObj('File upload error', err, 'E')
		res.status(500).send(err)
	}
}

async function doUpload(req, res, uploadType) {
	log('Saving uploaded Images/Fonts', 'D')
	const project = req.body.project
	const newProject = req.body.new

	const returnObj = {}

	if (project === undefined) {
		log(`Failed to get Project (${project})`)
		res.send({
			status: false,
			message: 'Invalid data'
		})
		return
	}

	try {
		if(!req.files) {
			res.send({
				status: false,
				message: 'No file uploaded'
			})
		} else {

			const projectDir = `public/saves/${project}`
			const imgDir = uploadType == 'fonts' ? `public/${uploadType}` : `public/saves/${project}/${uploadType}`

			await folderExists(imgDir, true)

			if (newProject) {
				const template = '{}'
				await fs.promises.writeFile(`${projectDir}/1.json`, template)
				returnObj.new = true
				returnObj.project = project
			} else {
				returnObj.new = false
			}

			const uploadedItems = req.files['files[]']

			if (Array.isArray(uploadedItems)) {
				uploadedItems.forEach((item)=>{
					item.mv(`${imgDir}/${item.name}`)
				})
			} else {
				uploadedItems.mv(`${imgDir}/${uploadedItems.name}`)
			}

			returnObj.type = 'success'
			returnObj.save = await getUpdatedProjects(project)
			res.send(returnObj)
		}
	} catch (err) {
		logObj('File upload error', err, 'E')
		res.status(500).send(err)
	}
}
async function doDelete(req, res, deleteType) {
	const file = req.query.file
	const project = req.query.project
	const returnObj = {}
	try {
		await fs.promises.unlink(`public/saves/${project}/${deleteType}/${file}`)
		const saves = await getUpdatedProjects()
		returnObj.type = 'success'
		returnObj.save = saves[project]
		res.send(returnObj)
	} catch (error) {
		const saves = await getUpdatedProjects()
		logObj('File error', error, 'W')
		res.status(500)
		returnObj.type = 'fail'
		returnObj.save = saves[project]
		returnObj.error = error
		res.send(returnObj)
	}
}

async function getUpdatedProjects(project) {
	const files = await globby(['public/saves'])
	let output = {}
	files.forEach(function(path) {
		path = path.replace('public/saves/', '')
		path.split('/').reduce( function(prev, current) {
			if (typeof current == 'string' && current.indexOf('.json') !== -1) {
				return
			} else if (typeof current == 'string' && (current == 'images' || current == 'fonts' )) {
				return prev[current] || (prev[current] = [])
			} else if (Object.prototype.toString.call(prev) === '[object Array]') {
				prev.push(current)
				return
			}
			return prev[current] || (prev[current] = {})
		}, output)
	})

	return typeof project === 'undefined' ? output : output[project]
}

async function getSavesAndFonts() {
	const [_saves, _fonts] = await Promise.all([
		globby(['public/saves']),
		globby(['public/fonts'])
	])
    
	const saves = {}
	_saves.forEach(function(path) {
		path = path.replace('public/saves/','')
		path.split('/').reduce( function(prev, current) {
			if (typeof current == 'string' && current.indexOf('.json') !== -1) {
				current = parseInt(current.substring(0, current.indexOf('.json')))
				let prevCount = parseInt(prev.count)
				let count = prevCount
				if (prevCount < current || prev.count == null) {
					count = current
				}
				return prev.count = count
			} else if (typeof current == 'string' && (current == 'images' || current == 'fonts')) {
				return prev[current] || (prev[current] = [])
			} else if (Object.prototype.toString.call(prev) === '[object Array]') {
				prev.push(current)
				return
			}
			return prev[current] || (prev[current] = {})
		}, saves)
	})
    
	const fonts = []
	_fonts.forEach((font)=>{
		fonts.push(font.substring(13))
	})

	return [saves, fonts]
}

function imageList(project) {
	const promise = new Promise((resolve) => {
		globby([`public/saves/${project}/images`]).then((files)=>{
			let output = {}
			files.forEach(function(path) {
				path = path.replace(`public/saves/${project}/images/`, '')
				path.split('/').reduce( function(prev, current) {
					return prev[current] || (prev[current] = {})
				}, output)
			})
			if (typeof output == 'undefined') {
				resolve([])
			} else {
				output = Object.keys(output)
				resolve(output)
			}
		})
	})
	return promise
}

async function sendZip(res, pathArray, zipName) {
	const zip = new AdmZip()
	for (const folder of pathArray) {
		if (await folderExists(folder)) {
			zip.addLocalFolder(folder)
		}
	}
	const zipBuffer = zip.toBuffer()
	res.set('Content-disposition', `attachment; filename=${zipName}.zip`)
	res.send(zipBuffer)
}

/* Utility Functions */


function printConfig() {
	for (const key in config) {
		if (Object.hasOwnProperty.call(config, key)) {
			const value = config[key]
			log(`Configuration option ${logs.y}${key}${logs.reset} has been set to: ${logs.b}${value}${logs.reset}`, ['H', 'CONFIG', logs.c])
		}
	}

	for (const key in logsConfig) {
		if (Object.hasOwnProperty.call(logsConfig, key)) {
			const value = logsConfig[key]
			log(`Configuration option ${logs.y}${key}${logs.reset} has been set to: ${logs.b}${value}${logs.reset}`, ['H', 'CONFIG', logs.c])
		}
	}
}

async function folderExists(path, makeIfNotPresent = false) {
	let found = true
	try {
		await fs.promises.access(path)
	} catch (error) {
		found = false
		if (makeIfNotPresent) {
			log(`Folder: ${logs.y}(${path})${logs.reset} not found, creating it`, 'D')
			try {
				await fs.promises.mkdir(path, {'recursive': true})
			} catch (error) {
				log(`Couldn't create folder: ${logs.y}(${path})${logs.reset}`, 'W')
				logObj('Message', error, 'W')
			}
		} else {
			log(`Folder: ${logs.y}(${path})${logs.reset} not found`, 'D')
		}
	}
	return found
}