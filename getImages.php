<?php

$project = $_GET['project'];

//Archive name
$archive_file_name = $project."_images.zip";

//Download Files path
$file_path = $_SERVER['DOCUMENT_ROOT']."/saves/".$project."/logo/";

zipFilesAndDownload($archive_file_name,$file_path);

function zipFilesAndDownload($archive_file_name,$file_path) {
    $zip = new ZipArchive();
    //create the file and throw the error if unsuccessful
    if ($zip->open($archive_file_name, ZIPARCHIVE::CREATE )!==TRUE) {
        exit("cannot open <$archive_file_name>\n");
        echo "Error, cannot create ZIP";
    }
    //add each files of $file_name array to archive

    $file_names = array_diff(scandir($file_path), array('..', '.'));
    foreach($file_names as $files)
    {
        $zip->addFile($file_path.$files,$files);
        //echo $file_path.$files,$files."
    }

    $zip->close();
    //then send the headers to force download the zip file
    header("Content-type: application/zip");
    header("Content-Disposition: attachment; filename=$archive_file_name");
    header("Content-length: " . filesize($archive_file_name));
    header("Pragma: no-cache");
    header("Expires: 0");
    readfile("$archive_file_name");
    exit;
}

?>
