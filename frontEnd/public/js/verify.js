function verify(id, value) {
    fetch(`http://localhost:3000/developer/verifyandregister/verify${value}/${id}`, {
    method: 'GET',
    credentials: 'same-origin'
    })
    .then(response =>{ 
        return response.json()})
    .then(data => {
        if(data.success){
            document.getElementById(`id${id}`).style.display = 'none'
            document.getElementById(`id${id}`).disabled = true
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    })
}