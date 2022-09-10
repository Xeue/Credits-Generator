<?php

function stripLogo($string) {
  return strpos($string, 'logo') === false;
}

if ($_FILES["JSON"]["error"] == UPLOAD_ERR_OK) {
  $file = $_FILES["JSON"]["tmp_name"];
  $project = $_POST['project'];
  if ($_POST['version'] == "new") {
    $versions = array_diff(scandir("saves/$project"), array('..', '.'));
    $filteredVersions = array_filter($versions, 'stripLogo');
    $versionsNum = str_replace(".js","",$filteredVersions);
    $version = max($versionsNum) + 1;
  } else {
    $version = $_POST['version'];
  }
  $projPath =  __DIR__."/saves/$project";
  mkdir($projPath);
  $path =  __DIR__."/saves/$project/$version.js";
  //move_uploaded_file($file, $path);
  if (move_uploaded_file($file, $path)) {
    echo '{"type":"success","project":"'.$project.'","version":"'.$version.'"}';
  } else {
    echo "Not uploaded because of error #".$_FILES["JSON"]["error"];
    print_r($_FILES);
  }
}

//echo '{"type":"success","project":"'.$project.'","version":"'.$version.'"}';
//echo $file;

?>
