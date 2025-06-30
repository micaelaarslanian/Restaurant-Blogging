import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "restaurants",
  password: "Verdeesmeralda1995",
  port: 5432,
});
db.connect();

//middleware to parse the body of the request
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// let items = [
//     {id: 1, restaurant: "Pophams Bakery", comments_about: "Best bakery in London", rating: 5},
//     {id: 2, restaurant: "Dishoom", comments_about: "Best indian food in London", rating: 5}
// ]

//prints the index page with the items
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id DESC");
    res.render("index.ejs", { items: result.rows });

  } catch (error) {
    console.error("Error occurred while retrieving items:", error);
    res.status(500).send("Error occurred while retrieving items");
  }
});

//creates a new item when the form is submitted and redirects to the index page
app.post("/add", async (req, res) => {
  const restaurant = req.body.restaurant;
  const name = req.body.name;
  const comments_about = req.body.review;
  const ranking = req.body.ranking;

  try {
    // Insert the item with the reviewer's name
    const resultOfNewEntry = await db.query(
      "INSERT INTO items (restaurant, comments_about, ranking, name) VALUES ($1, $2, $3, $4) RETURNING *",
      [restaurant, comments_about, ranking, name]
    );
    console.log(resultOfNewEntry.rows[0]);
    res.redirect("/");
  } catch (error) {
    console.error("Error occurred while inserting item:", error);
    res.status(500).send("Error occurred while inserting item");
  }
});

//deletes an item when the delete button is clicked and redirects to the index page
app.post("/delete", async (req, res) => {
  let idOfItemToBeDeleted = req.body.itemIdToBeDeleted;

  try {
    await db.query("DELETE FROM items WHERE id = $1", [idOfItemToBeDeleted]);
    console.log("Item with id " + idOfItemToBeDeleted + " deleted");
    res.redirect("/");

  } catch (error) {
    console.error("Error occurred while deleting item:", error);
    res.status(500).send("Error occurred while deleting item");
  }
});

//UPDATES an item when the update button is clicked and redirects to the index page
app.post("/edit", async (req, res) => {
  let id = req.body.itemIdToBeEdited;
  console.log("id to be edited: " + id);
  let restaurant = req.body.updatedRestaurant;
  let comments_about = req.body.updatedReview;
  let ranking = req.body.updatedRanking;
  let name = req.body.updatedName;

  try {
    await db.query("UPDATE items SET restaurant = $1, comments_about = $2, ranking = $3, name = $4 WHERE id = $5",
      [restaurant, comments_about, ranking, name, id]);
    res.redirect("/");

  } catch (error) {
    console.error("Error occurred while updating item:", error);
    res.status(500).send("Error occurred while updating item");
  }
});

//FILTERS data by ranking asc (highest ranking first)
app.get("/filter/asc", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY ranking ASC");
    res.render("index.ejs", { items: result.rows });
  } catch (error) {
    console.error("Error occurred while filtering items:", error);
    res.status(500).send("Error occurred while filtering (asc) items");
  }
});


//FILTERS data by ranking desc (lowest ranking first)
app.get("/filter/desc", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY ranking DESC");
    res.render("index.ejs", { items: result.rows });
  } catch (error) {
    console.error("Error occurred while filtering items:", error);
    res.status(500).send("Error occurred while filtering (desc) items");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
