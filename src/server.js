const app = require('./app');

init();

async function init() {
  try {
    app.listen(3001, () => {
      console.log('Express App Listening on Port 3001');
    });
    app.use((err, req, res, next) => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    })
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
