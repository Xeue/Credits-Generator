<?php
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
}
?>
