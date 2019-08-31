$.registerSiteSearchRenderer(
    ['Emergence\\CMS\\BlogPost'],
    'Blog Posts',
    function(result) {
        var link = $('<a />')
            .text(result.recordTitle)
            .attr('href', result.recordURL);

        if (result.Summary) {
            link.append($('<div class="muted" />').text(result.Summary));
        }

        return link;
    }
);