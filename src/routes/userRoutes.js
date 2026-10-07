const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')

router.get('/me', authMiddleware, userController.me)
router.put('/me', authMiddleware, userController.updateMe)

router.get('/', authMiddleware, roleMiddleware('admin', 'medico'), userController.list)

router.get('/:id', authMiddleware, userController.findById)

router.post('/', authMiddleware, adminMiddleware, userController.create)
router.put('/:id', authMiddleware, adminMiddleware, userController.update)
router.delete('/:id', authMiddleware, adminMiddleware, userController.remove)

module.exports = router