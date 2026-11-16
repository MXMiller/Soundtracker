# Soundtracker
An app for developing your own soundtracks or organizing and disecting other soundtracks. 

### Users have:
- Username
- Email
- Password
- pfp (optional)
- Description (optional)
- Their soundtracks
- Other soundtracks shared with them
- Favorite soundtracks by other users

### Soundtracks will have: 
- Name
- Composer(s)
- Description (optional)
- Link to soundtrack on a listening platform (optional)
- Two view modes: 
  - Story view: List of characters/settings/ideas in the story etc. Each has: 
    - Name
    - Description (optional)
    - A picture (optional)
    - Associated leitmotifs (optional)
    - Associated instruments (optional)
    - Associated key (optional)
    - Associated tracks (optional)
  - Leitmotif view: List of leitmotifs. Each has: 
    - Name
    - Description (optional)
    - A visual representation of the leitmotif like sheet music or midi (optional)
    - Associated characters/settings/ideas (optional)
    - List of leitmotif's derived from it (optional)
- Tracklist. Each track has: 
  - Name
  - Composer(s) for each track
  - Description (optional)
  - List of leitmotifs in the track
  - Where they appear in the track (optional)
  - Where they appear in the film/tv show/game/musical/etc. (optional)
  - Link to the track on some listening platform (optional)
  - Maybe an audio file of the track? depends how much storage that would take (optional)
- Date created
- Date modified
- Visibility (open/public/private)
  - Open soundtracks are visible and editable by other users. Only the original user can delete the soundtrack. 
  - Public soundtracks are visible to other users, but only editable by the original user. 
  - Private soundtracks are only visible and editable by the original user. The original user can give specific users access with either editing or viewing permissions. 

#### Other features: 
- All characters, settings, ideas, leitmotifs, etc. have their own subpages which show extra info like the full description.
- Each page and subpage has a create, edit, and delete button for users with the right permissions.
  - Create button creates a new page and opens it in edit mode. The different name, description, etc. fields have default descriptive text.
  - Edit button shows the current page in edit mode. User has to confirm changes. 
  - Delete button prompts the user for confirmation before deleting. 
- Soundtracks and can be exported as a .pdf, .md, or .txt file. 
- Users can search for and view other users public and open projects, similar to a wiki page. 

### Database design:
- Table of users with their info
- Table of soundtracks with their info and foreign keys to things, leitmotifs, and track list tables
  - Table of things in the story with a name, type, etc.
  - Table of leitmotifs wit their information. 
  - Table of songs with their information. 

### Tools used: 
- Supabase and magic links for authentication?
- BigQuery for database and storage?
- Object oriented development. 
- Maybe have an online web-app version and a local offline version.
