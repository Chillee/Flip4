import express from 'express';
import path from 'path';

const port = process.env.PORT || 3000;
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../') });
});

const app: express.Application = express();
app.use(router);
app.use(express.static('public'));
app.use(express.static('out'));

app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
});