// Photos are stored in /public/photos and come from Pexels (free to use under the Pexels licence).
// The photographers' names were not recorded; credit appreciated but not required.
export interface Photo { url: string; alt: string; author: string; licence: string; page: string }
const L = "https://www.pexels.com/license/";
export const PHOTOS: Record<string, Photo> = {
  ke: { url: "/photos/mara-crossing.jpg", alt: "Wildebeest crossing a river in the Maasai Mara", author: "Pexels", licence: "Pexels licence", page: L },
  tz: { url: "/photos/serengeti-lion.jpg", alt: "A lioness walking through the grass in the Serengeti", author: "Pexels", licence: "Pexels licence", page: L },
  rw: { url: "/photos/rwanda-gorilla.jpg", alt: "A mountain gorilla in the forest in Rwanda", author: "Pexels", licence: "Pexels licence", page: L },
  zz: { url: "/photos/zanzibar-boats.jpg", alt: "Boats on the shore in Zanzibar seen from above", author: "Pexels", licence: "Pexels licence", page: L },
  sc: { url: "/photos/seychelles-pristine.jpg", alt: "A forested bay with boats in Seychelles seen from above", author: "Pexels", licence: "Pexels licence", page: L },
  mv: { url: "/photos/maldives-resort.jpg", alt: "A resort island with overwater villas in the Maldives", author: "Pexels", licence: "Pexels licence", page: L },
};
