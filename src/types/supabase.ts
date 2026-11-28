export interface UserProfile {
  id: string;
  username: string;
  description: string | null;
  profile_image_file_path: string | null;
  avatar_color: string | null;
}

export interface SoundtrackDocumentRow {
  id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  visibility: "open" | "public" | "private";
  payload: unknown;
  updated_at: string;
}
