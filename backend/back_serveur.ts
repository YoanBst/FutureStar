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
    if (firstName!= null && lastName !=null){
      baseURL = `https://api.balldontlie.io/v1/players?first_name=${firstName}&last_name=${lastName}`; 
    };
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

































console.log(`Oak back server running on port ${options.port}`);



app.use(router.routes());

app.use(router.allowedMethods())
await app.listen(options);
