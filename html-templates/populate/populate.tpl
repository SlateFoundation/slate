<!DOCTYPE html>
<html>
    <body>
		<form action="/populate" method="POST">
			<div class"field">
				<label>Number of students <input type="text" name="numStudents" placeHolder=500></label>
			</div>
			<div class"field">
				<label for="numTeachers">Number of teachers</label>
				<input type="text" name="numTeachers" id="numTeachers" placeHolder=25>
			</div>
			<div class"field">
				<label for="numStaff">Number of staff</label>
				<input type="text" name="numStaff" id="numStaff" placeHolder=3>
			</div>
			<div class"field">
				<label for="numAdministrators">Number of administrators</label>
				<input type="text" name="numAdministrators" id="numAdministrators" placeHolder=3>
			</div>
			<div class"field">
				<label for="startYear">Lowest graduating year</label>
				<input type="text" name="startYear" id="startYear" placeHolder=2013>
			</div>
			<div class"field">
				<label for="numYears"># of  years</label>
				<input type="text" name="numYears" id="numYears" placeHolder=4>
			</div>
			<div class"field">
				<label for="numSections"># of  available classes</label>
				<input type="text" name="numCourseSections" id="numSections" placeHolder=50>
			</div>
			<div class"field">
				<label for="minPartForSection"># of Minimum partipants per class</label>
				<input type="text" name="minSectionParticipants" id="minPartForSection" placeHolder=25>
			</div>
			<div class"field">
				<label for="maxPartForSection"># of Maximum partipants per class</label>
				<input type="text" name="maxSectionParticipants" id="maxPartForSection" placeHolder=50>
			</div>
			<div class"field">
				<label for="interimsPerSection"># of Interims per class</label>
				<input type="text" name="interimsPerStudent" id="interimsPerSection" placeHolder=2>
			</div>
			<div class"field">
				<label for="narrativesPerSection"># of Narratives per class</label>
				<input type="text" name="narrativesPerStudent" id="narrativesPerSection" placeHolder=2>
			</div>
			<div class"field">
				<label for="progressnotesPerStudent"># of Progress notes per student</label>
				<input type="text" name="progressNotesPerStudent" id="progressnotesPerStudent" placeHolder=2>
			</div>
			<div class"field">
				<label for="blogsPerStudent"># of Blogs per student</label>
				<input type="text" name="blogsPerStudent" id="blogsPerStudent" placeHolder=2>
			</div>
			<div class"field">
				<label for="worksheetsPerClass"> # of Standard worksheets per Class</label>
				<input type="text" name="worksheetPerClass" id="worksheetsPerClass" placeHolder=2>
			</div>
			<div class"field">
				<label for="gradesPerWorksheet"># of Graded Students Per Worksheet</label>
				<input type="text" name="gradedStudentsPerWorksheet" id="gradesPerWorksheet" placeHolder=2>
			</div>
	
			<div class"field">
				<label for="assets">Create Assets</label>
				<input type="checkbox" name="createAssets" id="assets" checked=true value=1>
			</div>
	
			<div class"field">
				<input type="submit"  value="Submit">
			</div>	
		</form>
	</body>
</html>