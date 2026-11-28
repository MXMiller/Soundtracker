export default function AboutPage() {
  return (
    <div className="content library-page about-page">
      <div className="welcome-row">
        <div>
          <h1>About Soundtracker</h1>
          <p>
            I like writing and listening to movie/tv/videogame soundtracks, <br />
            so I made this as a better way to keep track of them.
            <br /><br />
            I made this app as a final project for one of my CS classes. <br />
            Almost all the coding was done by ChatGPT Codex. <br />
            The app itself contains no AI features.
            <br /><br />
            I'm using the free tier of Supabase and Cloudflare for this so there's <br />
            not much storage. If this thing gets popular and I can make enough <br />
            money from it I'd like to upgrade so more people can use
            it.
            <br /><br />
            I hope this helps you make something cool :)
          </p>
          <h2>Features</h2>
          <p>
            Users can develop their own soundtracks or analyze other peoples soundtracks. 
            <br /><br />
            Soundtracks have story items (characters, settings, ideas, other), leitmotifs, and a tracklist. <br />
            All of these have their own details page with the things they're related to, like a characters  <br />
            page having a link to that characters theme. 
            <br /><br />
            Soundtracks, story items, and leitmotifs can be color-coded. 
            <br /><br />
            Story items can have associated key signatures and instruments. 
            <br /><br />
            Leitmotifs can reference or be referenced by other leitmotifs. 
            <br /><br />
            Tracks on the tracklist can have links to where you can listen to them, like a youtube or spotify link. <br />
            You can specifiy when/how different leitmotifs appear in a track. 
            <br /><br />
            Soundtracks can be exported as .md files and imported to make another soundtrack. 
          </p>
        </div>
      </div>
    </div>
  );
}
