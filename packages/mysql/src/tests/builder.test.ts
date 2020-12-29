import { createSampleSQL } from '../modules/builder'
import { createSampleDSL } from '../modules/dsl'

const SQL1 = createSampleSQL('table_1', [
    { name: 'id', primary: true },
    { name: 'text' },
    { name: 'kana', editable: false },
    { name: 'testName', column: 't_name', editable: true },
])

const SQL2 = createSampleSQL('table_222222', [
    { name: 'id', primary: true },
    { name: 'text', editable: true },
    { name: 'kana', editable: false },
    { name: 'testName', column: 't_name', editable: true },
])

const SQL3 = createSampleSQL('3table', [
    { name: 'id', primary: true },
    { name: 'text', editable: true },
    { name: 'kana', editable: false },
    { name: 'testName', column: 't_name', editable: true },
])

const DSL1 = createSampleDSL('table_1', [
    { name: 'id', primary: true },
    { name: 'text', editable: true },
    { name: 'kana', editable: false },
    { name: 'testName', column: 't_name', editable: true },
])

const DSL2 = createSampleDSL('table_222222', [
    { name: 'id', primary: true },
    { name: 'text', editable: true },
    { name: 'kana', editable: false },
    { name: 'testName', column: 't_name', editable: true },
])



const model1 = {
    id: 1,
    text: 'text',
    kana: 111,
    testName: 'testName',
    xxx: 'xxx',
}

const SAMPLE_SQLS1: string[][] = [[
    SQL1.SELECT().END(), 
    DSL1`SELECT`,
    "SELECT `id`, `text`, `kana`, `t_name` as `testName` FROM `table_1`",
],[
    SQL1.INSERT(model1).END(),
    DSL1`INSERT ${model1}`,
    "INSERT INTO `table_1`(`text`, `kana`, `testName`) VALUES('text', 111, 'testName')",
],[
    SQL1.UPDATE(model1).WHERE({ id: 1 }).END(), 
    DSL1`UPDATE ${model1} WHERE ${{ id: 1 }}`,
    "UPDATE `table_1` SET `text`='text', `testName`='testName' WHERE `id`=1",
],[
    SQL1.UPDATE(model1).END(),
    DSL1`UPDATE ${model1}`,
    "UPDATE `table_1` SET `text`='text', `testName`='testName'"
],[
    SQL1.DELETE().END(), 
    DSL1`DELETE`,
    "DELETE FROM `table_1`"
], [
    SQL1.DELETE().WHERE("OR", { id: 1, name: '123' }).END(),
    DSL1`DELETE WHERE OR ${{ id: 1, name: '123' }}`,
    "DELETE FROM `table_1` WHERE `id`=1",
], [
    SQL1.END(),
    ''
], [
    SQL1.SELECT().DELETE().END(),
    ''
]]

const SAMPLE_SQLS2: string[][] = [[
    SQL1.DELETE().WHERE(model1).END(), 
    DSL1`DELETE WHERE ${model1}`,
    "DELETE FROM `table_1` WHERE `id`=1 AND `text`='text' AND `kana`=111 AND `testName`='testName'",
],[
    SQL1.DELETE().WHERE('OR', model1).END(), 
    "DELETE FROM `table_1` WHERE `id`=1 OR `text`='text' OR `kana`=111 OR `testName`='testName'",
],[
    SQL1.DELETE().WHERE({ id: [1, 2]}).END(), 
    "DELETE FROM `table_1` WHERE `id` IN (1, 2)"
],[
    SQL1.SELECT("EXC", ['id']).LIMIT().END(), 
    DSL1`SELECT EXC[id] LIMIT`,
    "SELECT `text`, `kana`, `t_name` as `testName` FROM `table_1` LIMIT 1"
],[
    SQL1.SELECT(['id']).WHERE({ id: 1 }).END(), 
    DSL1`SELECT ${['id']} WHERE ${{ id: 1 }}`,
    "SELECT `id` FROM `table_1` WHERE `id`=1"
],[
    SQL1.SELECT("INC", ['id']).ORDER('id.desc').LIMIT(1, 2).END(), 
    DSL1`SELECT INC[id] ORDER id.desc LIMIT 1 2`,
    "SELECT `id` FROM `table_1` ORDER BY `id` DESC LIMIT 2, 1"
],[
    SQL1.SELECT(['id']).ORDER(['id.desc', 'kana.asc']).LIMIT(1).END(), 
    DSL1`SELECT INC[id] ORDER id.desc kana.asc LIMIT 1`,
    "SELECT `id` FROM `table_1` ORDER BY `id` DESC, `kana` ASC LIMIT 1"
],[
    SQL1.SELECT(['id']).TOTAL().END(), 
    DSL1`SELECT [id] TOTAL`,
    "SELECT SQL_CALC_FOUND_ROWS `id` FROM `table_1`; SELECT FOUND_ROWS() as `total`"
],[
    SQL1.SELECT(['id']).TOTAL('totalName').END(), 
    DSL1`SELECT [id] TOTAL totalName`,
    "SELECT SQL_CALC_FOUND_ROWS `id` FROM `table_1`; SELECT FOUND_ROWS() as `totalName`"
],]


