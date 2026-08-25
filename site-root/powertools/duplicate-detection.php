<?php

use Slate\People\Merge\CandidateDetectionRunner;

// configure request/response
$GLOBALS['Session']->requireAccountLevel('Administrator');
set_time_limit(0);
header('Content-Type: text/html; charset=utf-8');

$summary = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['run'])) {
    $summary = CandidateDetectionRunner::run();
}

?>

<form method="POST">
    <fieldset>
        <legend>Duplicate person detection</legend>
        <p>
            Runs every registered detector (identical name, shared contact
            point, identical Student Number, mapping anomaly) and upserts
            its findings into the duplicate-candidate queue
            (<code>GET /people/merge/candidates</code>).
        </p>
        <p>
            Re-running is always safe: a dismissed or deferred pair is
            never resurrected, an already-merged pair is left alone, and an
            already-open pair is only re-scored -- never duplicated.
        </p>
        <div>
            <input type="submit" name="run" value="Run detection">
        </div>
    </fieldset>
</form>

<?php if ($summary !== null): ?>
    <h2>Run complete</h2>
    <table border="1" cellpadding="4" cellspacing="0">
        <thead>
            <tr>
                <th>Detector</th>
                <th>Matches found</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($summary as $slug => $count): ?>
                <tr>
                    <td><?= htmlspecialchars((string) $slug); ?></td>
                    <td><?= (int) $count; ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <p>
        A "match found" count includes pairs that were already dismissed,
        deferred, or merged (left untouched) -- see
        <code>GET /people/merge/candidates?status=open</code> for what's
        actually new or re-scored.
    </p>
<?php endif; ?>
