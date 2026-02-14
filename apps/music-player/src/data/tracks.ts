export interface Track {
  id: string;
  title: string;
  artist: string;
  src: `https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/${string}.mp3`;
  genre:
    | "Film Score"
    | "Classical Piano"
    | "Piano"
    | "Contemporary Piano"
    | "Classical"
    | "Soundtrack"
    | "Pop"
    | "Violin"
    | "Indie";
}

const BLOB_STORAGE_URL =
  "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/";

export const TRACKS: Track[] = [
  {
    id: "dvorak_8",
    title: "Symphony No. 8",
    artist: "Dvorak",
    src: `${BLOB_STORAGE_URL}dvorak-8_symphony.mp3`,
    genre: "Classical",
  },
  {
    id: "heart_of_courage",
    title: "Heart of Courage",
    artist: "Two Steps From Hell",
    src: `${BLOB_STORAGE_URL}heart_of_courage.mp3`,
    genre: "Film Score",
  },
  {
    id: "interstellar",
    title: "Interstellar Theme",
    artist: "Hans Zimmer",
    src: `${BLOB_STORAGE_URL}interstellar.mp3`,
    genre: "Film Score",
  },
  {
    id: "oppenheimer",
    title: "Can You Hear The Music",
    artist: "Ludwig Göransson",
    src: `${BLOB_STORAGE_URL}oppenheimer-can_you_hear_the_music.mp3`,
    genre: "Film Score",
  },
  {
    id: "fur_elise",
    title: "Für Elise",
    artist: "Beethoven",
    src: `${BLOB_STORAGE_URL}beethoven-fur_elise.mp3`,
    genre: "Classical Piano",
  },
  {
    id: "moonlight_sonata",
    title: "Moonlight Sonata",
    artist: "Beethoven",
    src: `${BLOB_STORAGE_URL}beethoven-moonlight_sonata.mp3`,
    genre: "Classical Piano",
  },
  {
    id: "fantaisie_impromptu",
    title: "Fantaisie Impromptu",
    artist: "Chopin",
    src: `${BLOB_STORAGE_URL}chopin-fantaisie_impromptu.mp3`,
    genre: "Classical Piano",
  },
  {
    id: "comptine",
    title: "Comptine d'un autre été",
    artist: "Yann Tiersen",
    src: `${BLOB_STORAGE_URL}comptine_dun_autre_ete.mp3`,
    genre: "Piano",
  },
  {
    id: "experience",
    title: "Experience",
    artist: "Ludovico Einaudi",
    src: `${BLOB_STORAGE_URL}einaudi-experience.mp3`,
    genre: "Contemporary Piano",
  },
  {
    id: "fly",
    title: "Fly",
    artist: "Ludovico Einaudi",
    src: `${BLOB_STORAGE_URL}einaudi-fly.mp3`,
    genre: "Contemporary Piano",
  },
  {
    id: "nuvole_bianche",
    title: "Nuvole Bianche",
    artist: "Ludovico Einaudi",
    src: `${BLOB_STORAGE_URL}einaudi-nuvole_bianche.mp3`,
    genre: "Contemporary Piano",
  },
  {
    id: "una_mattina",
    title: "Una Mattina",
    artist: "Ludovico Einaudi",
    src: `${BLOB_STORAGE_URL}einaudi-una_mattina.mp3`,
    genre: "Contemporary Piano",
  },
  {
    id: "river_flows_in_you",
    title: "River Flows In You",
    artist: "Yiruma",
    src: `${BLOB_STORAGE_URL}yiruma-river_flows_in_you.mp3`,
    genre: "Piano",
  },
  {
    id: "egmont_overture",
    title: "Egmont Overture",
    artist: "Beethoven",
    src: `${BLOB_STORAGE_URL}beethoven-egmont_overture.mp3`,
    genre: "Classical",
  },
  {
    id: "hungarian_dance",
    title: "Hungarian Dance No. 5",
    artist: "Brahms",
    src: `${BLOB_STORAGE_URL}brahms-hungarian_dance.mp3`,
    genre: "Classical",
  },
  {
    id: "violin_concerto",
    title: "Violin Concerto",
    artist: "Brahms",
    src: `${BLOB_STORAGE_URL}brahms-violin_concerto.mp3`,
    genre: "Classical",
  },
  {
    id: "conquest_of_paradise",
    title: "Conquest of Paradise",
    artist: "Vangelis",
    src: `${BLOB_STORAGE_URL}conquest_of_paradise.mp3`,
    genre: "Soundtrack",
  },
  {
    id: "mountain_king",
    title: "In the Hall of the Mountain King",
    artist: "Grieg",
    src: `${BLOB_STORAGE_URL}grieg-in_the_hall_of_the_mountain_king.mp3`,
    genre: "Classical",
  },
  {
    id: "water_music",
    title: "Water Music",
    artist: "Handel",
    src: `${BLOB_STORAGE_URL}handel-water_music.mp3`,
    genre: "Classical",
  },
  {
    id: "oboenkonzert",
    title: "Oboenkonzert D Moll",
    artist: "Lebrun",
    src: `${BLOB_STORAGE_URL}lebrun-oboenkonzert_d_moll.mp3`,
    genre: "Classical",
  },
  {
    id: "despacito",
    title: "Despacito",
    artist: "Luis Fonsi",
    src: `${BLOB_STORAGE_URL}louis_fonsi-despacito.mp3`,
    genre: "Pop",
  },
  {
    id: "wedding_march",
    title: "Wedding March",
    artist: "Mendelssohn",
    src: `${BLOB_STORAGE_URL}mendelssohn-wedding_march.mp3`,
    genre: "Classical",
  },
  {
    id: "csardas",
    title: "Csardas",
    artist: "Vittorio Monti",
    src: `${BLOB_STORAGE_URL}monti-csardas.mp3`,
    genre: "Classical",
  },
  {
    id: "can_can",
    title: "Can Can",
    artist: "Offenbach",
    src: `${BLOB_STORAGE_URL}offenbach-can_can.mp3`,
    genre: "Classical",
  },
  {
    id: "la_campanella",
    title: "La Campanella",
    artist: "Paganini",
    src: `${BLOB_STORAGE_URL}paganini-la_campanella.mp3`,
    genre: "Classical",
  },
  {
    id: "pirates",
    title: "Pirates of the Caribbean",
    artist: "Klaus Badelt",
    src: `${BLOB_STORAGE_URL}pirates_of_the_caribbean.mp3`,
    genre: "Film Score",
  },
  {
    id: "bacchanale",
    title: "Bacchanale",
    artist: "Saint-Saens",
    src: `${BLOB_STORAGE_URL}saint_saens-bacchanale.mp3`,
    genre: "Classical",
  },
  {
    id: "schubert_3",
    title: "Symphony No. 3",
    artist: "Schubert",
    src: `${BLOB_STORAGE_URL}schubert-3_sinfonie.mp3`,
    genre: "Classical",
  },
  {
    id: "see_you_again",
    title: "See You Again",
    artist: "Wiz Khalifa ft. Charlie Puth",
    src: `${BLOB_STORAGE_URL}see_you_again.mp3`,
    genre: "Pop",
  },
  {
    id: "sibelius_violin",
    title: "Violin Concerto",
    artist: "Sibelius",
    src: `${BLOB_STORAGE_URL}sibelius-violin_concerto.mp3`,
    genre: "Classical",
  },
  {
    id: "carrol_bells",
    title: "Carol of the Bells",
    artist: "Lindsey Stirling",
    src: `${BLOB_STORAGE_URL}stirling-carrol_of_the_bells.mp3`,
    genre: "Violin",
  },
  {
    id: "papaoutai",
    title: "Papaoutai",
    artist: "Stromae",
    src: `${BLOB_STORAGE_URL}stromae-papaoutai.mp3`,
    genre: "Pop",
  },
  {
    id: "in_this_shirt",
    title: "In This Shirt",
    artist: "The Irrepressibles",
    src: `${BLOB_STORAGE_URL}the_irrepressibles-in_this_shirt.mp3`,
    genre: "Indie",
  },
  {
    id: "summer",
    title: "Summer (Four Seasons)",
    artist: "Vivaldi",
    src: `${BLOB_STORAGE_URL}vivaldi-summer.mp3`,
    genre: "Classical",
  },
  {
    id: "winter",
    title: "Winter (Four Seasons)",
    artist: "Vivaldi",
    src: `${BLOB_STORAGE_URL}vivaldi-winter.mp3`,
    genre: "Classical",
  },
];
