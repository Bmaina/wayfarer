// Photos are hot-linked from Wikimedia Commons. Show the credit wherever a photo is shown.
const FP = "https://commons.wikimedia.org/wiki/Special:FilePath/";
const FILE = "https://commons.wikimedia.org/wiki/File:";
export interface Photo { url: string; alt: string; author: string; licence: string; page: string }
export const PHOTOS: Record<string, Photo> = {
  ke: { url: FP + "Wildebeests_in_the_Masaai_Mara.jpg?width=800", alt: "Wildebeest in the Maasai Mara", author: "DEMOSH", licence: "Creative Commons", page: FILE + "Wildebeests_in_the_Masaai_Mara.jpg" },
  tz: { url: FP + "Ngorongoro_Crater.jpg?width=800", alt: "Ridge at the edge of the Ngorongoro Crater", author: "William Warby", licence: "CC BY 2.0", page: FILE + "Ngorongoro_Crater.jpg" },
  rw: { url: FP + "RwandaVolcanoAndLake_cropped2.jpg", alt: "A volcano and lake in northwestern Rwanda", author: "Neil Palmer (CIAT), cropped by Amakuru", licence: "CC BY-SA 2.0", page: FILE + "RwandaVolcanoAndLake_cropped2.jpg" },
};
