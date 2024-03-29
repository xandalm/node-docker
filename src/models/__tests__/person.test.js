
import { toBeArray } from 'jest-extended';
import DB from '../connection.js';
import Person from '../person.js';

expect.extend({ toBeArray });

describe("Person", () => {
    describe("Check attributes type", () => {
        it('check ', async () => {
            const person = new Person();
            const response = await person.list();
            console.log(response);
            expect(typeof response).toEqual(expect.toBeArray());
        });
    })
});

afterAll(async () => {
    await DB.end();
});