document.addEventListener('DOMContentLoaded',()=>{
  // Animate progress bars on scroll
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const progressBars=entry.target.querySelectorAll('.progress');
        progressBars.forEach(bar=>{
          const width=bar.style.width;
          bar.style.width='0';
          setTimeout(()=>{
            bar.style.width=width
          },100)
        })
      }
    })
  },{threshold:0.1});
  
  document.querySelectorAll('.resume-section').forEach(section=>{
    observer.observe(section)
  })
})