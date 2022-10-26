function triggerStart() {
	if (window.opener) {
		window.opener.postMessage('{"command":"run"}', '*')
	}
}
function toggleUI() {
	if (window.opener) {
		window.opener.postMessage('{"command":"toggleUI"}', '*')
	}
}
window.addEventListener('message', (e)=>{
	const command = e.data.command
	const data = ++e.data.data
	switch (command) {
	case 'fadesDuration':
		document.getElementById('fadesTime').innerHTML = data
		break
	default:
		break
	}
})

window.addEventListener('load', () => {
	window.opener.postMessage('{"command":"loaded"}', '*')
})