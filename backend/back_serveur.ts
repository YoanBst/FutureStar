import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

import { create, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const IP = Deno.args.length >= 2 ? Deno.args[1] : "127.0.0.1";
const router = new Router();
const app = new Application();
const client = new Client({
  user: "postgres",
  password: "123",
  database: "bdd",
  hostname: "localhost",
  port: 5432,
});

await client.connect();

app.use(
  oakCors({
    origin: "http://localhost:8000", // autorise le frontend sur le port 8000
    credentials: true,
  })
);


router.get("/", (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = "Deuxième tentative";
});

//Vérifie que le port est bien renseigné
if (Deno.args.length < 1) {
  console.log(`Usage: $ deno run --allow-net server.ts PORT [CERT_PATH KEY_PATH]`);
  Deno.exit();
}



const options = {port: Deno.args[0]}

if (Deno.args.length >= 3) {
  options.secure = true;
  options.cert = await Deno.readTextFile(Deno.args[1]);
  options.key = await Deno.readTextFile(Deno.args[2]);
  console.log(`SSL conf ready (use https)`);
}


function get_hash(password){
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds); 
}

const keyRaw = "super_secret_key_123";
const secretKey = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(keyRaw),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"],
);

const teamsList = [
  { id: 1, full_name: "Atlanta Hawks" },
  { id: 2, full_name: "Boston Celtics" },
  { id: 3, full_name: "Brooklyn Nets" },
  { id: 4, full_name: "Charlotte Hornets" },
  { id: 5, full_name: "Chicago Bulls" },
  { id: 6, full_name: "Cleveland Cavaliers" },
  { id: 7, full_name: "Dallas Mavericks" },
  { id: 8, full_name: "Denver Nuggets" },
  { id: 9, full_name: "Detroit Pistons" },
  { id: 10, full_name: "Golden State Warriors" },
  { id: 11, full_name: "Houston Rockets" },
  { id: 12, full_name: "Indiana Pacers" },
  { id: 13, full_name: "LA Clippers" },
  { id: 14, full_name: "Los Angeles Lakers" },
  { id: 15, full_name: "Memphis Grizzlies" },
  { id: 16, full_name: "Miami Heat" },
  { id: 17, full_name: "Milwaukee Bucks" },
  { id: 18, full_name: "Minnesota Timberwolves" },
  { id: 19, full_name: "New Orleans Pelicans" },
  { id: 20, full_name: "New York Knicks" },
  { id: 21, full_name: "Oklahoma City Thunder" },
  { id: 22, full_name: "Orlando Magic" },
  { id: 23, full_name: "Philadelphia 76ers" },
  { id: 24, full_name: "Phoenix Suns" },
  { id: 25, full_name: "Portland Trail Blazers" },
  { id: 26, full_name: "Sacramento Kings" },
  { id: 27, full_name: "San Antonio Spurs" },
  { id: 28, full_name: "Toronto Raptors" },
  { id: 29, full_name: "Utah Jazz" },
  { id: 30, full_name: "Washington Wizards" }
];

function findTeamId(nameOfTheTeam){
  for (let i = 0; i<teamsList.length; i++){
    if (teamsList[i].full_name === nameOfTheTeam){
      return teamsList[i].id;
    }
  }
}




// Routes

router.post("/register", async (ctx) => {
  try {
    const { username, password } = await ctx.request.body({ type: "json" }).value;

    // Vérifie si le username existe déjà
    const result = await client.queryObject(
      "SELECT 1 FROM users WHERE username = $1",
      [username]
    );
    if (result.rows.length > 0) {
      ctx.response.status = 409; 
      ctx.response.body = { status: "error", message: "Username already exists" };
      return;
    }

    // Sinon, on insère
    const hashedPassword = await bcrypt.hash(password);
    await client.queryObject(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );
    ctx.response.body = { status: "ok" };
  } catch (e) {
    ctx.response.status = 500;
    ctx.response.body = { status: "error", message: e.message };
  }
});



router.post("/login", async (ctx) => {
  try{
    const { username, password } = await ctx.request.body({ type: "json" }).value;

    const result = await client.queryObject(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (result.rows.length ===0) {
        ctx.response.status = 409;
        ctx.response.body = { status: "error", message : "Utilisateur inconnu." };
        return;
    }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password)

      if (!valid){
        ctx.response.status = 410;
        ctx.response.body = { status: "error", message: "Mot de passe incorrect."};
        return;
      }


      const header: Header = { alg: "HS256", typ: "JWT" };
      const payload: Payload = {
        username: user.username,
        exp: getNumericDate(60*60), // expire dans 1h
      };
      console.log("USER:", user);
      const token = await create(header, payload, secretKey);

        
      ctx.response.status = 200;
      ctx.response.body = { status: "ok", auth_token: token };

    
  }catch (e){
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = { status : "error", message: e.message}
  }
});



