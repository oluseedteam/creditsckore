<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}?v=2" />
    <link rel="shortcut icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}?v=2" />
    <link rel="apple-touch-icon" href="{{ asset('favicon.svg') }}?v=2" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>myscorenova</title>
    <meta name="description" content="Your guided journey from credit repair to homeownership." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800&family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
