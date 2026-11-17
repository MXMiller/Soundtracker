import type { Soundtrack } from './types'

const day = 86400000
const now = Date.now()

export const currentUser = { id: 'u-jamie', name: 'Jamie Chen', email: 'jamie@example.com' }

export const initialSoundtracks: Soundtrack[] = [
  {
    id: 'st-glass', ownerId: currentUser.id, ownerName: currentUser.name,
    name: 'Test Soundtrack', composers: ['Example Composer'],
    description: 'Placeholder soundtrack for trying out Soundtracker features.',
    listeningUrl: 'https://open.spotify.com/', visibility: 'private',
    createdAt: new Date(now - 17 * day).toISOString(), updatedAt: new Date(now - 2 * day).toISOString(), collaborators: {},
    storyItems: [
      { id: 'si-elin', name: 'Character 1', type: 'Character', description: 'Placeholder character for testing soundtrack connections.', imageUrl: '', musicalKey: 'D minor', instruments: ['Cello', 'Glass harmonica'], motifIds: ['lm-home', 'lm-shard'], trackIds: ['tr-opening', 'tr-below'] },
      { id: 'si-greenhouse', name: 'Setting 1', type: 'Setting', description: 'Placeholder setting for testing soundtrack connections.', imageUrl: '', musicalKey: 'A major', instruments: ['Flute', 'Harp'], motifIds: ['lm-home'], trackIds: ['tr-opening'] },
      { id: 'si-memory', name: 'Idea 1', type: 'Idea', description: 'Placeholder idea for testing soundtrack connections.', imageUrl: '', musicalKey: 'D Dorian', instruments: ['Glass harmonica'], motifIds: ['lm-shard'], trackIds: ['tr-below'] },
    ],
    leitmotifs: [
      { id: 'lm-home', name: 'Placeholder Leitmotif 1', description: 'Placeholder leitmotif for testing soundtrack connections.', notationUrl: '', storyItemIds: ['si-elin', 'si-greenhouse'], derivedFromIds: [] },
      { id: 'lm-shard', name: 'Placeholder Leitmotif 2', description: 'Second placeholder leitmotif for testing references.', notationUrl: '', storyItemIds: ['si-elin', 'si-memory'], derivedFromIds: ['lm-home'] },
    ],
    tracks: [
      { id: 'tr-opening', name: 'Example Track 1', composers: ['Example Composer'], description: 'First placeholder track for testing soundtrack connections.', trackNumber: 1, listeningUrl: '', motifAppearances: [{ leitmotifId: 'lm-home', appearances: [{ id: 'tr-opening-lm-home-1', appearanceInTrack: 'Example timestamp', appearanceInStory: 'Character 1 appears' }] }] },
      { id: 'tr-below', name: 'Example Track 2', composers: ['Example Composer'], description: 'Second placeholder track for testing soundtrack connections.', trackNumber: 2, listeningUrl: '', motifAppearances: [{ leitmotifId: 'lm-shard', appearances: [{ id: 'tr-below-lm-shard-1', appearanceInTrack: 'Example timestamp', appearanceInStory: 'Character 1 develops' }] }] },
    ],
  },
  {
    id: 'st-salt', ownerId: 'u-ari', ownerName: 'Ari Mendoza',
    name: 'Shared Test Soundtrack', composers: ['Example Composer'],
    description: 'Placeholder shared soundtrack for testing the Explore page.', listeningUrl: '', visibility: 'public',
    createdAt: new Date(now - 40 * day).toISOString(), updatedAt: new Date(now - 5 * day).toISOString(), collaborators: {},
    storyItems: [
      { id: 'si-lio', name: 'Character 2', type: 'Character', description: 'Placeholder character for testing shared soundtracks.', imageUrl: '', musicalKey: 'E minor', instruments: ['Piano', 'Viola'], motifIds: ['lm-tide'], trackIds: ['tr-lowtide'] },
      { id: 'si-lighthouse', name: 'Setting 2', type: 'Setting', description: 'Placeholder setting for testing shared soundtracks.', imageUrl: '', musicalKey: 'C major', instruments: ['French horn'], motifIds: ['lm-tide'], trackIds: ['tr-lowtide'] },
    ],
    leitmotifs: [{ id: 'lm-tide', name: 'Placeholder Leitmotif 3', description: 'Placeholder leitmotif for testing shared soundtrack connections.', notationUrl: '', storyItemIds: ['si-lio', 'si-lighthouse'], derivedFromIds: [] }],
    tracks: [{ id: 'tr-lowtide', name: 'Example Track 3', composers: ['Example Composer'], description: 'Placeholder track for testing shared soundtracks.', trackNumber: 1, listeningUrl: '', motifAppearances: [{ leitmotifId: 'lm-tide', appearances: [{ id: 'tr-lowtide-lm-tide-1', appearanceInTrack: 'Example timestamp', appearanceInStory: 'Character 2 appears' }] }] }],
  },
  {
    id: 'st-night', ownerId: currentUser.id, ownerName: currentUser.name,
    name: 'Test Soundtrack 2', composers: ['Example Composer'],
    description: 'Another placeholder soundtrack for testing the app.', listeningUrl: '', visibility: 'open',
    createdAt: new Date(now - 6 * day).toISOString(), updatedAt: new Date(now - day).toISOString(), collaborators: {},
    storyItems: [], leitmotifs: [], tracks: [],
  },
]

export const demoPeople = ['Alex Morgan', 'Sam Rivera', 'Taylor Brooks']
