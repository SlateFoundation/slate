$.registerSiteSearchRenderer(
    ['Person', 'User', 'Emergence\\People\\Person', 'Emergence\\People\\User'],
    'People',
    function(result) {
        var link = $('<a />')
            .text(result.FirstName + ' ' + result.LastName)
            .attr('href', result.recordURL);

        if (result.Username) {
            link.append($('<div class="muted" />').text(result.Username));
        }

        return link;
    }
);