router.get("/api/nba/teams", async (ctx) => {
  try {
    const API_KEY = "71827bd2-05f4-4679-8897-688b8ee92c6a";
    const URL = "https://api.balldontlie.io/v1/teams";
    const response = await fetch(URL, {
      headers: { "Authorization": API_KEY }
    });
    const text = await response.text();
    console.log("Réponse balldontlie:", text); 
    ctx.response.body = JSON.parse(text);
  } catch (e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération des équipes NBA", details: e.message };
  }
});



router.get("/api/nba/players", async (ctx) => {
  try {
    const API_KEY = "71827bd2-05f4-4679-8897-688b8ee92c6a"; 
    let baseURL = "https://api.balldontlie.io/v1/players";
    const params: string[] = [];
    const firstName = ctx.request.url.searchParams.get("first_name");
    const lastName = ctx.request.url.searchParams.get("last_name");
    const position = ctx.request.url.searchParams.get("position");
    const height = ctx.request.url.searchParams.get("height");
    const team = ctx.request.url.searchParams.get("team");
    const teamId = findTeamId(team);
    const per_page="100";

    if (!firstName && lastName){
      baseURL = `https://api.balldontlie.io/v1/players?search=${lastName}&per_page=${per_page}`;
    }
    else if (firstName && !lastName){
      baseURL = `https://api.balldontlie.io/v1/players?search=${firstName}&per_page=${per_page}`;
    }
    // Recherche par prénom + nom uniquement
    else if (firstName && lastName ) {
      baseURL = `https://api.balldontlie.io/v1/players?first_name=${firstName}&last_name=${lastName}&per_page=${per_page}`;
    }else if (!firstName && !lastName && team !== "team" && position !== "Position : none") {
      if (!teamId) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Equipe inconnue" };
        return;
      }
      baseURL = `https://api.balldontlie.io/v1/players?team_ids[]=${teamId}&position=${position}&per_page=${per_page}`;
  }
        // Uniquement club
    else if (!firstName && !lastName && team !== "team") {
      if (!teamId){
        ctx.response.status = 400;
        ctx.response.body = { error : "Equipe inconnue"};
        return;
      }
      
      baseURL = `https://api.balldontlie.io/v1/players?team_ids[]=${teamId}&per_page=${per_page}`;
    }
    
    else if (!firstName && !lastName && (!position || position === "Position : none") && (!team || team === "team")) {
      baseURL = `https://api.balldontlie.io/v1/players?per_page=${per_page}`;
    }
    else {
      baseURL = `https://api.balldontlie.io/v1/players?per_page=${per_page}`;
  }
    


    
    const response = await fetch(baseURL, {
      headers: { "Authorization": API_KEY }
    });

    const text = await response.text();
    console.log("Réponse balldontlie:", text);
    const data = JSON.parse(text);
    

    ctx.response.body = data;
  } catch (e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération du joueur NBA", details: e.message };
  }
});




router.get("/api/nba/teams", async (ctx) =>{
  const API_KEY = "71827bd2-05f4-4679-8897-688b8ee92c6a"; 
  const baseURL = "https://api.balldontlie.io/v1/teams"
  try {
    const response = await fetch(baseURL, {
      headers: { "Authorization": API_KEY }
    });

    const text = await response.text();
    console.log("Réponse balldontlie:", text);
    const data = JSON.parse(text);
    

    ctx.response.body = data;
  } catch (e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération du joueur NBA", details: e.message };
  }

});



router.get("/api/nba/games", async (ctx) =>{
  const API_KEY = "71827bd2-05f4-4679-8897-688b8ee92c6a"; 
  const params: string[] = [];
  const team_game = ctx.request.url.searchParams.get("team");
  const season = ctx.request.url.searchParams.get("season");
  const teamId = findTeamId(team_game);
  
  const baseURL = `https://api.balldontlie.io/v1/games?team_ids[]=${teamId}&seasons[]=${season}&per_page=100`
  try {

    console.log("team_game:", team_game, "teamId:", teamId, "season:", season);
    console.log("URL envoyée à balldontlie:", baseURL);
    const response = await fetch(baseURL, {
      headers: { "Authorization": API_KEY }
    });

    const text = await response.text();
    console.log("Réponse balldontlie:", text);
    const data = JSON.parse(text);
    

    ctx.response.body = data;
  } catch (e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Erreur lors de la récupération du match", details: e.message };
  }

});
































console.log(`Oak back server running on port ${options.port}`);



app.use(router.routes());

app.use(router.allowedMethods())
await app.listen(options);
