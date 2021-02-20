// When the user scrolls down 80px from the top of the document, resize the navbar's padding and the logo's font size
window.onscroll = function() {scrollFunction()};

const git = document.getElementById('git')
const gra = document.getElementById('graphic')
const ece = document.getElementById('ece')
const uni = document.getElementById('unity')

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.getElementById("navbar").style.padding = "10px 10px";
    document.getElementById("navbar").style.backgroundColor = "var(--color2)";
    document.getElementById("logo").style.fontSize = "25px";
  } else {
    document.getElementById("navbar").style.padding = "80px 10px";
    document.getElementById("navbar").style.backgroundColor = "var(--color4)";
    document.getElementById("logo").style.fontSize = "5rem";
  }
}

window.addEventListener("resize", function(event) {
  console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
  // if(document.body.clientWidth < 470){
  //   document.getElementById("logo").style.fontSize = "5rem";
  // }
})

document.getElementById('card1').addEventListener('click', ()=>{
    git.classList.add('show')
    gra.classList.remove('show')
    ece.classList.remove('show')
    uni.classList.remove('show')
})

document.getElementById('card2').addEventListener('click', ()=>{
  gra.classList.add('show')
  git.classList.remove('show')
  ece.classList.remove('show')
  uni.classList.remove('show')
})

document.getElementById('card3').addEventListener('click', ()=>{
  ece.classList.add('show')
  gra.classList.remove('show')
  git.classList.remove('show')
  uni.classList.remove('show')
})

document.getElementById('card4').addEventListener('click', ()=>{
  uni.classList.add('show')
  gra.classList.remove('show')
  ece.classList.remove('show')
  git.classList.remove('show')
})
