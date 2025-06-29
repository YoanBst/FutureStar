    document.getElementById('login').addEventListener('click', async (event) => {
        
        
        event.preventDefault();
        const username = document.getElementById("username");
        const password = document.getElementById("password")
        
        
        
        const response = await fetch("http://localhost:3000/login",{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username : username.value, password: password.value })
        });
        const data = await response.json();
        if (response.status === 409 || response.status === 410){
            alert("Erreur : identifiants ou mot de passe incorrect.");
        }else if (response.ok){
            document.cookie = `auth_token=${data.auth_token}; path=/;`;
            document.location.href="http://localhost:8000/html/accueil.html"; 
        }else{
            alert("Erreur lors de la connexion.")
        }
        
        
});
    