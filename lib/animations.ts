export function setupScrollAnimation() {
  if (typeof window !== 'undefined') {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with the fade-in class
    setTimeout(() => {
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach(element => {
        observer.observe(element);
      });
    }, 100);

    return () => {
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }
  
  return () => {};
}