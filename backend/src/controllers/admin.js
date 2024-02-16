let sequelizeInstance; 

function setSequelize(sequelize) {
    sequelizeInstance = sequelize;
}
async function registerUser(req, res) {
    try {
        if (!sequelizeInstance) {
            return res.status(500).json({ message: "Sequelize instance is not set." });
        }

        const { professor_id, student_id, first_name, last_name, email, bio, phone_number, role } = req.body;

        if (role !== 'professor' && role !== 'student') {
            return res.status(400).json({ message: "Invalid role. Role should be either 'professor' or 'student'." });
        }
        if (!first_name || !last_name || !email || !first_name.trim() || !last_name.trim() || !email.trim()) {
            return res.status(400).json({ message: "All fields (first name, last name, email) are required and cannot be blank." });
        }

        let Model, userAttributes;
        if (role === 'professor') {
            Model = require('../models/Professor')(sequelizeInstance);
            userAttributes = {
                professor_id,
                first_name,
                last_name,
                email,
                bio: bio || null, // Explicitly set to null if not provided
                phone_number: phone_number || null // Explicitly set to null if not provided
            };
        } else { // role === 'student'
            Model = require('../models/Student')(sequelizeInstance);
            userAttributes = {
                student_id,
                first_name,
                last_name,
                email,
                bio: bio || null, // Explicitly set to null if not provided
                phone_number: phone_number || null // Explicitly set to null if not provided
            };
        }

        const newUser = await Model.create(userAttributes);

        res.json({ message: "User Registration Successful!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



async function enrollStudent(req, res) {
    try {
        if (!sequelizeInstance) {
            return res.status(500).json({ message: "Sequelize instance is not set." });
        }

        const { student_id, course_id } = req.body;

        if (!student_id || !course_id) {
            return res.status(400).json({ message: "Both student_id and course_id are required." });
        }

        const Student = require('../models/Student')(sequelizeInstance);
        const studentExists = await Student.findByPk(student_id);
        if (!studentExists) {
            return res.status(404).json({ message: "Student not found." });
        }

        const Course = require('../models/Course')(sequelizeInstance);
        const courseExists = await Course.findByPk(course_id);
        if (!courseExists) {
            return res.status(404).json({ message: "Course not found." });
        }

        const Enrollment = require('../models/Enrollment')(sequelizeInstance);
        const existingEnrollment = await Enrollment.findOne({ where: { student_id, course_id } });

        if (existingEnrollment) {
            return res.status(409).json({ message: "The student is already enrolled in this course." });
        }

        const newEnrollment = await Enrollment.create({ student_id, course_id });
        res.json({ message: "Student enrolled successfully.", enrollment: newEnrollment });
    } catch (error) {
        console.error("Error enrolling student in course:", error);
        res.status(500).json({ message: error.message });
    }
}
async function updateStudent(req, res) {
    try {
        // Check if Sequelize instance is available
        if (!sequelizeInstance) {
            return res.status(500).json({ message: "Sequelize instance is not set." });
        }

        // Get student_id from request parameters
        const { student_id } = req.params;

        // Fetch the student with the provided student_id from the database
        const Student = require('../models/Student')(sequelizeInstance);
        let student = await Student.findByPk(student_id);

        // Check if student exists
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Update student details
        const { first_name, last_name, email } = req.body;
        student = await student.update({
            first_name,
            last_name,
            email
        });

        // Send success response with updated student details
        res.json({ message: "Student details updated successfully.", student });
    } catch (error) {
        // If an error occurs, send an error response
        res.status(500).json({ message: error.message });
    }
}
async function deleteStudent(req, res) {
    try {
  
        if (!sequelizeInstance) {
            return res.status(500).json({ message: "Sequelize instance is not set." });
        }

   
        const { student_id } = req.params;

        const Student = require('../models/Student')(sequelizeInstance);
        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }
        await student.destroy();

        res.json({ message: "Student deleted successfully." });
    } catch (error) {

        res.status(500).json({ message: error.message });
    }


}

async function deleteProfessor(req, res) {
    try {
  
        if (!sequelizeInstance) {
            return res.status(500).json({ message: "Sequelize instance is not set." });
        }

   
        const { professor_id } = req.params;

        const Professor = require('../models/Professor')(sequelizeInstance);
        const professor = await Professor.findByPk(professor_id);
        console.log(professor)

        if (!professor) {
            return res.status(404).json({ message: "Profesor not found." });
        }
        await professor.destroy();

        res.json({ message: "Profesor deleted successfully." });
    } catch (error) {

        res.status(500).json({ message: error.message });
    }


}

module.exports = {
    setSequelize,
    registerUser,
    enrollStudent,
    updateStudent,
    deleteStudent,
    deleteProfessor
};
