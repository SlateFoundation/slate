$.registerSiteSearchRenderer(
    ['Emergence\\CMS\\Page'],
    'Pages',
    function(result) {
        return $('<a />')
            .text(result.recordTitle)
            .attr('href', result.recordURL);
    }
);