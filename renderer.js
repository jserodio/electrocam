(function() {

	window.addEventListener('DOMContentLoaded', function() {
		let isStreaming = false,
			video = document.querySelector('video'),
			canvas = document.querySelector('canvas'),
			screenshot = document.querySelector('#screenshot'),
			ctx = canvas.getContext('2d');
			w = 640, 
			h = 480;

		// Cross browser
		navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		if (navigator.getUserMedia) {
			// Request access to video only
			navigator.getUserMedia(
				{
					video:true,
					audio:false
				},		
				function(stream) {
					// Cross browser checks
					let url = window.URL || window.webkitURL;
        			video.src = url ? url.createObjectURL(stream) : stream;
        			// Set the video to play
        			video.play();
				},
				function(error) {
					alert('Something went wrong. (error code ' + error.code + ')');
					return;
				}
			);
		}
		else {
			alert('Sorry, the browser you are using doesn\'t support getUserMedia');
			return;
		}

		// Wait until the video stream can play
		video.addEventListener('canplay', function(e) {
		    if (!isStreaming) {
		    	// videoWidth isn't always set correctly in all browsers
		    	if (video.videoWidth > 0) h = video.videoHeight / (video.videoWidth / w);
				canvas.setAttribute('width', w);
				canvas.setAttribute('height', h);
				// Reverse the canvas image
				ctx.translate(w, 0);
  				ctx.scale(-1, 1);
		      	isStreaming = true;
		    }
		}, false);

		// Wait for the video to start to play
		video.addEventListener('play', function() {
			// Every 33 milliseconds copy the video image to the canvas
			setInterval(function() {
				if (video.paused || video.ended) return;
				ctx.fillRect(0, 0, w, h);
				ctx.drawImage(video, 0, 0, w, h);
			}, 33);
		}, false);

		// When the screenshot button is clicked, toggle the screenshot indicator
		screenshot.addEventListener('click', function() {	takeScreenshot(canvas); }, false);

	})

	// Function to take a screenshot an display it in a borderless window
	let takeScreenshot = function(canvas) {
		let dataURI = canvas.toDataURL('png');
		const BrowserWindow = require('electron').remote.BrowserWindow;
		const path = require('path');

		// Save data to localStorage
		localStorage.clear();
		localStorage.setItem('dataURI', dataURI);

		const modalPath = path.join('file://', __dirname, './sections/windows/imageModal.html');
		let win = new BrowserWindow({ frame: false , width: w+20, height: h+20});
		win.on('close', function () { win = null });
		win.loadURL(modalPath);
		win.show();
	}


})();