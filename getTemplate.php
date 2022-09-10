<?php

$project = $_GET['project'];
$version = $_GET['version'];

//Archive name
$archive_file_name = $project."_template.zip";

//Download Files path
$file_path = $_SERVER['DOCUMENT_ROOT']."/template/";
$file_pathProject = $_SERVER['DOCUMENT_ROOT']."/saves/".$project."/logo/";
$file_pathSave = $_SERVER['DOCUMENT_ROOT']."/saves/".$project."/";

zipFilesAndDownload($archive_file_name,$file_path,$file_pathProject, $file_pathSave);

function zipFilesAndDownload($archive_file_name,$file_path,$file_pathProject, $file_pathSave) {
    $zip = new ZipArchive();
    //create the file and throw the error if unsuccessful
    if ($zip->open($archive_file_name, ZIPARCHIVE::CREATE )!==TRUE) {
        exit("cannot open <$archive_file_name>\n");
        echo "Error, cannot create ZIP";
    }

    $zip->addFile($file_pathSave.$version.".js","credits.json");

    //add each files of $file_name array to archive
    $file_names = array_diff(scandir($file_path), array('..', '.'));
    foreach($file_names as $files) {
        $zip->addFile($file_path.$files,$files);
    }

    $file_names_proj = array_diff(scandir($file_pathProject), array('..', '.'));
    $zip->addEmptyDir("logo");
    foreach($file_names_proj as $files_proj) {
        $zip->addFile($file_pathProject.$files_proj,"logo/".$files_proj);
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
