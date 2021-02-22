function verify(id, value) {
    fetch(`https://asroot-drone.herokuapp.com/verifyandregister/verify${value}/${id}`, {
    method: 'GET',
    credentials: 'same-origin'
    })
    .then(response =>{ 
        return response.json()})
    .then(data => {
        if(data.success){
            document.getElementById(`id${id}`).style.backgroundColor = 'green'
            document.getElementById(`id${id}`).disabled = true
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById(`id${id}`).style.backgroundColor = 'red'
    })
}
