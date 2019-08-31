<!DOCTYPE html>
<html>
	<head>
		<title>Timesheet</title>
	</head>
	<body>
		<form>
			<h1>Last <input name="daysLimit" value="{$daysLimit}" size=2> active workdays</h1>
			<p>
				<label title="How many seconds may elapse between edits to be considered part of the same span">
					gapLimit <input name="gapLimit" value="{$gapLimit}">
				</label>
				<label title="Minimum number of seconds to be counted for each span of edits when calculating daily total">
					minimumSessionDuration <input name="minimumSessionDuration" value="{$minimumSessionDuration}">
				</label>
				<label title="How many seconds to subtract from the time of edit before determining what day it belongs to">
					dayShift <input name="dayShift" value="{$dayShift}">
				</label>
			</p>

			<input type="submit" value="Refresh">
		</form>
		{foreach item=day from=$data}
			<h2>{$day.date}</h2>
			{foreach item=author from=$day.authors}
				<h3>{$author.Person->FullName}</h3>
				<table>
					<tr>
						<th>Start</th>
						<th>End</th>
						<th>Duration</th>
					</tr>
					{foreach item=session from=$author.sessions}
						<tr>
							<td>{$session.firstEdit|date_format:'%r'}</td>
							<td>{$session.lastEdit|date_format:'%r'}</td>
							<td>{number_format($session.duration/60, 1)} minutes</td>
						</tr>
					{/foreach}
					<tr>
						<td colspan="2" align="right">Total</td>
						<td>
							{number_format($author.totalDuration/60, 1)} minutes<br>
							{number_format($author.totalDuration/3600, 1)} hours
						</td>
					</tr>
				</table>
			{/foreach}
		{foreachelse}
			<em>No workdays found</em>
		{/foreach}
	</body>
</html>