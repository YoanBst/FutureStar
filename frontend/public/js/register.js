    document.getElementById('register').addEventListener('click', async (event) => {
        
        
        event.preventDefault();
        const username = document.getElementById("username");
        const password = document.getElementById("password")
        
        
        
        const response = await fetch("http://localhost:3000/register",{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username : username.value, password: password.value })
        });
        const data = await response.json();
        if (response.status === 409){
            alert("Ce nom d'utilisateur est déja pris !");
        }else if (response.ok){
            alert("Inscription réussie; Veuillez-vous connecter.")
            document.location.href="http://localhost:8000/html/login.html"; 
        }else{
            alert("Erreur lors de l'inscription")
        }
        
        
});
    
