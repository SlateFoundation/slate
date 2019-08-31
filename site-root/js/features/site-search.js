/* jshint undef: true, unused: true, browser: true, quotmark: single, curly: true */
(function($) {
    var resultRenderers = {};

    $.registerSiteSearchRenderer = function(classes, groupTitle, renderer) {
        if (typeof classes == 'string') {
            classes = [classes];
        }

        renderer.groupTitle = groupTitle;
        renderer.classes = classes;

        $.each(classes, function(index, className) {
            resultRenderers[className] = renderer;
        });
    };

    $(function() {
        $('.js-site-search').each(function() {
            var $searchForm = $(this),
                $searchField = $searchForm.find('input[name=q]'),
                $resultsList = $('<ul />').appendTo($searchForm).addClass('search-results dropdown-menu').hide(),
                lastTypedQuery, lastRequestedQuery, searchTimeout, searchXHR, hideResultsOnBlur;


            // bind events to search field
            $searchField.attr('autocomplete', 'off');

            $searchField.keyup(function() {
                var query = $searchField.val();

                if (query == lastTypedQuery) {
                    return;
                }

                lastTypedQuery = query;

                // abort any pending search timeout
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                    searchTimeout = null;
                }

                // execute or clear search
                if (query.length >= 2 && query) {
                    $searchForm.addClass('is-waiting');
                    $resultsList.show();
                    searchTimeout = setTimeout(_doSearch, 300);
                } else {
                    $resultsList.hide().empty();
                    lastRequestedQuery = null;

                    // abort any pending query
                    if (searchXHR) {
                        searchXHR.abort();
                        searchXHR = null;
                    }
                }
            });

            $searchField.focus(function() {
                if (lastRequestedQuery) {
                    $resultsList.show();
                }
            });


            // bind body event to hide results
            $(document).click(function(e) {
                if (!$searchForm.is(e.target) && !$searchForm.has(e.target).length) {
                    $resultsList.hide();
                }
            });

            $(document).keydown(function(e) {
                var waitingToRun = hideResultsOnBlur,
                    activeEl = $(document.activeElement);

                if (!$resultsList.is(':visible') || waitingToRun === true) {
                    return;
                }

                if (activeEl && activeEl != $resultsList && activeEl != $searchForm && !activeEl.closest($searchForm).length && !activeEl.closest($resultsList).length) {
                    hideResultsOnBlur = true;
                    setTimeout(function() {
                        $resultsList.hide();
                        hideResultsOnBlur = false;
                    }, 100);
                }
            });


            // bind form events for keyboard navigation
            $searchForm.keydown(function(e) {
                var isDown = e.which == 40, // 40 = down arrow
                    $resultLinks, lastLinkIndex, currentLinkIndex, nextLinkIndex;

                if (!isDown && e.which != 38) { // 38 = up arrow
                    return;
                }

                e.preventDefault();

                if (!$resultsList.is(':visible')) {
                    return;
                }

                $resultLinks = $resultsList.find('a');
                lastLinkIndex = $resultLinks.length - 1;
                currentLinkIndex = $resultLinks.index($(e.target).closest('a'));

                if (currentLinkIndex == -1) {
                    focusLinkIndex = isDown ? 0 : lastLinkIndex;
                } else {
                    if ( (currentLinkIndex == 0 && !isDown) || (currentLinkIndex == lastLinkIndex && isDown) ) {
                        // return focus to field at ends of results list
                        $searchField.focus();
                        return;
                    }

                    focusLinkIndex = currentLinkIndex + (isDown ? 1 : -1);
                }

                $resultLinks[focusLinkIndex].focus();
            });


            // workflow methods
            function _doSearch() {
                var query = $searchField.val(),
                    params = {
                        q: query,
                        include: 'recordTitle,recordURL'
                    };

                $searchForm.removeClass('is-waiting');

                if (searchXHR) {
                    searchXHR.abort();
                    searchXHR = null;
                }

                if (query == lastRequestedQuery) {
                    return;
                }

                lastRequestedQuery = query;
                $searchForm.addClass('is-loading');
                searchXHR = $.ajax({
                    url: '/search',
                    headers: {
                        Accept: 'application/json'
                    },
                    data: params,
                    success: _renderResults
                });
            }

            function _renderResults(results) {
                $searchForm.removeClass('is-loading');

                if (results.totalResults) {
                    $searchForm.removeClass('no-results');
                    $resultsList.empty();
                    $.each(results.data, function(key, value) {
                        if (!value.length) {
                            return;
                        }

                        var $section = $('<section />').addClass('results-group');
                        $('<h6 />').appendTo($section).addClass('group-title dropdown-header').text(
                            key in resultRenderers ? resultRenderers[key].groupTitle : key
                        );

                        $.each(value.slice(0, 5), function(index, result) {
                            $('<li />').addClass('search-result').append(
                                (resultRenderers[result.Class] || _defaultResultRenderer)(result).addClass('dropdown-item')
                            ).appendTo($section);
                        });

                        if (value.length > 5) {
                            $('<li />').addClass('search-result').append(
                                $('<a class="dropdown-item more-link" />')
                                    .html((value.length - 5) + ' more&hellip;')
                                    .attr('href', '/search?q=' + encodeURIComponent(lastRequestedQuery))
                            ).appendTo($section);
                        }

                        $section.appendTo($resultsList);
                    });
                } else {
                    $searchForm.addClass('no-results');
                    $resultsList.html('<div class="empty-text">No results</div>');
                }
            }

            function _defaultResultRenderer(result) {
                return $('<a />')
                    .text(result.recordTitle)
                    .attr('href', result.recordURL);
            }

        }); // end form.site-search loop

    });
}(jQuery));