const all = document.getElementById('all')
const present = document.getElementById('present')
const deleted = document.getElementById('deleted')

all.addEventListener('click', () =>{
    present.className = 'presentC'
    deleted.className = 'deletedC'
    all.className = 'allC active'
    let drones = document.getElementsByClassName('table-row')
    for(let i = 0; i < drones.length; i++){ 
        drones[i].style.display = 'flex'   
    }
})

present.addEventListener('click', () =>{
    all.className = 'allC'
    deleted.className = 'deletedC'
    present.className = 'presentC active'
    let drones = document.getElementsByClassName('deleted')
    for(let i = 0; i < drones.length; i++){ 
        drones[i].style.display = 'none'   
    }
    drones = document.getElementsByClassName('present')
    for(let i = 0; i < drones.length; i++){ 
        drones[i].style.display = 'flex'   
    }
})

deleted.addEventListener('click', () =>{
    present.className = 'presentC'
    all.className = 'allC'
    deleted.className = 'deletedC active'
    let drones = document.getElementsByClassName('present')
    for(let i = 0; i < drones.length; i++){ 
        drones[i].style.display = 'none'   
    }
    drones = document.getElementsByClassName('deleted')
    for(let i = 0; i < drones.length; i++){ 
        drones[i].style.display = 'flex'   
    }
})
