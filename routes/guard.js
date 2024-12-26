import express from 'express';
import students from '../studentsInfo.json' assert { type: 'json' };
import { queryDB } from '../config/db/db.js'; 

const router = express.Router();
router.use(express.static('../public'));

let guardId;
let guard;
let query_text;
let variables_value;

router.get('/', async(req, res) => {
    guardId = req.query.id;
    query_text = `SELECT * FROM guards
                   WHERE guard_id = $1`
    variables_value=[guardId]
    try{
        guard =  await queryDB(query_text,variables_value);
        if(guard){
            res.render('safeGuard.ejs', { guard });
        }
    }catch(error){
        return res.status(500).send('Internal server Error');
    }
    
});
// end point for laptop verification 
router.post('/verify', async(req, res) => {
    let {pc_serial, student_id } = req.body;

    pc_serial = pc_serial.toLowerCase().trim();
    student_id = student_id.toLowerCase().trim()

    query_text = `SELECT serial, user_id 
                  FROM pcs
                  WHERE serial = $1`
    variables_value=[pc_serial]

    try{
        const pc =  await queryDB(query_text,variables_value);
        if (pc) {
            if (pc.user_id === student_id) {
                return res.json({ message: 'Pass 🗸' });
            } else {
                return res.status(404).json({ error: `Alert! The owner of this PC <br>is ${pc.user_id.toUpperCase()}` });
            }
        } else {
            return res.status(404).json({ error: 'This PC is not registered.' });
        }
        }catch(error){
            return res.status(500).json({ error: 'Internal server error, try again!' });
        }

});

//end point for student info

router.post('/studentInfo', (req, res) => {
    const studentId = req.body.studentId;
    const studentInfo = students.find(student => student.id == studentId);
    if (!studentInfo) {
        return res.status(404).json({ error: 'Student with this id is not found.' });
    }else{
        return res.json(studentInfo);
    }
});


//end point for change password
router.post('/changePassword', async(req, res) => {
    let {current_password, new_password} = req.body;
    new_password.trim();

    if (current_password !== guard.password) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    query_text = `UPDATE guards
                  SET password = $1
                  WHERE guard_id = $2`;
    variables_value = [new_password, guardId]
    try{
        await queryDB(query_text, variables_value)
        guard.password = new_password;
            return res.json({ message: 'Password changed successfully.' });

    }catch(error){
        return res.status(500).json({ error: 'Internal server error, try again!' });
    }
    
});




export default router;