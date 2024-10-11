import express from 'express';
// import {faker} from '@faker-js/faker';
import liverpoolFCData from './data.js';

const app = new express();

// app.get('/:id', (req, res) => {
//     faker.seed(Number(req.params.id));
//     const randomName = faker.person.fullName();
//     res.send("Hello World");
// });

app.get('/', (res, req) => {
    const { clubName, established, stadium, capacity, manager } = liverpoolFCData;
    res.json({
        clubName,
        established,
        stadium,
        capacity
    });
});

app.listen(8989, () => {
    console.log('started on 8989');
});