import mysql from 'mysql2'

type SQLStrings =  {
    select?: string
    where?: string
    update?: string
    delete?: boolean
    total?: string
    insert?: string
    limit?: string
    order?: string
    on?: string
    selecton?: string
    join?: string
    subjoin?: string
    match?: string
}

export class SampleSQLBuilder<T = any> {
    private strs : SQLStrings = {}
    private mapper: any[]
    private name: string
    constructor(name: string, mapper: any[]) {
        this.name = name
        this.mapper = mapper.filter(m => !!m.name)
        
    }
    public SELECT(type?: 'INC' | 'EXC' | string[] | string , names?: string[]) {
        if (Array.isArray(type)) {
            names = type
            type = 'INC'
        }
        if (type && !['INC', 'EXC'].includes(type)) {
            const m = type.split(/\[|\]/)
            if (['INC', 'EXC'].includes(m[0])) {
                type = m[0]
            } else {
                type = 'INC'
            }
            names = m[1].split(/\,\s*/)
        }
        let mapper = this.mapper
        const filterNames = names
        if (filterNames && type === 'INC') {
            mapper = this.mapper.filter(m => filterNames.includes(m.name))
        } else if (filterNames && type === 'EXC') {
            mapper = this.mapper.filter(m => !filterNames.includes(m.name))
        }
        const select = mapper.map(m => m.column 
            ? mysql.format('?? as ??', [m.column, m.name]) 
            : mysql.format('??', [m.name])
        ).join(', ')
        const selecton = mapper.map(m => m.column 
            ? mysql.format('?? as ??', [`${this.name}.${m.column}`, `${this.name}.${m.name}`]) 
            : mysql.format('??', `${this.name}.${m.name}`)
        ).join(', ')

        this.strs.select = select
        this.strs.selecton = selecton

        return this
    }
    public INSERT(model: any) {
        const keys = Object.keys(model)
        const mapper = this.mapper.filter(m => !m.primary && keys.includes(m.name) && model[m.name])
        const insert = mapper.map(m => mysql.format('??', [m.column || m.name])).join(', ')
        const values = mapper.map(m => mysql.format('?', [model[m.name]])).join(', ')
        this.strs = { insert: `(${insert}) VALUES(${values})` }
        return this
    }
    public UPDATE(model: any) {
        const keys = Object.keys(model)
        const mapper = this.mapper.filter(m => {
            const editable = typeof m.editable === 'undefined' ? true : m.editable
            return editable && !m.primary && keys.includes(m.name) && model[m.name]
        })
        const update = mapper.map(m => mysql.format('??=?', [m.column || m.name, model[m.name]])).join(', ')
        this.strs.update = update
        return this
    }
    public MATCH(query?: any) {
        const keys = Object.keys(query)
        const mapper = this.mapper.filter(m => keys.includes(m.name) && query[m.name])
        const columns = mapper.map(m => mysql.format('??', [m.column || m.name ])).join(', ')
        const values = mapper.map(m => {
            return query[m.name]
        }).join(' ')

        this.strs.match = mysql.format(`MATCH(${columns}) AGAINST(? IN BOOLEAN MODE)`, [values])
        return this
    }
    public WHERE(type: 'AND' | 'OR' | any, query?: any) {
        if (!query) {
            query = type
            type = 'AND'
        }
        const keys = Object.keys(query)
        const mapper = this.mapper.filter(m => keys.includes(m.name) && query[m.name])
        const where = mapper.map(m => {
            const v = query[m.name]
            if (!Array.isArray(v)) {
                return mysql.format('??=?', [m.column || m.name, v])
            } else {
                const placeholders = v.map(() => '?').join(', ')
                return mysql.format(`?? IN (${placeholders})`, [m.column || m.name, ...v])
            }
        }).join(` ${type} `)
        this.strs.where = where 
        return this
    }
    public ORDER(orderStr: string | string[], ...others: string[]) {
        let orderStrs = Array.isArray(orderStr) ? orderStr : [orderStr]
        orderStrs = orderStrs.concat(others)
        const orders = orderStrs.map(o => {
            const [ name, type ] = o.split('\.')
            return { name, type: type.toUpperCase() }
        }).filter(o => o.name 
            && ['ASC', 'DESC'].includes(o.type) 
            && this.mapper.find(m => m.name === o.name)
        )
        const order = orders.map(o => mysql.format(`?? ${o.type}`, [o.name])).join(', ')
        this.strs.order = order
        return this
    }
    public TOTAL(name: string = 'total') {
        this.strs.total = mysql.format('FOUND_ROWS() as ??', [name])
        return this
    }
    public DELETE() {
        this.strs.delete = true
        return this
    }
    public LIMIT(num: number = 1, offset?: number) {
        if (!offset) {
            this.strs.limit = mysql.format('?', [num])
        } else {
            this.strs.limit = mysql.format('?, ?', [offset, num])
        }
        return this
    }

