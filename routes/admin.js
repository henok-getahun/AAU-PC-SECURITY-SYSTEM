import express from 'express';
import multer from 'multer';
import students from '../studentsInfo.json' assert { type: 'json' };

import { queryDB } from '../config/db/db.js'; 
const router = express.Router();
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

let insert_query;
let insert_values;
let adminData;

router.get('/', async(req, res) => {
        res.render('admin'); 
});

router.get('/logout', (req, res) => res.redirect('/'));

router.post('/student', async (req, res) => {
    const studentId = req.body.studentId.trim().toLowerCase();
    const action = req.body.action;
  
    const studentInfo = students.find(student => student.id === studentId);
    if (!studentInfo) {
      return res.status(404).json({ error: 'Student with this ID not found' });
    }

    if (action === 'fetch') {
      return res.json(studentInfo);
    } else if (action === 'register') {
      try {
        insert_query = `SELECT id FROM students 
                      where id = $1`
        insert_values = [studentId]

        let result = await queryDB(insert_query,insert_values);
        if (result) {
          return res.status(400).json({ error: 'Student is already registered' });
        } else {
          try{
              insert_query =  `INSERT INTO students 
                            (id, full_name, department, year,
                              email, pic_url, password
                            ) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7)`
              insert_values = [studentInfo.id.toLowerCase(), 
                                studentInfo.full_name,
                                studentInfo.department,
                                studentInfo.year, 
                                studentInfo.email,
                                studentInfo.pic_url,
                                studentInfo.id]
              await queryDB(insert_query,insert_values);
              return res.json({ message: 'Student registered successfully' });

            }catch(error){
              return res.status(500).json({ error: 'Internal server error' });
            }
        }
      } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid action specified' });
    }
  });

  router.post('/guard', upload.single('guard_pic'), async (req, res) => {
    const guardData = {
      guard_name: req.body.guard_name.trim(),
      guard_ssn: req.body.guard_ssn.trim(),
      phone_no: req.body.phone_no.trim(),
      email: req.body.email.trim(),
      guard_id: req.body.guard_id.trim(),
      file_name: req.file ? req.file.originalname : null,
    };
    const action = req.body.action;
  
    if (action === 'fetch') {
      return res.json({ guardData });
    } else if (action === 'register') {
      try {

        insert_query =`SELECT guard_id
                     FROM guards
                     where guard_id = $1`
        insert_values =  [guardData.guard_id.toLowerCase()]

        let result = await queryDB(insert_query,insert_values);

        // let result = await query(`SELECT guard_id FROM guards where guard_id = $1`, [guardData.guard_id.toLowerCase()]);
        if (result) {
          return res.status(400).json({ error: 'Guard is already registered' });
        } else {
          try{
              insert_query =`INSERT INTO guards
                       (
                          guard_id, guard_name,
                          guard_ssn, email, file_name,
                          phone_no, password
                        ) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7)`
              insert_values = [guardData.guard_id.toLowerCase(),
                                guardData.guard_name, guardData.guard_ssn,
                                guardData.email, guardData.file_name, 
                                guardData.phone_no, 
                                guardData.guard_id.toLowerCase()]
              await queryDB(insert_query,insert_values);
              return res.json({ message: 'Guard registered successfully' });

           }catch(error){
               return res.status(500).json({ error: 'Internal server error' });
           }
          
        }
      } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid action specified' });
    }
  });
async function handleUpdate(entityType, user_id, action, res) {
    const entityId = entityType === 'student' ? 'id' : 'guard_id';
       try{
            insert_query = `SELECT * FROM ${entityType}s 
                          WHERE ${entityId} = $1`
            insert_values = [user_id]
            let result = await queryDB(insert_query,insert_values);

            if (!result) {
                return res.status(404).json({ error: `${entityType} with this ID is not registered!` });
            }
            try{
                switch (action) {
                    case 'fetch':
                        return res.json(result);
                    case 'delete':
                        try{
                          //Delete student's registered pc 
                          if(entityType === 'student'){
                              insert_query = `DELETE FROM pcs
                              WHERE user_id = $1;`
                              insert_values = [user_id]
                              await queryDB(insert_query,insert_values);
                          }
   
                          //Delete Student

                          insert_query = `DELETE FROM ${entityType}S 
                                        WHERE ${entityId} = $1`
                          insert_values = [user_id]
                          await queryDB(insert_query,insert_values);
                          return res.json({ message: `${entityType} deleted successfully` });

                        }catch(error){
                          return res.status(500).json({ error: 'Internal server error' });
                        }

                    case 'resetPassword':
                        try{
                          insert_query = `UPDATE ${entityType}S 
                                        SET password = $1 WHERE ${entityId} = $2 `
                          insert_values = [user_id, user_id]

                          await queryDB(insert_query,insert_values);
                          return res.json({ message: 'Password reset to default successfully' });

                        }catch(error){
                          return res.status(500).json({ error: 'Internal server error' });
                        }



                    default:
                        return res.status(400).json({ error: 'Invalid action specified' });

                }
            }catch(error){
                    return res.status(400).json({ error: 'Invalid action specified' });
            }
       }catch(error){
             return res.status(500).json({ error: 'Internal server error' });
       }
       
}


router.post('/updateStudent', (req, res) => {
    const studentId = req.body.studentId.toLowerCase().trim();
    const action = req.body.action;
    handleUpdate('student', studentId, action, res);

});

router.post('/updateGuard', (req, res) => {
    const guardId = req.body.guardId.toLowerCase().trim();
    const action = req.body.action;
    handleUpdate('guard', guardId, action, res);
});



router.post('/changePassword', async(req, res) => {
     let {current_password, new_password} = req.body;
        new_password.trim();
        try{
          insert_query = `SELECT * FROM admin`
          adminData = await queryDB(insert_query,[]);
        }catch(error){
          return res.status(500).json({ error: 'Internal server error' });
        }
        if (current_password !== adminData.password) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }
        insert_query = `UPDATE admin
                      SET password = $1`;
        insert_values = [new_password]
        try{
            await queryDB(insert_query, insert_values)
            adminData.password = new_password;
            return res.json({ message: 'Password changed successfully.' });
        }catch(error){
            return res.status(500).json({ error: 'Internal server error, try again!' });
        }
        
});


export default router;


