import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const client = new Client({
  user: "postgres",
  password: "123",
  database: "bdd",
  hostname: "localhost",
  port: 5432,
});

await client.connect();

await client.queryObject(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT UNIQUE NOT NULL
    );
`);

console.log("Table users créée avec succés, ou déja existante")

await client.end();