    public JOIN(type: 'INNER' | 'LEFT' | string, ...builders: string[]) {
        if (!['INNER', 'LEFT'].includes(type)) {
            builders = [type as string].concat(builders)
            type = 'INNER'
        }
        const { strs, name } = this
        const maps = builders.map(str => JSON.parse(str) as [string, SQLStrings])
        const [sname, sstr] = maps[0]

        const subjoin = mysql.format(`${type} JOIN ?? ON ${strs.on}=${sstr.on}`, [sname])
        let join = mysql.format(`?? ${subjoin}`, [name])

        if (builders.length > 1) {
            join = maps.slice(1).reduce((rs, map) => {
                const [xname, xstr] = map
                const xsubjoin = mysql.format(`${type} JOIN ?? ON ${strs.on}=${xstr.on}`, [xname])
                return `(${rs}) ${xsubjoin}`
            }, join)
        }
        
        this.strs.join = join
        this.strs.subjoin = subjoin
        this.strs.select = [strs.selecton].concat(maps.map(([_, m]) => m.selecton)).join(', ')
        return this
    }

    public ON(name: string) {
        this.strs.on = mysql.format('??', [`${this.name}.${name}`])
        return this
    }
    
    public END() {
        const { select, update, delete: _delete, insert } = this.strs
        let sql = ''
        if ([select, update, _delete, insert].filter(Boolean).length > 1) {
            sql = ''
        } else if (select) {
            sql = this.createSelectSQL()
        } else if (update) {
            sql = this.createUpdateSQL()
        } else if (_delete) {
            sql = this.createDeleteSQL()
        } else if (insert) {
            sql = this.createInsertSQL()
        }
        this.strs = {}
        return sql
    }

    private createSelectSQL() {
        const { strs, name } = this
        let selectStr = strs.select
        if (strs.on && !strs.join) {
            return JSON.stringify([this.name, this.strs])
        }
        if (strs.total) {
            selectStr = `SQL_CALC_FOUND_ROWS ${selectStr}`
        }
        let sql = ''
        if (strs.join) {
            sql = `SELECT ${selectStr} FROM ${strs.join}`
        } else {
            sql = mysql.format(`SELECT ${selectStr} FROM ??`, [name])
        }
        if (strs.match) {
            sql += ` WHERE ${strs.match}`
        }
        if (strs.match && strs.where) {
            sql += ` AND ${strs.where}`
        } else if (strs.where) {
            sql += ` WHERE ${strs.where}`
        }
        if (strs.order) {
            sql += ` ORDER BY ${strs.order}`
        }
        if (strs.limit) {
            sql += ` LIMIT ${strs.limit}`
        }
        if (strs.total) {
            sql += `; SELECT ${strs.total}`
        }
        return sql
    }
    private createInsertSQL() {
        const { strs, name } = this
        return mysql.format(`INSERT INTO ??${strs.insert}`, [name])
    }
    
    private createUpdateSQL() {
        const { strs, name } = this
        let sql = mysql.format(`UPDATE ?? SET ${strs.update}`, [name])
        if (strs.where) {
            sql += ` WHERE ${strs.where}`
        }
        return sql
    }

    private createDeleteSQL() {
        const { strs, name } = this
        let sql = mysql.format(`DELETE FROM ??`, [name])
        if (strs.where) {
            sql += ` WHERE ${strs.where}`
        }
        return sql
    }
}

export function createSampleSQL(name: string, mapper: any) {
    return new SampleSQLBuilder(name, mapper)
}
