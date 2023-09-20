const dotenv = require("dotenv");

dotenv.config();

const app = require("./appIndex");

app.set("port", process.env.PORT || 8080);

app.listen(8080, () => {
  console.log(`Listening on 8080`);
});