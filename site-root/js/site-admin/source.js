(function() {

    // wire select all/none buttons
    $('button.worktree-select-all').click(function() {
        $(this).closest('form').find('input[type=checkbox]').prop('checked', true);
    });
    
    $('button.worktree-select-none').click(function() {
        $(this).closest('form').find('input[type=checkbox]').prop('checked', false);
    });

})();