export const serviceCategories = [
  { slug: "spa-wellness", en: "Spa & Wellness", fr: "Spa et bien-être", image: "services/spa-wellness.jpg", services: ["Deep tissue massage", "Relaxation massage", "Facial treatment", "Body scrub", "Aromatherapy", "Hot stone massage", "Foot massage", "Wellness consultation", "Steam session", "Reflexology", "Couples massage", "Skin consultation"] },
  { slug: "beauty", en: "Beauty", fr: "Beauté", image: "services/beauty.jpg", services: ["Silk press", "Haircut", "Braids", "Natural hair care", "Manicure", "Pedicure", "Bridal makeup", "Everyday makeup", "Lash styling", "Brow shaping", "Hair colouring", "Loc maintenance"] },
  { slug: "fitness", en: "Fitness", fr: "Fitness", image: "services/fitness.jpg", services: ["Personal training", "Yoga", "Pilates", "Strength training", "Dance fitness", "Mobility session", "Group workout", "Boxing basics", "Running coaching", "Stretch session", "Core training", "Fitness consultation"] },
  { slug: "consultations", en: "Consultations", fr: "Consultations", image: "services/consultations.jpg", services: ["Business consultation", "Career coaching", "Design consultation", "Wellness consultation", "Marketing consultation", "Portfolio review", "Project planning", "Brand strategy", "Study guidance", "Financial coaching", "Technology consultation", "Event planning consultation"] },
  { slug: "photography", en: "Photography", fr: "Photographie", image: "services/photography.jpg", services: ["Portrait session", "Product photography", "Event photography", "Family portraits", "Graduation portraits", "Headshots", "Fashion shoot", "Food photography", "Maternity session", "Studio session", "Outdoor session", "Portfolio shoot"] },
  { slug: "events", en: "Events", fr: "Événements", image: "services/events.jpg", services: ["Event planning", "Venue consultation", "Decoration", "Catering consultation", "DJ session", "Live music", "Party styling", "Wedding planning", "Corporate event planning", "Sound setup", "Lighting setup", "Event coordination"] },
  { slug: "appointments", en: "Appointments", fr: "Rendez-vous", image: "services/appointments.jpg", services: ["Salon appointment", "Studio visit", "Wellness appointment", "Style consultation", "Fitting appointment", "Training appointment", "Portfolio appointment", "Business meeting", "Service consultation", "Follow-up appointment", "Planning session", "Discovery meeting"] },
  { slug: "classes", en: "Classes", fr: "Cours", image: "services/classes.jpg", services: ["Language lesson", "Art class", "Music lesson", "Coding lesson", "Cooking class", "Photography class", "Dance class", "Craft workshop", "Exam tutoring", "Writing workshop", "Design class", "Business workshop"] },
  { slug: "rentals", en: "Rentals", fr: "Locations", image: "services/rentals.jpg", services: ["Studio rental", "Meeting room", "Event space", "Camera equipment", "Lighting equipment", "Sound equipment", "Workshop space", "Creative workspace", "Training room", "Photography backdrop", "Party equipment", "Outdoor venue"] },
] as const;

export const servicePreviews = serviceCategories.flatMap(category =>
  category.services.map((title, index) => ({
    id: category.slug + "-" + index,
    title,
    category: category.slug,
    categoryName: category.en,
    image: category.image,
  })),
);

const providerNames = ["Amara", "Daniel", "Ada"];
export const providers = serviceCategories.flatMap(category =>
  providerNames.map((name, index) => ({
    id: category.slug + "-" + index,
    name,
    business: name + " · " + category.en,
    category: category.slug,
    image: category.image,
    avatar: `services/provider-${name.toLowerCase()}.jpg`,
    bio: "An independent provider offering " + category.en.toLowerCase() + " services. This is a demonstration profile.",
  })),
);
export function providerForService(service: (typeof servicePreviews)[number]) {
  const index = Number(service.id.split("-").at(-1)) % 3;
  return providers.find(provider => provider.id === service.category + "-" + index)!;
}

export function demoServicePrice(category: string) {
  const prices: Record<string, number> = {
    "spa-wellness": 18000,
    beauty: 12000,
    fitness: 15000,
    consultations: 22000,
    photography: 35000,
    events: 25000,
    appointments: 10000,
    classes: 9000,
    rentals: 40000,
  };
  return prices[category] ?? 15000;
}
