
import { toBeArray } from 'jest-extended';
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