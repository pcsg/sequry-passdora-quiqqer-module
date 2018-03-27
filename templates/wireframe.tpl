<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Passdora - Welcome</title>

    <link rel="stylesheet" href="/packages/bin/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="/packages/sequry/passdora/bin/css/style.css">

    <link href='//fonts.googleapis.com/css?family=Open+Sans:300,400,600,800' rel='stylesheet' type='text/css'>

    {$header}
</head>
<body>
<div id="loader-overlay" class="hidden">
    <i id="loader-overlay-icon" class="fa fa-circle-o-notch fa-spin fa-5x"></i>
    <p id="loader-overlay-text"><b>Loading Passdora...</b></p>
</div>

<header>
    <img id="logo" src="/packages/sequry/passdora/bin/img/Passdora_Logo.png">
</header>

<div id="welcome">
    <h1>Welcome to Passdora!</h1>
</div>

{$content}

</body>
</html>