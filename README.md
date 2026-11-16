# Soundtracker
An app for organizing soundtracks and leitmotifs. 

Users have:
- Username
- email
- Password
- Description (optional)
- Projects

Projects have:
- Name
- Soundtrack
- User/owner
- Description (optional)
- Creation date
- Visibility (public/private)

Soundtracks will have:
- Name
- Composer(s)
- Description (optional)
- Two view modes: 
  - Story view: List of characters/settings/ideas in the story etc. Each has: 
    - Name
    - Description (optional)
    - A picture (optional)
    - Associated leitmotifs (optional)
    - Associated instruments (optional)
    - Tracks related to them (optional)
  - Leitmotif view: List of leitmotifs. Each has: 
    - Name
    - Description (optional)
    - A visual representation of the leitmotif like sheet music or midi (optional)
    - Assocaited characters/settings/ideas
    - List of leitmotif's derived from it
   - All characters, settings, ideas, leitmotifs, etc. have their own page that shows extra info
- Track list. Each track has:
  - Name
  - Composer(s)
  - Description (optional)
  - List of leitmotifs in the track
  - Where they appear in the track (optional)
  - Where they appear in the film/tv show/game/musical/etc. (optional)
- Notes

Database design: 
- Each soundtrack has its own table of all the songs in it. 
- Each song has an id, name, song type (song or score), an audio file or link to the song (some way to listen to it), and a table of motifs in this track/connections to other songs with optional timestamps. 
- Each leitmotif has a name, description, visualization of the motif (sheet music or midi), optional motifs derived from it, and a table of songs containing it. 
- Each idea/character has a table of songs and motifs related to it. 
- You can visualize it either as a list of ideas or characters and the motifs, instruments, keys related to them, or as a list of motifs and what they mean and where they appear.

Services used: 
- Supabase or BigQuery
