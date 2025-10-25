import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import 'Navigation' is no longer needed, but 'Pagination' and 'Autoplay' are
import { Pagination, Autoplay } from 'swiper/modules'; 

// --- TEMPORARY: Placeholder Images ---
const heroImages = [
  'https://cdn.pixabay.com/photo/2014/07/10/17/18/large-home-389271_1280.jpg',
  'https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg',
  'https://cdn.pixabay.com/photo/2019/09/15/14/22/fishermans-hut-4478427_1280.jpg',
];

const HeroCarousel = () => {
  return (
    <div className="w-full aspect-video bg-gray-300">
      <Swiper
        // Updated modules list (removed Navigation)
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        // The 'navigation' prop has been removed
        className="w-full h-full"
      >
        {heroImages.map((src, index) => (
          <SwiperSlide key={index}>
            <img 
              src={src} 
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover" // Fills the slide
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;