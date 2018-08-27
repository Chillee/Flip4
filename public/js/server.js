"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const port = process.env.PORT || 3000;
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: '/home/chilli/code/projects/Flip4' });
    console.log("hey");
});
const app = express_1.default();
app.use(router);
app.use(express_1.default.static('public'));
app.use(express_1.default.static('out'));
app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
});
