export type Visibility = 'open' | 'public' | 'private'
export type StoryType = 'Character' | 'Setting' | 'Idea' | 'Other'
export type ViewPage = 'library' | 'explore' | 'favorites' | 'shared'
export type SoundtrackSection = 'story' | 'motifs' | 'tracks'
export type ModalType = 'soundtrack' | 'story' | 'motif' | 'track' | 'import' | 'share' | null

export interface StoryItem {
  id: string
  name: string
  type: StoryType
  description: string
  imageUrl: string
  musicalKey: string
  instruments: string[]
  motifIds: string[]
  trackIds: string[]
}

export interface Leitmotif {
  id: string
  name: string
  description: string
  notationUrl: string
  storyItemIds: string[]
  derivedFromIds: string[]
}

export interface TrackMotif {
  leitmotifId: string
  appearanceInTrack: string
  appearanceInStory: string
}

export interface Track {
  id: string
  name: string
  composers: string[]
  description: string
  trackNumber: number | null
  listeningUrl: string
  motifAppearances: TrackMotif[]
}

export interface Soundtrack {
  id: string
  ownerId: string
  ownerName: string
  name: string
  composers: string[]
  description: string
  listeningUrl: string
  visibility: Visibility
  createdAt: string
  updatedAt: string
  collaborators: Record<string, 'view' | 'edit'>
  storyItems: StoryItem[]
  leitmotifs: Leitmotif[]
  tracks: Track[]
}

export type SoundtrackEntity = StoryItem | Leitmotif | Track
