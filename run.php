
<html>
  <head>
    <title>Remote Run</title>
    <style>
      body {
        background: #000;
        color: #fff;
        font-family: Ubuntu;
      }
      button {
        cursor: pointer;
        padding: 0.5em 1em;
        box-sizing: border-box;
        border-radius: 5px;
        min-width: 50px;
        color: rgb(255, 255, 255);
        transition: 0.2s;
        border: none;
        background-color: rgb(45, 45, 45);
        border-top: 1px rgb(71, 71, 71) solid;
        margin-left: 0;
        font-size: 20pt;
        width: 190px;
        height: 83px;
      }
      button:hover {
        background-color: rgb(22, 22, 22);
        border-top: 1px rgb(44, 44, 44) solid;
      }
      #time {
        padding: 0.5em 1em;
        box-sizing: border-box;
        border-radius: 5px;
        min-width: 50px;
        color: rgb(255, 255, 255);
        transition: 0.2s;
        border: none;
        margin-left: 5px;
        background-color: rgb(81, 81, 81);
        border-top: 1px rgb(71, 71, 71) solid;
        margin-left: 0;
        font-size: 20pt;
        width: 190px;
        height: 83px;
      }

      .but {
        width: 190px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-content: center;
        flex-direction: column;
        font-size: 20pt;
      }
      .cont {
        display: flex;
      }
    </style>
  </head>
  <body>
    <div class="cont">
      <div class="but">Duration:</div>
      <input value="60" id="time" type="text"/>
      <div style="width: 10px;"></div>
      <button class="" onclick="triggerStart()" type="button">Run</button>
      <div style="width: 10px;"></div>
      <button class="" onclick="reset()" type="button">Reset</button>
      <!--<div style="width: 10px;"></div>
      <button class="" onclick="toggleFull()" type="button">Fullscreen</button>-->
    </div>
    <script type="text/javascript">
      function triggerStart() {
        if (window.opener) {
          let time = document.getElementById("time").value;
          window.opener.postMessage('{"command":"setTime","time":'+time+'}', "*");
          window.opener.postMessage('{"command":"hideUI"}', "*");
          window.opener.postMessage('{"command":"run"}', "*");
        }
      }
      function toggleUI() {
        if (window.opener) {
          window.opener.postMessage('{"command":"toggleUI"}', "*");
        }
      }
      function reset() {
        if (window.opener) {
          window.opener.postMessage('{"command":"reset"}', "*");
        }
      }
      function toggleFull() {
        if (window.opener) {
          window.opener.postMessage('{"command":"full"}', "*");
        }
      }
      function setTime() {
        if (window.opener) {
          let time = document.getElementById("time").value;
          window.opener.postMessage('{"command":"setTime","time":'+time+'}', "*");
        }
      }
    </script>
  </body>
</html>
