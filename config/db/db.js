import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    host: 'localhost',
    database: 'pcProject',
    password: '123456',
    port: 5432,
    user: 'postgres'
});

async function connectDB() {
    await pool.connect(); 
    console.log('Database connected successfully'); 
}

function query(text, params) {
    return pool.query(text, params); 
}

async function disconnectDB() {
    await pool.end(); 
    console.log('Database disconnected successfully'); 
}

const queryDB = async(query_text,variables_value)=>{
    try{
        const res = await query(query_text, variables_value);
        return res.rows[0];
    }catch(error){
        console.error(error)
    }
}

const queryAll = async(query_text,variables_value)=>{
    try{
        const res = await query(query_text, variables_value);
        return res.rows;
    }catch(error){
        console.error(error)
    }
}


export {queryAll, queryDB};
