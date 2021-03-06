<!DOCTYPE html>

<?php
  $saves = array_flip(array_diff(scandir("saves"), array('..', '.')));
  $fonts = array_flip(array_diff(scandir("assets/fonts"), array('..', '.')));
  $savesJson = $saves;
  $savesText = implode(str_replace(".js","",array_diff(scandir("saves"), array('..', '.'))),',');
  function stripLogo($string) {
    return strpos($string, 'logo') === false;
  }

  foreach ($saves as $key => $save) {
    $versions = array_diff(scandir("saves/$key"), array('..', '.'));
    $filteredVersions = str_replace(".js","",array_filter($versions, 'stripLogo'));
    asort($filteredVersions);
    $savesJson[$key] = implode($filteredVersions,',');
    $saves[$key] = $filteredVersions;

    $images = array_diff(scandir("saves/$key/logo"), array('..', '.'));
    asort($images);
    $imagesArray[$key] = $images;
  }

  $versions = str_replace(".js","",array_reverse(array_values($saves)[0]));
  arsort($versions);
?>

<html lang="en">

  <head>
    <meta charset="UTF-8">
    <title><?=explode('.', $_SERVER[HTTP_HOST], 2)[1]?> - Credits Generator</title>
    <link rel="icon" href="assets/clapper.png" sizes="32x32">
    <link rel="icon" href="assets/clapper.png" sizes="192x192">
    <link rel="stylesheet" href="credits.css">
    <link rel="stylesheet" href="builder.css">
    <style>
      <?php
        foreach ($fonts as $key => $font) {
          $fontName = strtok(str_replace("-", " ", $key), '.');
          ?>
          @font-face {
            font-family: "<?=$fontName?>";
            src: url("assets/fonts/<?=$key?>");
          }
        <?php }
      ?>
    </style>
    <script src="webcg-framework.umd.js"></script>
    <script src="jquery-3.6.0.js"></script>
    <script src="cookie.js"></script>
    <script>
      images = <?=json_encode($imagesArray)?>
    </script>
    <script src="builder.js"></script>
    <script src="editor.js"></script>
    <script src="credits.js"></script>
  </head>

  <body id="mainBody">
    <main id="creditsBody" class="background">
      <header>
        <select id="loadFile" data-projects="<?=$savesText?>">
          <?php
            foreach ($saves as $key => $save) {
              echo "<option id='proj_$key' value='$key' data-versions=".$savesJson[$key].">$key</option>";
            }
          ?>
        </select>
        <select id="loadVersion">
          <?php
            foreach ($versions as $key => $version) {
              echo "<option value='$version'>$version</option>";
            }
          ?>
        </select>
        <button id="newButton">
          New
        </button><button id="saveButton">
          Save
        </button><button id="loadButton" style="display: none;">
          Load
        </button><button id="uploadImgButton">
          Upload Files
        </button><button id="downloadMultiButton">
          Download
        </button><button id="uploadButton">
          Import
        </button><button id="downloadButton">
          Export
        </button>
        <button id="help" class="right">Help</button>
        <button id="full" class="right">Fullscreen</button>
        <button id="run" class="right">Run</button>
        <button id="editButton" class="right">Edit</button>
        <button id="settings" class="right">Settings</button>
      </header>

      <div id="creditsScroller">
        <div id="creditsCont">
        </div>
      </div>

      <div id="creditsLogos" class="hidden">

      </div>

      <div id="downloadsPopup" class="hidden popup">
        <form id="downloadForm" action="/" method="POST">
          <header id="downloadHead">Download</header>
          <section id="downloadBody">
            <div id="downloadImg" class="selected selectable">
              Download Images
            </div>
            <div id="downloadFonts" class="selectable">
              Download Fonts
            </div>
            <div id="downloadTemplate" class="selectable">
              Download Caspar Template
            </div>
          </section>
          <footer id="downloadFoot">
            <button id="downloadButDone" type="button">Download</button>
            <button id="downloadButCancel" type="button">Cancel</button>
          </footer>
        </form>
      </div>

      <div id="newSave" class="hidden popup">
        <form id="saveForm" action="/" method="POST">
          <header id="saveHead">Import</header>
          <section id="saveBody">
            <div id="saveFile" class="hidden">
              <input type="file" id="saveUpload" name="uploadJSON">
            </div>
            <div id="saveExisting" class="selected">
              <div class="label">Add to existing</div>
              <div>
                <select id="loadFileBut">
                  <?php
                    foreach ($saves as $key => $save) {
                      echo "<option value='$key' data-versions=".$savesJson[$key].">$key</option>";
                    }
                  ?>
                </select>
                <select id="loadVersionBut">
                  <?php
                    foreach (array_reverse(array_values($saves)[0]) as $key => $version) {
                      echo "<option value=".str_replace(".js","",$version).">".str_replace(".js","",$version)."</option>";
                    }
                  ?>
                  <option value='new'>New Version</option>
                </select>
              </div>
            </div>
            <div id="saveNew" class="flexCol">
              <div class="label">Create new</div>
              <input id="saveNewProject" type="text" placeholder="Project">
            </div>
          </section>
          <footer id="saveFoot">
            <button id="saveButSave" type="button">Upload</button>
            <button id="saveButCancel" type="button">Cancel</button>
          </footer>
        </form>
      </div>

      <div id="uploadImg" class="hidden popup">
        <form id="uploadForm" action="/" method="POST">
          <header id="uploadHead">Upload Files</header>
          <section id="uploadBody">
            <div id="uploadFile">
              <input type="file" id="uploadImageInput" name="images[]" multiple>
            </div>
            <div id="uploadExisting" class="selected">
              <div class="label">Add to existing</div>
              <select id="uploadFileBut">
                <?php
                  foreach ($saves as $key => $save) {
                    echo "<option value='$key' data-versions=".$savesJson[$key].">$key</option>";
                  }
                ?>
              </select>
            </div>
            <div id="uploadNew" class="flexCol">
              <div class="label">Create new</div>
              <input id="uploadNewProject" type="text" placeholder="Project">
            </div>
          </section>
          <footer id="uploadFoot">
            <button id="uploadButSave" type="button">Upload</button>
            <button id="uploadButCancel" type="button">Cancel</button>
          </footer>
        </form>
      </div>

      <div id="toutorial" class="hidden popup">
        <div>
          <header id="tutHead">Help/Info</header>
          <section id="tutBody">
            This site can be used for creating and editing credits, it has a main credits scroller and then seperate "fades" that fade up in turn at the end.<br/>
            </br>
            The credits can either be run in browser vai the "Run" button, or loaded into CasparCG via a custom template.<br/>
            </br>
            The cutom template uses two variables in caspar, "source" which is a path or URL to a credits file. Secondly, "duration" the number in seconds that the first main scroll should take.<br/>
            To load the credits into caspar via a file, use the "export" button, save the file and set it's path as the "source".</br>
            If you wish to load the credits directly from the website use the url in the format show here:</br>
            <?=$_SERVER[HTTP_HOST].$_SERVER[REQUEST_URI]?>saves/PROJECT/VERSION.js</br>
            </br>
            Settings for the credits can be changed in the settings menu, these are in the form of CSS rules:
            <a href="https://www.w3schools.com/cssref/">https://www.w3schools.com/cssref/</a><br>
            </br>
            To make changes to the credits, click on the edit button, then click on the "block" you want to edit,
            from there properties of the block can be turned on and off and their values edited.<br>
            For names a roles, if you paste in a comma seperated list, it will automatically split them into seperate entries.<br>
            Click and drag to re-order the properties.<br>
            <br>
            You can right click on properties in the editor to move them or delete them. The same can be down to reorder blocks in the main scroller.<br>
            <br>
            For help and support, or to raise any bugs or feature requests, please go to <a href="https://github.com/Xeue/Credits-Generator">https://github.com/Xeue/Credits-Generator</a>
          </section>
          <footer id="tutFoot">
            <button id="tutClose" type="button">Got it!</button>
          </footer>
        </div>
      </div>

      <footer id="creditsFooter">
        <button id="creditsButton" class="tabButton active">Main</button>
        <button id='newFade'>+</button>
      </footer>
    </main>
    <aside id="editorCont">
    </aside>
    <nav>
      <button id="navMoveUp">Move Up</button><button id="navMoveDown">Move Down</button><button id="navDelete">Delete</button>
    </nav>
  </body>

</html>
