import express from 'express';

const port = process.env.PORT || 3000;
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile('index.html', { root: '/home/chilli/code/projects/Flip4' });
    console.log("hey");
});

const app: express.Application = express();
app.use(router);
app.use(express.static('public'));
app.use(express.static('out'));

app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
});