const SAMPLE_SQLS3: string[][] = [[
    SQL1.SELECT(['id']).ON('id').END(), 
    "[\"table_1\",{\"select\":\"`id`\",\"selecton\":\"`table_1`.`id`\",\"on\":\"`table_1`.`id`\"}]"
],[
    SQL1.SELECT(['id']).ON('id').JOIN(
        SQL2.SELECT(['id']).ON('id').END(),
    ).END(),
    DSL1`SELECT [id] ON id JOIN ${DSL2`SELECT [id] ON id`}`,
    "SELECT `table_1`.`id`, `table_222222`.`id` FROM `table_1` INNER JOIN `table_222222` ON `table_1`.`id`=`table_222222`.`id`",
],[
    SQL1.SELECT(['id']).ON('id').JOIN(
        SQL2.SELECT(['id']).ON('id').END(),
        SQL3.SELECT(['id']).ON('id').END(),
    ).END(),
    "SELECT `table_1`.`id`, `table_222222`.`id`, `3table`.`id` FROM (`table_1` INNER JOIN `table_222222` ON `table_1`.`id`=`table_222222`.`id`) INNER JOIN `3table` ON `table_1`.`id`=`3table`.`id`"
],[
    SQL1.SELECT(['id']).ON('id').JOIN(
        SQL2.SELECT(['id']).ON('id').END(),
        SQL3.SELECT(['id']).ON('id').END(),
        SQL2.SELECT(['id']).ON('id').END(),
    ).END(),
    "SELECT `table_1`.`id`, `table_222222`.`id`, `3table`.`id`, `table_222222`.`id` FROM ((`table_1` INNER JOIN `table_222222` ON `table_1`.`id`=`table_222222`.`id`) INNER JOIN `3table` ON `table_1`.`id`=`3table`.`id`) INNER JOIN `table_222222` ON `table_1`.`id`=`table_222222`.`id`"
],[
    SQL1.SELECT(['id']).ON('id').JOIN(
        "LEFT",
        SQL2.SELECT(['id']).ON('id').END(),
        SQL3.SELECT(['id']).ON('id').END(),
    ).END(),
    "SELECT `table_1`.`id`, `table_222222`.`id`, `3table`.`id` FROM (`table_1` LEFT JOIN `table_222222` ON `table_1`.`id`=`table_222222`.`id`) LEFT JOIN `3table` ON `table_1`.`id`=`3table`.`id`"
]]

function testSQL(sqls: string[][]) {
    sqls.forEach(([sql, str, dsl]) => {
        if (dsl) {
            expect(str).toBe(dsl)
        }
        expect(sql).toBe(str)
        
    })
}

test('test sample sqls 1', () => {
    testSQL(SAMPLE_SQLS1)
})

test('test sample sqls 2', () => {
    testSQL(SAMPLE_SQLS2)
})

test('test sample sqls 3', () => {
    testSQL(SAMPLE_SQLS3)
})