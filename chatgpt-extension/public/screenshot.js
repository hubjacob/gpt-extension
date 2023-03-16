// Remove the selection (with the cursor's left click) while taking the screenshot
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'takeScreenshot') {
    console.log("contentScript.js -> Executing the script")
    // Create a new div element to cover the entire page
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)'; // Set the color and opacity of the overlay

    // Add the overlay to the page
    document.body.appendChild(overlay);

    // Set the cursor to a crosshair
    document.body.style.cursor = 'crosshair';

    // Variable used for the dimensions of the canvas
    var startX, startY, endX, endY;

    // Listeners to the mouse events on the page
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseDown(event){
      startX = event.clientX;
      startY = event.clientY;
      //Not really necessary but its to put at the same position as the start variable.
      endX = startX;
      endY = startY;
    }

    function onMouseMove(event) {
      if (startX !== null && startY !== null) {
        // Update the size of the selection based on the current mouse position
        endX = event.clientX;
        endY = event.clientY;

        // Set the position and size of the overlay element
        overlay.style.top = Math.min(startY, endY) + 'px';
        overlay.style.left = Math.min(startX, endX) + 'px';
        overlay.style.width = Math.abs(endX - startX) + 'px';
        overlay.style.height = Math.abs(endY - startY) + 'px';
      }
    }
    function onMouseUp(event) {

      chrome.runtime.sendMessage({ action: 'normalWindow' });
      // Remove the mouse event listeners
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Create a canvas element with the same size and position as the overlay
      var canvas = document.createElement('canvas');
      canvas.width = Math.abs(endX - startX);
      canvas.height = Math.abs(endY - startY);
      canvas.style.position = 'fixed';
      canvas.style.top = overlay.style.top;
      canvas.style.left = overlay.style.left;
      // Draw the selected area of the page onto the canvas
      var ctx = canvas.getContext('2d');
      var sx = Math.min(startX, endX);
      var sy = Math.min(startY, endY);
      var sw = Math.abs(endX - startX);
      var sh = Math.abs(endY - startY);
      html2canvas(document.body, { 
        allowTaint: true, 
        useCORS: true,
        x: sx, 
        y: sy, 
        width: sw, 
        height: sh 
      }).then(function(canvas) {
        // Draw the canvas onto the context
        ctx.drawImage(canvas, 0, 0);
         // Convert the canvas to a Base64 encoded PNG image
          var dataURL = canvas.toDataURL('image/png');
          var base64String = dataURL.split(',')[1];
          console.log('base64String', {base64String})
          sendResponse(base64String);
      });

      overlay.remove();
      canvas.remove();
      document.body.style.cursor = '';
    }

    return true;
  }
});

