
import { toBeArray } from 'jest-extended';
import DB from '../connection.js';
import Contact from '../contact.js';

expect.extend({ toBeArray });

describe("Contact", () => {
    describe("Check methods", () => {
        it('check', async () => {
            const contact = new Contact();
            const response = await contact.list();
            console.log(response);
            expect(typeof response).toEqual(expect.toBeArray());
        });
    })
});

afterAll(async () => {
    await DB.end();
});