CREATE TABLE students (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(100),
    department VARCHAR(100),
    year VARCHAR(100),
    email VARCHAR(100),
    pic_url TEXT,
    password TEXT
);

CREATE TABLE pcs (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(100) NOT NULL UNIQUE,
    model VARCHAR(100),
    pic_url TEXT,
    user_id VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES students(id)
);

CREATE TABLE lostpcs (
    id SERIAL PRIMARY KEY,
    pc_serial VARCHAR(100) NOT NULL,
    reported_date VARCHAR(100),
    FOREIGN KEY (pc_serial) REFERENCES pcs(serial)
);
