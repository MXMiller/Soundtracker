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
- PostgreSQL schema: [`soundtracker-schema.sql`](soundtracker-schema.sql), designed for Supabase.
- Supabase Auth manages passwords and sign-in. Each `profiles` row uses the matching Auth user UUID and stores the user's username, email, profile image file path, and description.
- `soundtracks` stores each soundtrack's owner, name, description, listening link, visibility, and created/modified timestamps. `soundtrack_composers` supports multiple composers per soundtrack.
- `soundtrack_access` grants selected users view or edit access. Visibility is `open`, `public`, or `private`; the app's access rules determine who can view, edit, or delete each soundtrack.
- `soundtrack_favorites` records users' favorite soundtracks.
- `story_items` stores characters, settings, ideas, and other story concepts. `instruments` and `story_item_instruments` associate instruments with story items.
- `leitmotifs` stores motif details and an optional notation file path or external link. `story_item_leitmotifs` connects motifs to story items, and `leitmotif_derivations` records motifs derived from other motifs.
- `tracks` stores the soundtrack tracklist, including optional track numbers, listening links, and audio file paths. `track_composers` supports multiple composers per track; `track_leitmotifs` records motifs and where they appear in the track or story.
- Images, notation files, and audio files belong in Supabase Storage; the database stores their file paths. The schema defines relationships and constraints; Row Level Security policies still need to be added to enforce access rules for database requests.

### Tools used: 
- React for frontend. 
- PostgreSQL and Supabase backend for authentication and storage. 
- Cloudflare for web hosting. 
