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

export const TRACKS: Track[] = [
  {
    id: "dvorak_8",
    title: "Symphony No. 8",
    artist: "Dvorak",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/dvorak-8_symphony.mp3",
    genre: "Classical",
  },
  {
    id: "heart_of_courage",
    title: "Heart of Courage",
    artist: "Two Steps From Hell",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/heart_of_courage.mp3",
    genre: "Film Score",
  },
  {
    id: "interstellar",
    title: "Interstellar Theme",
    artist: "Hans Zimmer",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/interstellar.mp3",
    genre: "Film Score",
  },
  {
    id: "oppenheimer",
    title: "Can You Hear The Music",
    artist: "Ludwig Göransson",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/oppenheimer-can_you_hear_the_music.mp3",
    genre: "Film Score",
  },
  {
    id: "fur_elise",
    title: "Für Elise",
    artist: "Beethoven",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/beethoven-fur_elise.mp3",
    genre: "Classical Piano",
  },
  {
    id: "moonlight_sonata",
    title: "Moonlight Sonata",
    artist: "Beethoven",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/beethoven-moonlight_sonata.mp3",
    genre: "Classical Piano",
  },
  {
    id: "fantaisie_impromptu",
    title: "Fantaisie Impromptu",
    artist: "Chopin",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/chopin-fantaisie_impromptu.mp3",
    genre: "Classical Piano",
  },
  {
    id: "comptine",
    title: "Comptine d'un autre été",
    artist: "Yann Tiersen",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/comptine_dun_autre_ete.mp3",
    genre: "Piano",
  },
  {
    id: "experience",
    title: "Experience",
    artist: "Ludovico Einaudi",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/einaudi-experience.mp3",
    genre: "Contemporary Piano",
  },
  {
    id: "fly",
    title: "Fly",
    artist: "Ludovico Einaudi",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/einaudi-fly.mp3",
    genre: "Contemporary Piano",
  },
  {
    id: "nuvole_bianche",
    title: "Nuvole Bianche",
    artist: "Ludovico Einaudi",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/einaudi-nuvole_bianche.mp3",
    genre: "Contemporary Piano",
  },
  {
    id: "una_mattina",
    title: "Una Mattina",
    artist: "Ludovico Einaudi",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/einaudi-una_mattina.mp3",
    genre: "Contemporary Piano",
  },
  {
    id: "river_flows_in_you",
    title: "River Flows In You",
    artist: "Yiruma",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/yiruma-river_flows_in_you.mp3",
    genre: "Piano",
  },
  {
    id: "egmont_overture",
    title: "Egmont Overture",
    artist: "Beethoven",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/beethoven-egmont_overture.mp3",
    genre: "Classical",
  },
  {
    id: "hungarian_dance",
    title: "Hungarian Dance No. 5",
    artist: "Brahms",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/brahms-hungarian_dance.mp3",
    genre: "Classical",
  },
  {
    id: "violin_concerto",
    title: "Violin Concerto",
    artist: "Brahms",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/brahms-violin_concerto.mp3",
    genre: "Classical",
  },
  {
    id: "conquest_of_paradise",
    title: "Conquest of Paradise",
    artist: "Vangelis",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/conquest_of_paradise.mp3",
    genre: "Soundtrack",
  },
  {
    id: "mountain_king",
    title: "In the Hall of the Mountain King",
    artist: "Grieg",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/grieg-in_the_hall_of_the_mountain_king.mp3",
    genre: "Classical",
  },
  {
    id: "water_music",
    title: "Water Music",
    artist: "Handel",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/handel-water_music.mp3",
    genre: "Classical",
  },
  {
    id: "oboenkonzert",
    title: "Oboenkonzert D Moll",
    artist: "Lebrun",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/lebrun-oboenkonzert_d_moll.mp3",
    genre: "Classical",
  },
  {
    id: "despacito",
    title: "Despacito",
    artist: "Luis Fonsi",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/louis_fonsi-despacito.mp3",
    genre: "Pop",
  },
  {
    id: "wedding_march",
    title: "Wedding March",
    artist: "Mendelssohn",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/mendelssohn-wedding_march.mp3",
    genre: "Classical",
  },
  {
    id: "csardas",
    title: "Csardas",
    artist: "Vittorio Monti",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/monti-csardas.mp3",
    genre: "Classical",
  },
  {
    id: "can_can",
    title: "Can Can",
    artist: "Offenbach",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/offenbach-can_can.mp3",
    genre: "Classical",
  },
  {
    id: "la_campanella",
    title: "La Campanella",
    artist: "Paganini",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/paganini-la_campanella.mp3",
    genre: "Classical",
  },
  {
    id: "pirates",
    title: "Pirates of the Caribbean",
    artist: "Klaus Badelt",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/pirates_of_the_caribbean.mp3",
    genre: "Film Score",
  },
  {
    id: "bacchanale",
    title: "Bacchanale",
    artist: "Saint-Saens",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/saint_saens-bacchanale.mp3",
    genre: "Classical",
  },
  {
    id: "schubert_3",
    title: "Symphony No. 3",
    artist: "Schubert",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/schubert-3_sinfonie.mp3",
    genre: "Classical",
  },
  {
    id: "see_you_again",
    title: "See You Again",
    artist: "Wiz Khalifa ft. Charlie Puth",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/see_you_again.mp3",
    genre: "Pop",
  },
  {
    id: "sibelius_violin",
    title: "Violin Concerto",
    artist: "Sibelius",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/sibelius-violin_concerto.mp3",
    genre: "Classical",
  },
  {
    id: "carrol_bells",
    title: "Carol of the Bells",
    artist: "Lindsey Stirling",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/stirling-carrol_of_the_bells.mp3",
    genre: "Violin",
  },
  {
    id: "papaoutai",
    title: "Papaoutai",
    artist: "Stromae",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/stromae-papaoutai.mp3",
    genre: "Pop",
  },
  {
    id: "in_this_shirt",
    title: "In This Shirt",
    artist: "The Irrepressibles",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/the_irrepressibles-in_this_shirt.mp3",
    genre: "Indie",
  },
  {
    id: "summer",
    title: "Summer (Four Seasons)",
    artist: "Vivaldi",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/vivaldi-summer.mp3",
    genre: "Classical",
  },
  {
    id: "winter",
    title: "Winter (Four Seasons)",
    artist: "Vivaldi",
    src: "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/vivaldi-winter.mp3",
    genre: "Classical",
  },
];
