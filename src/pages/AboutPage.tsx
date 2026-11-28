import { AudioLines, BookOpen, Disc3, Share2 } from "lucide-react";

const aboutSections = [
  {
    icon: <BookOpen size={18} />,
    title: "Connect music to the story",
    description:
      "Build soundtrack pages for characters, settings, and ideas, then link them to the music they shape.",
  },
  {
    icon: <AudioLines size={18} />,
    title: "Follow recurring themes",
    description:
      "Track leitmotifs, their references, and the moments where they appear in each track.",
  },
  {
    icon: <Disc3 size={18} />,
    title: "Keep the tracklist organized",
    description:
      "Arrange tracks in order, add composers and listening links, and keep every connection close at hand.",
  },
  {
    icon: <Share2 size={18} />,
    title: "Explore and share",
    description:
      "Share soundtracks with collaborators or publish them for other listeners to explore.",
  },
];

export default function AboutPage() {
  return (
    <div className="content library-page about-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow muted-eyebrow">ABOUT THE PROJECT</div>
          <h1>About Soundtracker</h1>
          <p>A place to connect the music with the stories behind it.</p>
        </div>
      </div>
      <div className="section-toolbar">
        <div className="list-title"><h2>Keep every musical idea connected</h2></div>
      </div>
      <div className="about-grid">
        {aboutSections.map((section) => (
          <article className="about-card" key={section.title}>
            <span className="about-icon">{section.icon}</span>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </article>
        ))}
      </div>
      <footer className="page-footer">
        Soundtracker <span>·</span> Keep the music connected to the story.
      </footer>
    </div>
  );
}
