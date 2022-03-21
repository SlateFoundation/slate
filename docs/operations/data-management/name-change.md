# Name changes

If a person's name needs to be changed, their `First Name`, `Last Name`, and `Preferred [First] Name` fields can be edited by any staff user from the `/manage` interface.

`Username` can be edited there as well if desired.

## Propogating to Google Workspace

When Slate is used to synchronize a school's Google Workspace, a name and/or email address change made in Slate should be propogated to Google Workspace by Slate.

After making changes to name or username fields, open a user's **Contacts** tab under the `/manage` interface and edit their school email to match the new desired email address if it is to be updated as well. A user's *desired* Google Workspace email is set by whatever email address `@` the school's Google Workspace domain is set for them, and for any user created by Slate or previously found in a sync by Slate, changes to this desired email address will be detected and applied to Google.

Visit `/connectors/gsuite` and use **Pretend** mode first to confirm that the desired changes are to be applied correctly, and then run the synchronization again with **Pretend** mode turned off to apply the changes.

When a user's email address in the Google Workspace gets updated, the previous one is automatically left on the account as an alias so emails sent to the previous email address will continue to be delivered. This is standard behavior for Google Workspace. If this is not desired, have a Google Workspace administrator look up the user in the Google Workspace admin console and manually delete the alias after the rename is synchronized.

## Propogating to Canvas

When Slate is used to synchronize a school's Canvas instance, a name and/or email address change made in Slate should be propogated to Canvas by Slate.

After making any desired changes to name and/or email, ensure the changes are synchronized first with Google Workspace if applicable. Otherwise, make sure any new email address is deliverable before synchronizing Canvas to use it.

Visit `/connectors/canvas` and use **Pretend** mode first to confirm that th edesired changes are to be applied correctly with **Push Users** enabled, and then run the synchronization again with **Pretend** mode turned off to apply the changes.
