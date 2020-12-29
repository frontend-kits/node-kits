import { createVaildator } from "../modules/vaildator"

const xUser1 = [
    { name: 'name', type: 'number', rules: []},
    { name: 'desc|name2', type: 'string', rules: []},
    { name: 'xxx', type: 'array|string', rules: []},
]

const mockQuery = {
    name: '123',
    name2: '123',
}

const mockBody = {
    xxx: ['321', '456']
}
const vaild =  createVaildator(mockQuery, mockBody)

test('test vailator base', () => {
    expect(vaild(xUser1)).toMatchObject({ 
        name: 123, 
        desc: '123',
        xxx: ['321', '456'],
    })
})