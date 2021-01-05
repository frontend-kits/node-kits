import { createVaildator, IValidatorCheck } from "../modules/vaildator"

const xUser1: IValidatorCheck[] = [
    { name: 'name', type: 'number', rules: []},
    { name: 'desc', param:'name2', type: 'string', rules: []},
    { name: 'xxx', type: 'string[]', rules: []},
]
const xUser2: IValidatorCheck[] = [
    { name: 'name' },
    { name: 'name2' },
    { name: 'desc', param: 'name', type: 'string' },
    { name: 'descx', param: 'name3', type: 'string[]' },
    { name: 'xxx' },
]
const mockQuery = {
    name: '123',
    name2: '123abc',
}

const mockBody = {
    xxx: ['abc', '456']
}
const vaild = createVaildator(mockQuery, mockBody)

test('test vailator base', () => {
    expect(vaild(xUser1)).toMatchObject({ 
        name: 123, 
        desc: '123abc',
        xxx: ['abc', '456'],
    })
    expect(vaild(xUser2)).toMatchObject({ 
        name: 123, 
        desc: '123',
        name2: '123abc',
        xxx: ['abc', 456],
        descx: [],
    })
})