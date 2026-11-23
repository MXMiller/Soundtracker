# Soundtracker
An app for developing your own soundtracks or organizing and disecting other soundtracks. 

### Users
- Users sign in through Supabase Auth, which manages their password and authentication.
- Each user has a username, email, optional profile picture, and optional description.
- Users can create their own soundtracks, access soundtracks shared with them, and favorite soundtracks by other users.

### Soundtracks
- Each soundtrack has a name, one or more composers, an optional description, and an optional listening-platform link.
- **Story view** organizes characters, settings, ideas, and other story items. Each item can have a name, optional description and picture, and associations with leitmotifs, instruments, key signatures, and tracks.
- **Leitmotif view** lists motifs with a name, optional description and sheet music or MIDI representation. Motifs can be associated with story items and derived from other motifs.
- **Tracklist** contains tracks with a name, one or more composers, optional description, and optional listening link or audio file. Tracks can list leitmotifs and where each appears in the track and in the film, show, game, or other work.
- Soundtracks record their creation and modification dates.
- **Visibility and access:**
  - **Open:** Other users can view and edit the soundtrack; only its owner can delete it.
  - **Public:** Other users can view it; only its owner can edit or delete it.
  - **Private:** Only its owner can view and edit it unless the owner grants specific users view or edit access. Only the owner can delete it.

#### Other features: 
- All characters, settings, ideas, leitmotifs, etc. have their own subpages which show extra info like the full description.
- Each page and subpage has a create, edit, and delete button for users with the right permissions.
  - Create button creates a new page and opens it in edit mode. The different name, description, etc. fields have default descriptive text.
  - Edit button shows the current page in edit mode. User has to confirm changes. 
  - Delete button prompts the user for confirmation before deleting. 
- Soundtracks can be exported as a .md file and imported again as a new private copy with internal page links preserved. 
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
- Images and notation files belong in Supabase Storage; the database stores their file paths. The schema defines relationships and constraints; Row Level Security policies still need to be added to enforce access rules for database requests. (Audio file storage can be added if I pay for a much higher storage limit.)

![Database ERD](./repo_assets/Soundtracker_ERD.webp) 

### Tech Stack: 
- Typescript and React for frontend. 
- Vite to build and deploy. 
- Cloudflare Pages for web hosting. 
<<<<<<< Updated upstream
=======
- PostgreSQL and Supabase for backend authentication and storage. 

![Tech flow](./repo_assets/Soundtracker_system_design.png) 

### Run locally
- Install dependencies with `npm install`.
- Start the local development server with `npm run dev`, then open the URL Vite prints in a browser.
- This first version is a browser-only demo. It uses sample data and saves edits in local storage; Supabase authentication, database access, and file storage are not connected yet.
- Build a production bundle with `npm run build`.

## TO-DO:
- Setup backend
- Replace ai-generated images and icons with one made by people. 
- Make associated leitmotif and track fields in edit page lists you add to or remove from. Options show up as drop downs menus when you click "add associated leitmotif" or "add associated track". 
- Fix ai errors. 
- Add about page. 
- Maybe add a track type to track items (score, original song, etc.)
>>>>>>> Stashed changes
