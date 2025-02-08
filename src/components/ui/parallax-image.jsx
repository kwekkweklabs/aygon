import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxImage({
  imageUrl = "/api/placeholder/800/600",
  speed = 0.5,
  className = "",
}) {
  const { scrollY } = useScroll();

  // Transform scrollY into our desired parallax offset
  const y = useTransform(
    scrollY,
    [0, 1000],
    [0, 200 * speed] // Adjust these values to control parallax intensity
  );
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-0 size-full">
        <img
          src={imageUrl}
          alt="Parallax"
          className="object-cover w-full h-full"
        />
      </motion.div>
    </div>
  );
}
