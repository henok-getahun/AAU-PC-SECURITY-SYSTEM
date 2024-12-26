
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import { queryDB, queryAll} from '../config/db/db.js'; 


const router = express.Router();
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });
const pcImagesFolder = path.join(dirname(fileURLToPath(import.meta.url)),'..', 'public/images/pc-images');

router.use(express.static('../public'));



let registeredPcs = []


let studentId;
let student;
let insert_query;
let insert_values;
let pcs;


router.get('/', async(req, res) => {
        studentId = req.query.id;
        
        try{
            insert_query = `SELECT * FROM students
                            WHERE id = $1`
            insert_values=[studentId]
            student =  await queryDB(insert_query,insert_values);


            insert_query = `SELECT * FROM pcs
                            WHERE user_id = $1`
            insert_values=[studentId]
            pcs = await queryAll(insert_query,insert_values);
            if(student){
                if(pcs.length != 0){
                    res.render('student.ejs', { student, pcs:pcs });
 
                }else{
                    res.render('student.ejs', { student});

                }
            }
        }catch(error){
            return res.status(500).send('Internal server Error');
        }

});




router.post('/registerPc', upload.single('pc-image'), async(req, res) => {
     let { pc_model, pc_brand, pc_serial,student_id } = req.body;
     pc_model = pc_model.trim();
     pc_serial = pc_serial.toLowerCase().trim();
     pc_brand = pc_brand.trim();
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    const fileName = req.file.originalname;
    const filePath = path.join(pcImagesFolder, fileName);
    const imageUrl = filePath; 
    
    const pcData = {
        model: pc_model,
        brand: pc_brand,
        serial: pc_serial,
        image: imageUrl, 
        user_id: studentId
    };
    
    insert_query = `SELECT * FROM pcs
    WHERE user_id = $1`
    insert_values=[student_id]
    pcs = await queryAll(insert_query,insert_values);
    

    if (pcs.length < 3) { 
        try {
             insert_query = `SELECT serial FROM pcs WHERE serial = $1`;
             insert_values = [pc_serial];
            const result = await queryDB(insert_query, insert_values);
    
            if (!result) {
                 insert_query = `INSERT INTO pcs 
                                     (serial, brand, model, pic_url, user_id) 
                                      VALUES ($1, $2, $3, $4, $5)`;
                insert_values = [pcData.serial, pcData.brand, pcData.model, pcData.image, student_id];
                await queryDB(insert_query, insert_values);

                // pcs.push(pcData);
                return res.json({ message: 'PC registered successfully.', pcData });
            } else {
                return res.status(409).json({ error: 'The PC is already registered.' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(409).json({ error: 'You have reached the max limit (3).' }); 
    }
    

});


// Edit PC information
router.put('/pc/edit', async(req, res) => {
    let { PcSerial, PcModel, PcBrand} = req.body;
    try {
            insert_query = `UPDATE pcs
                            SET brand=$1, model=$2 
                            WHERE serial = $3
                            `;
            insert_values = [ PcBrand, PcModel, PcSerial]
            await queryDB(insert_query, insert_values);
            return res.json({ message: 'PC information updated successfully!' });

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }




});

//end point for change password
router.delete('/pc/delete', async(req, res) => {
    const {serial} = req.body;
    try {
        //delete from lostpcs if it was reported before 
        let insert_query = `DELETE FROM lostpcs WHERE pc_serial = $1`;
        await queryDB(insert_query, [serial])
        
        insert_query = `DELETE FROM pcs
                        WHERE serial = $1
                        `;
        insert_values = [serial]
        await queryDB(insert_query, insert_values);
        return res.json({ message: 'PC deleted successfully!' });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }

});


//end point for change password
router.post('/changePassword', async(req, res) => {
     let {current_password, new_password, student_id} = req.body;
        new_password.trim();       
        try{
            insert_query = `SELECT password FROM students WHERE id = $1`
            insert_values = [student_id]
            let  result = await queryDB(insert_query,insert_values);
            console.log(result.password, new_password)
            if (current_password !== result.password) {
                return res.status(401).json({ error: 'Current password is incorrect.' });
            }
            try{
                insert_query = `UPDATE students
                SET password = $1 WHERE id = $2`;
                insert_values = [new_password, student_id]
                await queryDB(insert_query, insert_values)

                return res.json({ message: 'Password changed successfully.' });
            }catch(error){
                return res.status(500).json({ error: 'Internal server error, try again!' });
            }
        }catch(error){
          return res.status(500).json({ error: 'Internal server error' });
        }
        
});


export default router;