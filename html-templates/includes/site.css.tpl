{*
    Compresses all CSS files into a single request.
	Add ?cssdebug=1 to any URL to load separate uncompressed files
*}
{cssmin "main.css"}

{*
	Load fonts individually for better caching
*}
{cssmin "fonts/lato.css+fonts/sanchez.css"}