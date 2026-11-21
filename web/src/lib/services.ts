export const serviceCategories = [
  { slug: "spa-wellness", en: "Spa & Wellness", fr: "Spa et bien-être", image: "discover-salon.png", services: ["Deep tissue massage", "Relaxation massage", "Facial treatment", "Body scrub", "Aromatherapy", "Hot stone massage", "Foot massage", "Wellness consultation", "Steam session", "Reflexology", "Couples massage", "Skin consultation"] },
  { slug: "beauty", en: "Beauty", fr: "Beauté", image: "business-salon.png", services: ["Silk press", "Haircut", "Braids", "Natural hair care", "Manicure", "Pedicure", "Bridal makeup", "Everyday makeup", "Lash styling", "Brow shaping", "Hair colouring", "Loc maintenance"] },
  { slug: "fitness", en: "Fitness", fr: "Fitness", image: "discover-fitness.png", services: ["Personal training", "Yoga", "Pilates", "Strength training", "Dance fitness", "Mobility session", "Group workout", "Boxing basics", "Running coaching", "Stretch session", "Core training", "Fitness consultation"] },
  { slug: "consultations", en: "Consultations", fr: "Consultations", image: "discover-clinic.png", services: ["Business consultation", "Career coaching", "Design consultation", "Wellness consultation", "Marketing consultation", "Portfolio review", "Project planning", "Brand strategy", "Study guidance", "Financial coaching", "Technology consultation", "Event planning consultation"] },
  { slug: "photography", en: "Photography", fr: "Photographie", image: "discover-photography.png", services: ["Portrait session", "Product photography", "Event photography", "Family portraits", "Graduation portraits", "Headshots", "Fashion shoot", "Food photography", "Maternity session", "Studio session", "Outdoor session", "Portfolio shoot"] },
  { slug: "events", en: "Events", fr: "Événements", image: "discover-events.png", services: ["Event planning", "Venue consultation", "Decoration", "Catering consultation", "DJ session", "Live music", "Party styling", "Wedding planning", "Corporate event planning", "Sound setup", "Lighting setup", "Event coordination"] },
  { slug: "appointments", en: "Appointments", fr: "Rendez-vous", image: "discover-salon.png", services: ["Salon appointment", "Studio visit", "Wellness appointment", "Style consultation", "Fitting appointment", "Training appointment", "Portfolio appointment", "Business meeting", "Service consultation", "Follow-up appointment", "Planning session", "Discovery meeting"] },
  { slug: "classes", en: "Classes", fr: "Cours", image: "discover-tutor.png", services: ["Language lesson", "Art class", "Music lesson", "Coding lesson", "Cooking class", "Photography class", "Dance class", "Craft workshop", "Exam tutoring", "Writing workshop", "Design class", "Business workshop"] },
  { slug: "rentals", en: "Rentals", fr: "Locations", image: "discover-hotel.png", services: ["Studio rental", "Meeting room", "Event space", "Camera equipment", "Lighting equipment", "Sound equipment", "Workshop space", "Creative workspace", "Training room", "Photography backdrop", "Party equipment", "Outdoor venue"] },
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
