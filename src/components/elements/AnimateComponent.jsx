import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const AnimateComponent = ({
  entry = "fadeInUp",
  exit = "fadeOutDown",
  ease = "power2.out",
  duration = 1000,
  delay = 0,
  className,
  children,
  onScroll = false,
  threshold = 0.4,
  rootMargin = "-25%",
  resetOnLeave = false,
}) => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(!onScroll);
  const hasAnimated = useRef(false);

  // Convert ms to s for GSAP
  const durationInSec = duration / 1000;
  const delayInSec = delay / 1000;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Immediately hide the element before it paints
    gsap.set(el, { autoAlpha: 0 });

    if (onScroll) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated.current) {
              setIsInView(true);
              if (!resetOnLeave) {
                hasAnimated.current = true;
              }
            } else if (!entry.isIntersecting && resetOnLeave) {
              setIsInView(false);
              hasAnimated.current = false;
            }
          });
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }

    return undefined;
  }, [onScroll, threshold, rootMargin, resetOnLeave]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isInView) return;

    // Animate entry
    const [fromVars, toVars] = getEntryGSAPVars(entry);
    const tl = gsap.timeline();

    tl.fromTo(
      el,
      { ...fromVars, autoAlpha: 0 },
      {
        ...toVars,
        autoAlpha: 1,
        ease,
        duration: durationInSec,
        delay: delayInSec,
      }
    );

    // Cleanup animation on unmount
    return () => {
      if (onScroll && !resetOnLeave) return; // Don't animate exit if scroll-triggered and not resetting

      const exitVars = getExitGSAPVars(exit);
      gsap.to(el, {
        ...exitVars,
        ease,
        duration: durationInSec,
        delay: delayInSec,
      });
    };
  }, [
    isInView,
    entry,
    exit,
    ease,
    durationInSec,
    delayInSec,
    onScroll,
    resetOnLeave,
  ]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Animation helper functions
function getEntryGSAPVars(animation) {
  switch (animation) {
    case "fadeInUp":
      return [
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1 },
      ];
    case "fadeInDown":
      return [
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1 },
      ];
    case "fadeInLeft":
      return [
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1 },
      ];
    case "fadeInRight":
      return [
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1 },
      ];
    default:
      return [
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1 },
      ];
  }
}

function getExitGSAPVars(animation) {
  switch (animation) {
    case "fadeOutUp":
      return { y: -50, opacity: 0 };
    case "fadeOutDown":
      return { y: 50, opacity: 0 };
    case "fadeOutLeft":
      return { x: -50, opacity: 0 };
    case "fadeOutRight":
      return { x: 50, opacity: 0 };
    default:
      return { y: 50, opacity: 0 };
  }
}

export default AnimateComponent;
