export const modelSlots = {
  room: { enabled: false, src: "/models/room/room.glb", scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
  bookshelf: { enabled: false, src: "/models/bookshelf/bookshelf.glb", scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
  book: { enabled: false, src: "/models/book/book.glb", scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] },
  plant: { enabled: false, src: "/models/plant/plant.glb", scale: [1, 1, 1], position: [0, 0, 0], rotation: [0, 0, 0] }
};

export const textureSlots = {
  wood: {
    enabled: false,
    baseColor: "/textures/wood/wood_basecolor.jpg",
    normal: "/textures/wood/wood_normal.jpg",
    roughness: "/textures/wood/wood_roughness.jpg",
    ao: "/textures/wood/wood_ao.jpg"
  },
  floor: {
    enabled: false,
    baseColor: "/textures/floor/floor_basecolor.jpg",
    normal: "/textures/floor/floor_normal.jpg",
    roughness: "/textures/floor/floor_roughness.jpg",
    ao: "/textures/floor/floor_ao.jpg"
  },
  wall: {
    enabled: false,
    baseColor: "/textures/wall/wall_basecolor.jpg",
    normal: "/textures/wall/wall_normal.jpg",
    roughness: "/textures/wall/wall_roughness.jpg"
  },
  bookLeather: {
    enabled: false,
    baseColor: "/textures/book-leather/book_basecolor.jpg",
    normal: "/textures/book-leather/book_normal.jpg",
    roughness: "/textures/book-leather/book_roughness.jpg"
  }
};

export const environmentSlot = {
  enabled: false,
  files: "/hdr/studio_library.hdr",
  background: false,
  intensity: 0.8
};

export const sceneBehavior = {
  mode: "static-shelves-dynamic-books",
  staticShelves: {
    enabled: true,
    allowShelfRotationAnimation: false,
    allowShelfCarousel: false,
    allowShelfDrag: false
  },
  dynamicBooks: {
    enabled: true,
    hoverLift: true,
    selectedBookExtraction: true,
    selectedGlow: true,
    keyboardSelection: true
  }
};
